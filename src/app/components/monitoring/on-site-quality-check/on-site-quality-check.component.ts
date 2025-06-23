import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
@Component({
    selector: 'app-on-site-quality-check',
    templateUrl: './on-site-quality-check.component.html',
    styleUrls: ['./on-site-quality-check.component.scss'],
})
export class OnSiteQualityCheckComponent {
    @Output() SavedOnSiteQualityCheckData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<{tableId: any }>();
    formData: any = {};
    fileError: string | null = null;
    fileId: any=[];
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    userName: any;
    fileAndRemark: any;
    formType = '9';
    @Input() prevTableId: any;
    appNoStatus: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        
        this.tableId = this.tableId;
        this.data = this.data;
         this.appNoStatus = this.data.applicationStatus
        this.prevTableId = this.prevTableId 
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
     this.service.fetchDetails(payload, 1, 100, 'oq_confirmation_view').subscribe(
        (response: any) => {
            const data = response.data;
            this.formSections = data.map((item: any) => {
            const filePaths = item.file_path? item.file_path.split(',').map((path: string) => path.trim()) : [];
            console.log('filePaths', filePaths);
            return {
                id: item.id,
                checklistId: item.checklist_id,
                buildingComponents: item.building_components,
                concreteAge: item.concrete_age,
                concreteGrade: item.concrete_grade_contract,
                schmidtTestHammertest: item.schmidt_hammer_test_result,
                remarks: item.remarks,
                filePaths: filePaths
            };
            });

            // ✅ Add this console to check the results
            console.log('Fetched formSections with file paths:', this.formSections);
        },
        (error) => {
            console.error('Error fetching contractor details:', error);
        }
        );

    }
    formSections = [
        {
            id: '',
            buildingComponents: '',
            concreteGrade: '',
            concreteAge: '',
            schmidtTestHammertest: '',
            remarks: '',
            file: null,
        },
    ];
    addMoreSection() {
        this.formSections.push({
            id: '',
            buildingComponents: '',
            concreteGrade: '',
            concreteAge: '',
            schmidtTestHammertest: '',
            remarks: '',
            file: null,
        });
    }

    removeSection(index: number) {
        if (this.formSections.length > 1) {
            this.formSections.splice(index, 1);
        }
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
    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];
    
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
     * Uploads the selected file to the server and updates the file ID upon success.
     * A file must be uploaded for the form to be valid.
     * If the file is uploaded successfully, the checklist ID is updated with the uploaded file ID.
     * If the checklist ID is updated successfully, the user is redirected to the "Reinforcement" page.
     * @param form The form data to be uploaded.
     */
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
          const payload = this.formSections.map((section) => ({
                id: section.id,
                buildingComponents: section.buildingComponents,
                concreteGradeContract: section.concreteGrade,
                concreteAge: section.concreteAge,
                schmidtHammerTestResult:section.schmidtTestHammertest,
            }));
      this.service.saveOnQualityData(payload,this.tableId).subscribe({
        next: (response: any) => {
          if (this.tableId) {
            this.assignCheckListId();
            this.SavedOnSiteQualityCheckData.emit({
                tableId: this.tableId,
                data: this.data,
                inspectionType: this.inspectionType,
            });
              this.router.navigate(['/monitoring/reinforcement', ]);
          }
        },
        error: (error) => {
          console.error('Error saving draft:', error);
        }
      });
    }

    /**
     * Assigns the uploaded file to the given checklist ID.
     */
    assignCheckListId() {
        const payload = this.fileId;
        this.service.saveCheckListId(this.tableId, payload).subscribe(
            (response) => {
                console.log('File ID assigned successfully:', response);
                this.createNotification();
            },
            (error) => {
                console.error('Error assigning File ID:', error);
            }
        );
    }
    /**
     * Creates a success notification to inform the user that data has been saved successfully.
     * A click event is also subscribed to log a message when the notification is clicked.
     */
    createNotification(): void {
        this.notification
            .success('Success', 'The data has been saved successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }
    onPreviousClick() {
        this.previousClicked.emit(this.tableId);
        this.router.navigate(['/monitoring/work-task-quantity']);
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
