import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
@Component({
    selector: 'app-qualification',
    templateUrl: './qualification.component.html',
    styleUrls: ['./qualification.component.scss'],
})
export class QualificationComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: any = [];
    qualificationData: any;
    message: any;
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    disableField: boolean = false;
    isFetching: boolean = false;
        @Input() workId: any;
    @Output() SavedQualificationData = new EventEmitter<{
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
        this.appNoStatus = this.data?.applicationStatus ?? null;
        this.inspectionType = this.inspectionType;
        this.workId = this.data?.id || null;
        const userDetailsString = sessionStorage.getItem('userDetails');
        this.prevTableId = this.prevTableId || this.tableId;
        if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId;
        }
        if (this.prevTableId || this.workId) {
            this.getDatabasedOnChecklistId();
        }
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
               {
        field: 'workid',
        value: this.workId,
        operator: 'AND',
        condition: '=',
        },
        ];
        this.service.fetchDetails(payload, 1, 2, 'qualification_of_subcontractors').subscribe(
                (response: any) => {
                    const data = response.data[0];
                    this.formData.contractorType = data.sub_contractor_exists;
                    this.formData.bctaRegistrationNo =
                    data.bcta_registration_no;
                    this.formData.nameOfFirm = data.sub_contractor_full_name;
                    this.formData.expiryDate = data.registration_valid_until;
                     this.formData.LicensingContractor = data.sub_contractor_licensing_compliance
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
     * Fetches contractor details based on the provided BCTA registration number.
     * Handles errors and edge cases.
     * @param viewName The name of the view to query. Defaults to 'contractor'.
     */
    FetchBCTARegDetails(viewName: string = 'contractor') {
        this.isFetching = true;
        const fieldName =
        viewName === 'contractor' ? 'contractorNo' : 'specializedFirmNo';
        const request = {
            viewName: viewName,
            pageSize: 10,
            pageNo: 1,
            condition: [
                {
                    field: fieldName,
                    value: this.formData.bctaRegistrationNo,
                },
            ],
        };
        console.log(`Fetching from ${viewName}...`, request);
        this.service.viewData(request).subscribe(
            (response: any) => {
                if (response.data?.length) {
                    // If data is found, populate the form fields
                    const data = response.data[0];
                    this.formData.expiryDate = data.expiryDate?.split('T')[0];
                    const ownerDetails = data.nameOfFirm || '';
                    const nameOnly = ownerDetails.split(' ').slice(1).join(' ');
                    this.formData.nameOfFirm = nameOnly;
                    this.disableField = true;
                    this.isFetching = false; // Stop loading
                } else if (viewName === 'contractor') {
                    // If no data is found in contractor view, retry with specializedFirm view
                    this.isFetching = false; // Stop loading
                    this.FetchBCTARegDetails('specializedFirm');
                } else {
                    // Both contractor and specializedFirm returned empty arrays
                    this.message = 'BCTA Registration Number does not exist';
                }
            },
            (error) => {
                console.error(`Error fetching from ${viewName}:`, error);
                if (viewName === 'specializedFirm') {
                    // If error occurs while fetching from specializedFirm, stop loading and show error message
                    this.isFetching = false;
                    this.message.error(
                        'Failed to fetch data. Please try again later.'
                    );
                }
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
                this.fileErrors[index] =
                    'File size must be less than or equal to 2MB.';
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
    formType = '7';
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
                const upload$ = this.service.uploadFiles(file, this.formData.remarks, this.formType, this.userName,this.workId);
                uploadObservables.push(upload$);
            }
        }  else {
        // Send dummy file instead of null
        const dummyFile = new File([new Blob()], 'empty.txt', { type: 'text/plain' });
        const upload$ = this.service.uploadFiles(dummyFile, this.formData.remarks, this.formType, this.userName,this.workId);
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
            workID: this.workId || '',
            subContractorExists: this.formData.contractorType,
            bctaRegistrationNo: this.formData.bctaRegistrationNo,
            registrationValidUntil: this.formData.expiryDate,
            subContractorFullName: this.formData.nameOfFirm,
            subContractorLicensingCompliance: this.formData.LicensingContractor,
        };

        this.service.saveAsDraft(payload).subscribe({
            next: (response: any) => {
                const parsedResponse =
                    typeof response === 'string'
                        ? JSON.parse(response)
                        : response;
                this.tableId = parsedResponse.checklistsInfo.id;
                if (this.tableId) {
                    this.assignCheckListId();
                    this.SavedQualificationData.emit({
                        tableId: this.tableId,
                        data: this.data,
                        inspectionType: this.inspectionType,
                    });
                    this.router.navigate(['/monitoring/work-task-quantity']);
                }
            },
            error: (error) => {
                console.error('Error saving draft:', error);
            },
        });
    }
    assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service.saveCheckListId(this.tableId,this.workId, payload).subscribe(
            (response) => {
                console.log('File ID assigned successfully:', response);
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
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/work-progress']);
    }

    /**
     * Downloads a file from the server based on the provided filePath.
     * @param filePath The file path on the server to download the file from.
     */

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
