import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { NzIconModule, NzIconService } from 'ng-zorro-antd/icon';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-onsite-facilitiesand-management',
    templateUrl: './onsite-facilitiesand-management.component.html',
    styleUrls: ['./onsite-facilitiesand-management.component.scss'],
})
export class OnsiteFacilitiesandManagementComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: any = [];
    Id: any;
    @Output() dataSaved = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<{ ownerId: any }>();
    data: any = {};
    userId: any;
    userName: any;
    @Input() tableId: any;
    @Input() workInformationdata: any;
    @Input() prevTableId: any;
    @Input() inspectionType: any;
    @Input() applicationStatus: any;
    @Input() datas: any;
    @Input() workType: any;
    @Input() ownerId: any;
    @Input() Previousdata: any;
    @Input() workId: any;
    showErrorMessage: any;
    checkListId: any;
    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];
    appNoStatus: any;
    formType = '4';
    constructor(
        private iconService: NzIconService,
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        // Get user details from session storage safely
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            try {
                const userDetails = JSON.parse(userDetailsString);
                this.userId = userDetails.userId;
                this.userName = userDetails.username;
            } catch (e) {
                console.error(
                    'Error parsing userDetails from sessionStorage',
                    e
                );
            }
        }
        if (this.workType === 'OTHERS') {
            this.appNoStatus =
                this.workInformationdata?.applicationStatus || null;
            this.prevTableId =
                this.prevTableId ||
                this.workInformationdata?.checklist_id ||
                null;
            this.data = this.datas || this.workInformationdata;
        } else {
            const WorkDetail = this.service.getData('BctaNo') || {};
            this.appNoStatus =
                WorkDetail.data?.applicationStatus ||
                this.applicationStatus ||
                null;
            this.workId = this.workId || null;

            this.prevTableId =
                this.prevTableId || WorkDetail.data?.checklist_id || null;
            this.tableId =
                WorkDetail?.workId || WorkDetail?.checklist_id || null;
            this.data = WorkDetail?.data || this.datas || null;
            //this.egptenderId = this.data.referenceNo || this.data.egpTenderId;
        }
        if (this.prevTableId || this.workId) {
            this.getDatabasedOnChecklistId();
        }
    }
    pageNo: number = 1;
    pageSize: number = 10;
    viewName: string = 'onsite_facilities_and_management';
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
        this.service
            .fetchDetails(payload, this.pageNo, this.pageSize, this.viewName)
            .subscribe(
                (response: any) => {
                    const data = response.data[0];
                    this.prevTableId = data.checklist_id;
                    this.formData.projectSignBoard =
                        data.project_sign_installed;
                    this.formData.siteOffice = data.site_office_available;
                    this.formData.siteStore = data.site_store_available;
                    this.formData.workerAccommodation =
                        data.workers_accommodation_available;
                    this.formData.potableWater = data.potable_water_access;
                    this.formData.sanitationFacilities =
                        data.proper_sanitation_facilities;
                    this.formData.apsMaintained = data.aps_maintained_by_agency;
                    this.formData.siteMeetingDocumented =
                        data.meetings_conducted_and_documented;
                    this.formData.meetingRemarks = data.remarks;
                    if (data.file_path) {
                        this.formData.filePathList = data.file_path
                            .split(',')
                            .map((path) => path.trim());

                        this.formData.fileIdList = data.file_id
                            .split(',')
                            .map((id) => id.trim());

                        // 🔽 Add this line: Check if all paths are 'NO_PATH'
                        this.formData.allPathsNoFile =
                            this.formData.filePathList.every(
                                (path) => path === 'NO_PATH'
                            );

                        console.log('filePathList', this.formData.filePathList);
                        console.log('fileIdList', this.formData.fileIdList);
                        console.log(
                            'allPathsNoFile',
                            this.formData.allPathsNoFile
                        );
                    }
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }

    deleteFile(fileId: string, index: number) {
        this.service.deleteFile(fileId).subscribe(
            (response) => {
                console.log('File deleted successfully:', response);
                this.getDatabasedOnChecklistId();
            },
            (error) => {
                console.error('Error deleting file:', error);
            }
        );
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
                    this.notification
                        .error(
                            'Error', // Title
                            'File not found', // Message
                            { nzDuration: 3000 } // Options (3 seconds display)
                        )
                        .onClick.subscribe(() => {
                            console.log('notification clicked!');
                        });
                } else {
                    // Handle other errors
                    this.notification.error(
                        'Error',
                        'An unexpected error occurred',
                        { nzDuration: 3000 }
                    );
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
    onPreviousClick() {
        this.previousClicked.emit(this.ownerId);
        const WorkDetail = this.service.setData(
            this.data,
            'BctaNo',
            'monitoring/WorkDetail'
        );
        this.router.navigate(['/monitoring/addworkinformation']);
    }

    /**
     * Handles the file selection event and validates the selected file.
     * If a file is selected, it checks if the file size exceeds 2MB. If the file size
     * is valid, it sets the file for upload; otherwise, it sets an error message.
     * If no file is selected, it sets an error message indicating that a file must be uploaded.
     *
     * @param event - The file input change event containing the selected file.
     */

    addFileInput() {
        this.fileInputs.push(this.fileInputs.length);
        console.log('fileInputs', this.fileInputs);
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

    /**
     * Uploads the selected file to the server and updates the file ID upon success.
     */
    // Create a static dummy file

    saveAndNext(form: NgForm) {
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
            return;
        }

        const uploadObservables = [];
        if (this.selectedFiles && this.selectedFiles.length > 0) {
            for (const file of this.selectedFiles) {
                const upload$ = this.service.uploadFiles(
                    file,
                    this.formData.meetingRemarks,
                    this.formType,
                    this.userName,
                    this.workId
                );
                uploadObservables.push(upload$);
            }
        } else {
            // Send dummy file instead of null
            const dummyFile = new File([new Blob()], 'empty.txt', {
                type: 'text/plain',
            });
            const upload$ = this.service.uploadFiles(
                dummyFile,
                this.formData.meetingRemarks,
                this.formType,
                this.userName,
                this.workId
            );
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
        const payload: any = {
<<<<<<< HEAD
            workID: this.workId || null,
=======
            workID: this.workId || "",
>>>>>>> b459d1cac8b8d087269aaa395fec24a33fcbbb9b
            inspectionId: this.userId,
            id: this.prevTableId,
            inspectionType: this.workType,
            projectSignInstalled: this.formData.projectSignBoard,
            siteOfficeAvailable: this.formData.siteOffice,
            siteStoreAvailable: this.formData.siteStore,
            workersAccommodationAvailable: this.formData.workerAccommodation,
            properSanitationFacilities: this.formData.sanitationFacilities,
            potableWaterAccess: this.formData.potableWater,
            apsMaintainedByAgency: this.formData.apsMaintained,
            meetingsConductedAndDocumented: this.formData.siteMeetingDocumented,
        };
        // //
        //   // Conditionally include egpTenderId only if workType is not 'OTHERSSSSSSSSS' and data exists
        //   if (this.workType !== 'OTHERS' && this.data) {
        //     payload.egpTenderId = parseInt(this.data.egpTenderId, 10);
        //   }
        if (this.data) {
            if (this.workType === 'PRIVATE') {
                payload.egpTenderId = this.data.BCTANo;
            } else if (this.workType !== 'OTHERS') {
                payload.egpTenderId = parseInt(this.data.egpTenderId, 10);
            }
        }

        // Conditionally include workId only if workType is 'OTHERSSSSSSSSS'
        if (this.workType === 'OTHERS') {
            payload.workInformationId = this.ownerId ;
        }
        this.service.saveAsDraft(payload).subscribe({
            next: (response: any) => {
                const parsedResponse =
                    typeof response === 'string'
                        ? JSON.parse(response)
                        : response;
                this.tableId = parsedResponse.checklistsInfo.id;
                if (this.tableId) {
                    this.assignCheckListId();
                    this.dataSaved.emit({
                        tableId: this.tableId,
                        data: this.data,
                        inspectionType: this.workType,
                    });
                    this.router.navigate(['monitoring/contract-document']);
                }
            },
            error: (error) => {
            console.error('Error saving draft:', error);
            if (error.status === 500) {
                this.createNotification('error', 'Failed to save data');
            } else {
                this.createNotification('error', error.message || 'An error occurred while saving data');
            }
        },
    });
}

    /**
     * Assigns the uploaded file to the given checklist ID.
     * The method sends a request to save the checklist ID and
     * logs the result upon success or error.
     */
assignCheckListId() {
    const payload = this.fileId;
    this.service
        .saveCheckListId(this.tableId, this.workId, payload)
        .subscribe(
            (response) => {
                this.createNotification('success');
            },
            (error) => {
                console.error('Error assigning File ID:', error);
                if (error.status === 500) {
                    this.createNotification('error', 'Failed to save checklist data');
                } else {
                    this.createNotification('error', error.message || 'An error occurred while saving checklist data');
                }
            }
        );
}

   createNotification(type: 'success' | 'error', message?: string): void {
    if (type === 'success') {
        this.notification
            .success('Success', message || 'The data has been saved successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    } else {
        this.notification
            .error('Error', message || 'Failed to save data')
            .onClick.subscribe(() => {
                console.log('error notification clicked!');
            });
    }
}
}
