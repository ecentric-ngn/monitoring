import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
@Component({
    selector: 'app-reinforcement',
    templateUrl: './reinforcement.component.html',
    styleUrls: ['./reinforcement.component.scss'],
})
export class ReinforcementComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: any = [];
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    @Output() SavedReinforcementData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    userName: any;
    fileAndRemark: any;
    @Input() prevTableId: any;
    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];
    appNoStatus: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.tableId = this.tableId;
        this.data = this.data;
        this.inspectionType = this.inspectionType;
         this.appNoStatus = this.data?.applicationStatus ?? null;
        if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId
        }
        if (this.prevTableId) {
            this.getDatabasedOnChecklistId();
        }
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userName = userDetails.username;
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
        this.service.fetchDetails(payload, 1, 10, 'reinforcement_view').subscribe(
                (response: any) => {
                    const data = response.data;
                      this.formEntries = data.map((item: any) => {
                    // Split and remove all 'NO_PATH' entries
                    let filePaths = item.file_path
                        ? item.file_path
                            .split(',')
                            .map((path: string) => path.trim())
                            .filter((path: string) => path !== 'NO_PATH')
                        : [];
                        return {
                            id: item.id,
                            rebarNumber: item.rebar_quantity_design,
                            rebarSpacing:item.longitudinal_rebar_spacing_design,
                            stirrupSpacing: item.stirrup_spacing_design,
                            concreteCover: item.concrete_cover_design,
                            remarks: item.remarks,
                            filePaths: filePaths,
                        };
                    });

                    // ✅ Add this console to check the results
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }
    /**
     * Uploads the selected file to the server.
     * Subscribes to the Observable returned by the service and
     * sets the file ID to the response.
     */
    uploadFile(): void {
        this.service.uploadFile(this.formData.uploadFile).subscribe(
            (response: string) => {
                // Set the file ID to the response from the server
                this.fileId = response;
            },
            (error: any) => {
                // Handle any errors that occur during the upload
                console.error('Error uploading!', error);
            }
        );
    }
    formEntries = [
        {
            id: '',
            rebarNumber: '',
            rebarSpacing: '',
            stirrupSpacing: '',
            concreteCover: '',
            remarks: '',
            file: null,
        },
    ];
    removeForm(index: number) {
        this.formEntries.splice(index, 1);
        this.fileErrors.splice(index, 1);
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

    addMore(): void {
        this.formEntries.push({
            id: '',
            rebarNumber: '',
            rebarSpacing: '',
            stirrupSpacing: '',
            concreteCover: '',
            remarks: '',
            file: null,
        });
        this.fileErrors.push('');
    }
    formType = '10';
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
        }  else {
        // Send dummy file instead of null
        const dummyFile = new File([new Blob()], 'empty.txt', { type: 'text/plain' });
        const upload$ = this.service.uploadFiles(dummyFile, this.formData.remarks, this.formType, this.userName);
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
  const payload = this.formEntries.map((entry) => ({
    id:entry.id,
    rebarQuantityDesign: entry.rebarNumber,
    longitudinalRebarSpacingDesign: entry.rebarSpacing,
    stirrupSpacingDesign: entry.stirrupSpacing,
    concreteCoverDesign: entry.concreteCover,
    remarks: entry.remarks,
  }));

  this.service.saveReinforcementData(payload, this.tableId).subscribe({
    next: (response: any) => {
      if (this.tableId) {
        if (this.appNoStatus === 'REJECTED') {
          this.SavedReinforcementData.emit({
            tableId: this.tableId,
            data: this.data,
            inspectionType: this.inspectionType,
          });
          this.router.navigate(['/monitoring/occupational-health-and-safty']);
        } else {
          this.assignCheckListId();
          this.SavedReinforcementData.emit({
            tableId: this.tableId,
            data: this.data,
            inspectionType: this.inspectionType,
          });
          this.router.navigate(['/monitoring/occupational-health-and-safty']);
        }
      }
    },
    error: (error) => {
      console.error('Error saving draft:', error);
    },
  });
}


    assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service.saveCheckListId(this.tableId, payload).subscribe(
            (response) => {
                this.createNotification();
            },
            (error) => {
                console.error('Error assigning File ID:', error);
            }
        );
    }

    createNotification(): void {
        this.notification
            .success('Success', 'The data has been saved successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }
    onPreviousClick() {
        this.previousClicked.emit(this.tableId);
        this.router.navigate(['/monitoring/work-progress']);
    }

    viewFile(attachment: string): void {
        this.service.downloadFile(attachment).subscribe(
            (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                const blob = new Blob(binaryData, {
                    type: response.body?.type,
                });
                const blobUrl = window.URL.createObjectURL(blob);
                const fileName = this.extractFileName(attachment);

                // Open file in new window for preview
                const newWindow = window.open(
                    '',
                    '_blank',
                    'width=800,height=600'
                );
                if (newWindow) {
                    newWindow.document.write(`
                <html>
                    <head><title>File Viewer</title></head>
                    <body style="margin:0;padding:0;display:flex;flex-direction:column;height:100%;">
                    <div style="padding:10px;text-align:right;">
                        <button onclick="downloadFile()" style="padding:8px 16px;background:#007bff;color:white;text-decoration:none;border:none;border-radius:4px;font-family:sans-serif;">Download</button>
                    </div>
                    <iframe src="${blobUrl}" style="flex-grow:1;width:100%;border:none;"></iframe>
                    <script>
                        function downloadFile() {
                        const link = document.createElement('a');
                        link.href = "${blobUrl}";
                        link.download = "${fileName}";
                        link.click();
                        }
                    </script>
                    </body>
                </html>
                `);
                } else {
                    console.error('Failed to open the new window');
                }
            },
            (error: HttpErrorResponse) => {
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
