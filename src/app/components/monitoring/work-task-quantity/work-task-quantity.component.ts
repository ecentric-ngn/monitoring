import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
@Component({
    selector: 'app-work-task-quantity',
    templateUrl: './work-task-quantity.component.html',
    styleUrls: ['./work-task-quantity.component.scss'],
})
export class WorkTaskQuantityComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: any = [];
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    @Output() SavedWorkTaskQuantityData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<any>();
    userName: any;
    @Input() prevTableId: any;
    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];
    appNoStatus: any;
  @Input() workId: any;
    constructor(private service: CommonService, private router: Router) {}

    ngOnInit() {
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userName = userDetails.username;
        }
        this.tableId = this.tableId;
        this.data = this.data;
        this.inspectionType = this.inspectionType;
        this.appNoStatus = this.data?.applicationStatus ?? null;
        this.prevTableId= this.prevTableId
         if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId
        }
        if (this.prevTableId || this.workId) {
            this.getDatabasedOnChecklistId();
        }
    }

    getDatabasedOnChecklistId() {
        const payload: any = [
            {
                field: 'checklist_id',
                value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
               {
        field: 'workid',
        value: this.workId,
        operator: 'AND',
        condition: '=',
        },
        ];
        this.service.fetchDetails(payload, 1, 2, 'work_task_quality').subscribe(
            (response: any) => {
                const data = response.data[0];
                this.formData.bookAvailable = data.site_order_book_available;
                this.formData.qualityInspectionsdocumented = data.quality_control_activities_documented;
                this.formData.materialsInspected = data.materials_inspected_before_use;
                this.formData.remarks = data.remarks;
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

    /**
     * Handles file selection event.
     * @param event The file selection event.
     */

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

    formType = '8';


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
                const upload$ = this.service.uploadFiles(file, this.formData.remarks, this.formType, this.userName, this.workId);
                uploadObservables.push(upload$);
            }
        }  else {
        // Send dummy file instead of null
        const dummyFile = new File([new Blob()], 'empty.txt', { type: 'text/plain' });
        const upload$ = this.service.uploadFiles(dummyFile, this.formData.remarks, this.formType, this.userName, this.workId);
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
       id: this.tableId,
        workID: this.workId,
       siteOrderBookAvailable: this.formData.bookAvailable,
       qualityControlActivitiesDocumented:
        this.formData.qualityInspectionsdocumented,
        materialsInspectedBeforeUse:
        this.formData.materialsInspected,
      };
    
      this.service.saveAsDraft(payload).subscribe({
        next: (response: any) => {
          const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
          this.tableId = parsedResponse.checklistsInfo.id;
          if (this.tableId) {
            this.assignCheckListId();
            this.SavedWorkTaskQuantityData.emit({
                 tableId: this.tableId,
                 data: this.data,
                 inspectionType: this.inspectionType,
            });
             this.router.navigate(['/monitoring/committed-equipment']);
          }
        },
        error: (error) => {
          console.error('Error saving draft:', error);
        }
      });
    }
    assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service.saveCheckListId(this.tableId,this.workId, payload).subscribe(
            (response) => {
                console.log('File ID assigned successfully:', response);
            },
            (error) => {
                console.error('Error assigning File ID:', error);
            }
        );
    }
    onPreviousClick() {
        this.previousClicked.emit(); // Emit event to go back to previous form
        this.router.navigate(['monitoring/qualification']);
    }
            viewFile(attachment: string): void {
            this.service.downloadFile(attachment).subscribe(
                (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                const blob = new Blob(binaryData, { type: response.body?.type });
                const blobUrl = window.URL.createObjectURL(blob);
                const fileName = this.extractFileName(attachment);
    
                // Open file in new window for preview
                const newWindow = window.open('', '_blank', 'width=800,height=600');
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
