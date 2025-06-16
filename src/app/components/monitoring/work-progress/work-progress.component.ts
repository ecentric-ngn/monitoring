import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-work-progress',
    templateUrl: './work-progress.component.html',
    styleUrls: ['./work-progress.component.scss'],
})
export class WorkProgressComponent {
    formData: any = [];
    @Output() SavedWorkProgressData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<any>();
    pageSize: number = 10;
    pageNo: number = 1;
    bctaNo: any;
    fileError: string | null = null;
    fileId: any[] = [];
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    @Input() prevTableId: any;
    userName: any;
    fileAndRemark: any;
    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];
  appNoStatus: any;

    constructor(private service: CommonService, private router: Router) {}
    ngOnInit() {
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userName = userDetails.username;
        }
        this.tableId = this.tableId;
        this.data = this.data;
         this.appNoStatus = this.data.applicationStatus
        this.inspectionType = this.inspectionType;
        this.prevTableId= this.prevTableId 
         if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId
        }
        if (this.prevTableId) {
            this.getDatabasedOnChecklistId();
        }
      
    }
    getDatabasedOnChecklistId() {
        const payload: any = [
            {
                field: 'checklist_id',
                value: this.prevTableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload, 1, 2, 'work_progress').subscribe(
            (response: any) => {
                const data = response.data[0];
                this.formData.physicalprogress = data.physical_progress;
                this.formData.financialprogress = data.financial_progress;
                this.formData.remarks= data.remarks;
                  if (data.file_path) {
                    this.formData.filePathList = data.file_path
                    .split(',')
                    .map(path => path.trim());

                    this.formData.fileIdList = data.file_id
                    .split(',')
                    .map(id => id.trim());

                    // 🔽 Add this line: Check if all paths are 'NO_PATH'
                    this.formData.allPathsNoFile = this.formData.filePathList.every(path => path === 'NO_PATH');
                }
            },
            // Error handler
            (error) => {
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }


    addFileInput() {
        this.fileInputs.push(this.fileInputs.length);
        this.fileErrors.push('');
    }

    /**
     * Handles the file selection event and validates the selected file.
     * If a file is selected, it checks if the file size exceeds 2MB. If the file size
     * is valid, it sets the file for upload; otherwise, it sets an error message.
     * If no file is selected, it sets an error message indicating that a file must be uploaded.
     *
     * @param event - The file input change event containing the selected file.
     * @param index - The index of the file input field.
     */
   onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];

        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        if (file.size > 2 * 1024 * 1024) {
        this.fileErrors[index] = 'File size must be less than or equal to 2MB.';
        this.selectedFiles[index] = null;
        input.value = ''; // Clear the input
        return;
        }

        this.selectedFiles[index] = file;
        this.fileErrors[index] = ''; // Clear error on valid file
        console.log('selectedFiles', this.selectedFiles);
    } else {
        this.fileErrors[index] = 'Please select a valid file.';
    }
    }
    removeFileInput(index: number) {
        this.fileInputs.splice(index, 1);
        this.fileErrors.splice(index, 1);
        this.selectedFiles.splice(index, 1);
    }
    /**
     * Uploads the selected file to the server.
     */

    formType = '6';

  saveAndNext(form: NgForm) {
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
            return; // Stop execution if form is invalid
        }
        // Always call uploadFiles, even if no files are selected
        const uploadObservables = [];
        if (this.selectedFiles && this.selectedFiles.length > 0) {
            for (const file of this.selectedFiles) {
                const upload$ = this.service.uploadFiles(file, this.formData.remarks, this.formType, this.userName);
                uploadObservables.push(upload$);
            }
        } else {
            // Push a dummy observable for empty file upload (e.g., null file)
            const upload$ = this.service.uploadFiles(null, this.formData.remarks, this.formType, this.userName);
            uploadObservables.push(upload$);
        }
        forkJoin(uploadObservables).subscribe({
            next: (fileIds: any[]) => {
                for (const id of fileIds) {
                    const match = id?.match?.(/[0-9a-fA-F\-]{36}/);
                    if (match) {
                        this.fileId.push(match[0]);
                    }
                }
                this.saveDraftPayload();
            },
            error: (err) => {
                console.error('Error uploading files:', err);
                this.fileError = 'File upload failed.';
            },
        });
    }

private saveDraftPayload() {
  const payload = {
    physicalProgress: this.formData.physicalprogress,
    financialProgress: this.formData.financialprogress,
    id: this.tableId,
  };
  this.service.saveAsDraft(payload).subscribe({
    next: (response: any) => {
      const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
      this.tableId = parsedResponse.checklistsInfo.id;
      if (this.tableId) {
        this.assignCheckListId();
        this.SavedWorkProgressData.emit({
            tableId: this.tableId,
            data: this.data,
            inspectionType: this.inspectionType,
        });
         this.router.navigate(['/monitoring/qualification']);
      }
    },
    error: (error) => {
      console.error('Error saving draft:', error);
    }
  });
}
assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service.saveCheckListId(this.tableId, payload).subscribe(
            (response) => {
                console.log('File ID assigned successfully:', response);
            },
            (error) => {
                console.error('Error assigning File ID:', error);
            }
        );
    }
    onPreviousClick() {
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/contract-document']);
    }

    /**
     * Downloads a file from the server based on the provided filePath.
     * @param filePath The file path on the server to download the file from.
     */
    viewFile(attachment: string): void {
        this.service.downloadFile(attachment).subscribe(
            (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                // Create a Blob from the response
                const blob = new Blob(binaryData, { type: response.body.type });
                // Generate a URL for the Blob
                const blobUrl = window.URL.createObjectURL(blob);
                // Open a new window
                const newWindow = window.open(
                    '',
                    '_blank',
                    'width=800,height=600'
                );
                if (newWindow) {
                    // Write HTML content to the new window
                    newWindow.document.write(`
                  <html>
                    <head>
                    </head>
                    <body>
                      <h1>File</h1>
                      <iframe src="${blobUrl}" width="100%" height="100%" style="border: none;"></iframe>
                    </body>
                  </html>
                `);
                    // Optionally revoke the object URL after a timeout to free up resources
                    setTimeout(() => {
                        window.URL.revokeObjectURL(blobUrl);
                    }, 100);
                } else {
                    console.error('Failed to open the new window');
                }
            },
            (error: HttpErrorResponse) => {
                // Check for specific error status
                if (error.status === 404) {
                    console.error('File not found', error);
                }
            }
        );
    }
    extractFileName(filePath: string): string {
        return (
            filePath.split('/').pop() ||
            filePath.split('\\').pop() ||
            'downloaded-file'
        );
    }
}
