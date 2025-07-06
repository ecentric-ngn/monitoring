import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    ViewChild,
} from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin } from 'rxjs';

interface Data {
    id?: string;
    name?: string;
    designation?: string;
    status?: string;
    replacementName?: string;
    replacementDesignation?: string;
    qualification?: string;
    cidNo?: number;
    uploadFile?: File | null;
    // remarks: string;
}
@Component({
    selector: 'app-list-ofhrin-contract',
    templateUrl: './list-ofhrin-contract.component.html',
    styleUrls: ['./list-ofhrin-contract.component.scss'],
})
export class ListOFHRinContractComponent {
    @ViewChild('modalRef', { static: true }) modalRef!: ElementRef;
    formData: any = {};
    @ViewChild('closeModal') closeModal: ElementRef;
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    isLoading: boolean = false;
    fileError: string | null = null;
    fileId: any = [];
    errorMessages = {
        mobile: '',
        server: '',
        notFound: '',
    };
    PocuringAgencyList: any;
    dzongkhagList: any;
    designationList: any;
    qualificationList: any;
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    // inspectionType = 'OTHERS';
    @Input() prevTableId: any;
    TableData: any = [];
    @Output() saveHumanResourceContractData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    userName: any;
    appNoStatus: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
         this.getDatabasedOnChecklistId();
        this.inspectionType = this.inspectionType;
        this.appNoStatus = this.data?.applicationStatus ?? null;
        if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        }
        if (this.prevTableId) {
            this.getDatabasedOnChecklistId();
        }
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userName = userDetails.username;
        }
        switch (this.inspectionType) {
            case 'PUBLIC':
                this.getHrListsBasedOnBctaNoEgpTenderId();
                break;
            case 'PRIVATE':
                this.getPrivateHrLists();
                break;
            case 'OTHERS':
                this.getHrListsFromCRPS();
                break;
        }
        this.getdeginationList();
        this.getQualificationList();
    }

    getDatabasedOnChecklistId() {
        const payload: any = [
            {
                field: 'checklist_id',
                value: 178,
                operator: 'AND',
                condition: '=',
            },
        ];

        this.service
            .fetchDetails(payload, 1, 100, 'human_resources_view')
            .subscribe(
                (response: any) => {
                    const data = response.data;
                    this.TableData = data.map((item: any) => {
                        return {
                            id: item.human_resource_id,
                            name: item.full_name,
                            cidNo: item.cid_no,
                            designation: item.designation,
                            qualification: item.qualification,
                            status: item.status,
                            hrId: item.human_resource_id,
                            // replacementInfo: item.status === 'REPLACED' ? {
                            //     name: item.replaced_full_name,
                            //     cidNo: item.cid_no, // if replaced CID is available separately, update this
                            //     designation: item.replaced_designation,
                            //     qualification: item.replaced_qualification
                            // } : null
                        };
                        
                    });
                },
                (error) => {
                    console.error(
                        'Error fetching human resource details:',
                        error
                    );
                }
            );
    }

    getHrListsFromCRPS() {
        const contractorhR = {
            viewName: 'contractorHr',
            pageSize: 100,
            pageNo: 1,
            condition: [
                {
                    field: 'contractorNo',
                    value: this.data.bctaregNumber,
                },

                {
                    field: 'isPartnerOrOwner',
                    value: 'N',
                },
            ],
        };
        this.service.fetchAuditData(contractorhR).subscribe(
            (response: any) => {
                this.TableData = response.data;
            },
            (error) => {}
        );
    }

    getPrivateHrLists() {
        const contractorhR = {
            viewName: 'workBidderHr',
            pageSize: 100,
            pageNo: 1,
            condition: [
                {
                    field: 'contractorId',
                    value: this.data.BCTANo,
                },
                {
                    field: 'workId',
                    value: this.data.id,
                },
            ],
        };
        this.service.fetchAuditData(contractorhR).subscribe(
            (response: any) => {
                this.TableData = response.data;
            },
            (error) => {}
        );
    }

    /**
     * Handles file selection event.
     * @param event The file selection event.
     */

    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];

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
    expandedRowId: string | null = null;
    onStatusChange(event: any, item: any) {
        const selectedStatus = event.target.value;
        // item.status = selectedStatus;
        if (selectedStatus === 'Replaced') {
            this.expandedRowId = item.id; // `item.id` must be uniquely set for each item
        } else {
            this.expandedRowId = null;
        }
    }

    getHrListsBasedOnContractorNo() {
        const designation = {
            viewName: 'workBidderHr',
            pageSize: 100,
            pageNo: 1,
            condition: [
                {
                    field: 'contractorId',
                    value: this.data.BCTANo,
                },
                {
                    field: 'workId',
                    value: this.data.id,
                },
                // {
                //     field: 'egpTenderId',
                //     value: '20628',
                // },
                // {
                //     field: 'bidderId',
                //     value: '63e6060a-0314-11f0-b3ad-0026b988eaa8',
                // },
            ],
        };

        // Call the service to get the list based on the designation criteria
        this.service.getList(designation).subscribe(
            (response: any) => {
                // Assign the fetched data to the TableData property
                this.TableData = response.data;
                console.log('TableData', this.TableData);
            },
            (error) => {
                // Handle any errors returned from the service
            }
        );
    }
    /**
     * Fetches the list of human resources based on the egpTenderId and bidderId.
     * Subscribes to the observable returned by the service and assigns the response to the TableData property.
     */
    getHrListsBasedOnBctaNoEgpTenderId() {
        const designation = {
            viewName: 'tenderBidderHr',
            pageSize: 100,
            pageNo: 1,
            condition: [
                {
                    field: 'egpTenderId',
                    value: this.data.egpTenderId,
                },
                {
                    field: 'bidderId',
                    value: this.data.bidderId,
                },
                //  {
                //     field: 'egpTenderId',
                //     value: '19727',
                // },
                // {
                //     field: 'bidderId',
                //     value: 'ee324d22-bde9-11ef-b3ad-0026b988eaa8',
                // },
            ],
        };

        // Call the service to get the list based on the designation criteria
        this.service.getList(designation).subscribe(
            (response: any) => {
                // Assign the fetched data to the TableData property
                this.TableData = response.data;
                console.log('TableData', this.TableData);
            },
            (error) => {
                // Handle any errors returned from the service
            }
        );
    }

    /**
     * Fetches the list of designations.
     * Subscribes to the observable returned by the service and assigns the response to the designationList property.
     */
    getdeginationList() {
        const degination = {
            viewName: 'designationList',
            pageSize: 100,
            pageNo: 1,
            condition: [],
        };
        this.service.getList(degination).subscribe(
            (response: any) => {
                this.designationList = response.data;
            },
            (error) => {}
        );
    }
    /**
     * Fetches the list of qualifications.
     * Subscribes to the observable returned by the service and assigns the response to the qualificationList property.
     */
    getQualificationList() {
        const Qualification = {
            viewName: 'qualificationList',
            pageSize: 100,
            pageNo: 1,
            condition: [], // Specify any conditions for filtering the list here
        };
        this.service.getList(Qualification).subscribe(
            (response: any) => {
                // Assign the fetched data to the qualificationList property
                this.qualificationList = response.data;
            },
            (error) => {
                // Handle any errors returned from the service
            }
        );
    }
    /**
     * Uploads the selected file to the server and sets the file ID upon success.
     */
    uploadFile(): void {
        this.service.uploadFile(this.formData.uploadFile).subscribe(
            (response: string) => {
                this.fileId = response;
            },
            (error: any) => {
                console.error('Error uploading!', error);
            }
        );
    }
    /**
     * Fetches citizen details based on the provided CID number.
     * Updates the formData with the citizen's full name if found.
     * Displays error messages if the citizen is not found or if there's a server error.
     * @param cidNo The CID number of the citizen.
     */
    getCidDetails(cidNo: number,index: number): void {
        this.isLoading = true; // Show loading indicator
        this.service.getCitizenDetails(cidNo).subscribe(
            (response: any) => {
                if (response?.citizenDetailsResponse?.citizenDetail?.length) {
                    const citizen =
                        response.citizenDetailsResponse.citizenDetail[0];
                    const name = [
                        citizen.firstName,
                        citizen.middleName,
                        citizen.lastName,
                    ]
                        .filter((part) => part) // Remove any null or undefined parts
                        .join(' ');
                    this.isLoading = false;
                    this.formData.replacementName = name; // Update formData with the full name
                    if (this.inspectionType == 'OTHERS') {
                        this.entryList[index].fullName = name;
                    }
                } else {
                    this.isLoading = false;
                    this.errorMessages.notFound = 'Not Registered in DCRC'; // Set not found error message
                }
                this.isLoading = false; // Hide loading indicator
                console.log(response); // Log the response for debugging
            },
            (error) => {
                if (error.status === 500) {
                    this.errorMessages.server = 'Something went wrong'; // Set server error message
                    console.error('Something went wrong:', error); // Log the error for debugging
                }
                this.isLoading = false; // Hide loading indicator
            }
        );
    }
    replacedHRList: any[] = [];
    getId(id: any) {
        this.id = id;
        console.log('id', this.id);
    }
    showReplacementIndex: number | null = null;
    toggleReplacement(index: number) {
        this.showReplacementIndex =
            this.showReplacementIndex === index ? null : index;
    }
    onDesignationChange(selectedId: string) {
        const selected = this.designationList.find((d) => d.id === selectedId);
        this.formData.replacementDesignationName = selected
            ? selected.name
            : '';
    }

    onQualificationChange(selectedId: string) {
        const selected = this.qualificationList.find(
            (q) => q.id === selectedId
        );
        this.formData.qualificationName = selected ? selected.name : '';
        console.log('Qualification name:', this.formData.qualificationName);
    }
    statusError: string = '';
    saveHRItem(form) {
        if (!this.formData.status) {
            this.statusError = 'Please select the status.';
            return;
        }
        const existingDataIndex = this.TableData.findIndex(
            (item) => item.id === this.id || item.hrId === this.id
        );

        if (existingDataIndex !== -1) {
            const existingData = this.TableData[existingDataIndex];

            const replacedData = {
                id: this.id,
                status: this.formData.status,
                cidNo: this.formData.cidNo,
                replacementName: this.formData.replacementName,
                replacementDesignation: this.formData.replacementDesignation,
                qualification: this.formData.qualification,
                meetsRequiredQualification: this.formData.meetsQualification,
            };

            // Save to replacedHRList if needed
            const index = this.replacedHRList.findIndex(
                (item) => item.id === this.id || item.hrId === this.id
            );
            if (index !== -1) {
                this.replacedHRList[index] = replacedData;
            } else {
                this.replacedHRList.push(replacedData);
            }

            // ✅ Update TableData directly
            this.TableData[existingDataIndex].status = this.formData.status;
            this.TableData[existingDataIndex].verified = true;

            if (this.formData.status === 'REPLACED') {
                this.TableData[existingDataIndex].replacementInfo = {
                    name: this.formData.replacementName,
                    cidNo: this.formData.cidNo,
                    designation: this.formData.replacementDesignationName,
                    qualification: this.formData.qualificationName,
                };
            }

            // Close modal
            this.closeModal.nativeElement.click();
            this.statusError = '';
            // Reset form
            this.formData = {
                status: '',
                cidNo: '',
                replacementName: '',
                replacementDesignation: '',
                qualification: '',
                meetsQualification: '',
            };
        } else {
            console.warn(
                `No matching entry found in TableData for id: ${this.id}`
            );
        }
    }

    resetForm() {
        this.formData.status = '';
        this.formData.cidNo = '';
        this.formData.replacementName = '';
        this.formData.replacementDesignation = '';
        this.formData.qualification = '';
    }

    id: any;
    onClickStatus(event: any): void {}
    savedData: any[] = [];
    formType = '11';
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
    // First check if entryList exists and is not empty
    if (this.entryList && this.entryList.length > 0) {
        const finalPayload = {
            humanResources: this.entryList,
            id: this.tableId
        };
        this.sendPayload(finalPayload);
        return;
    }

    // Original logic when entryList is empty
    if (
        this.TableData.length > 0 &&
        this.TableData.some((item) => {
            const hrId = item.id || item.hrId;
            const replacedHR = this.replacedHRList.find(
                (replacement) => replacement.id === hrId
            );
            const status = replacedHR?.status || item.status;
            return !status; // if status is null, undefined, or empty
        })
    ) {
        this.notification.error(
            'Error',
            'Please verify all the human resource before processing.'
        );
        return;
    }
    
    this.savedData = this.TableData.map((item) => {
        const hrId = item.id || item.hrId;
        const replacedHR = this.replacedHRList.find(
            (replacement) => replacement.id === hrId
        );
        const humanResource: any = {
            fullName: item.name,
            designation: item.designation,
            qualification: item.qualification,
            cidNo: item.cidNo,
            status: replacedHR?.status || item.status,
        };
        
        if (
            replacedHR &&
            replacedHR.status !== 'NOT_DEPLOYED' &&
            replacedHR.status !== 'DEPLOYED'
        ) {
            humanResource.replacements = [
                {
                    cidNo: replacedHR.cidNo,
                    fullName: replacedHR.replacementName,
                    designation: replacedHR.replacementDesignation,
                    qualification: replacedHR.qualification,
                    meetsRequiredQualification:
                    replacedHR.meetsRequiredQualification,
                },
            ];
        } else {
            humanResource.replacements = [];
        }

        return humanResource;
    });

    const finalPayload = {
        humanResources: this.savedData,
        id: this.tableId,
    };

    this.sendPayload(finalPayload);
}
private sendPayload(finalPayload: any) {
    this.service.saveAsDraft(finalPayload).subscribe({
        next: (response: any) => {
            if (this.tableId) {
                this.assignCheckListId();
                this.saveHumanResourceContractData.emit({
                    tableId: this.tableId,
                    data: this.data,
                    inspectionType: this.inspectionType,
                });
                this.router.navigate([
                    'monitoring/certified-skilled-worker',
                ]);
            }
        },
        error: (error) => {
            console.error('Error saving draft:', error);
        },
    });
}
    // private saveDraftPayload() {
    //     if (
    //         this.TableData.length > 0 &&
    //         this.TableData.some((item) => {
    //             const hrId = item.id || item.hrId;
    //             const replacedHR = this.replacedHRList.find(
    //                 (replacement) => replacement.id === hrId
    //             );
    //             const status = replacedHR?.status;
    //             return !status; // if status is null, undefined, or empty
    //         })
    //     ) {
    //         this.notification.error(
    //             'Error',
    //             'Please verify all the human resource before processing.'
    //         );
    //         return;
    //     }
    //     this.savedData = this.TableData.map((item) => {
    //         const hrId = item.id || item.hrId;
    //         const replacedHR = this.replacedHRList.find(
    //             (replacement) => replacement.id === hrId
    //         );
    //         const humanResource: any = {
    //             fullName: item.name,
    //             designation: item.designation,
    //             qualification: item.qualification,
    //             cidNo: item.cidNo,
    //             status: replacedHR?.status,
    //         };
    //         // Add replacements only if status is not 'NOT_DEPLOYED' or 'DEPLOYED'
    //         if (
    //             replacedHR &&
    //             replacedHR.status !== 'NOT_DEPLOYED' &&
    //             replacedHR.status !== 'DEPLOYED'
    //         ) {
    //             humanResource.replacements = [
    //                 {
    //                     cidNo: replacedHR.cidNo,
    //                     fullName: replacedHR.replacementName,
    //                     designation: replacedHR.replacementDesignation,
    //                     qualification: replacedHR.qualification,
    //                     meetsRequiredQualification:
    //                     replacedHR.meetsRequiredQualification,
    //                 },
    //             ];
    //         } else {
    //             humanResource.replacements = []; // explicitly set as empty array
    //         }

    //         return humanResource;
    //     });

    //     const finalPayload = {
    //         humanResources: this.savedData,
    //         id: this.tableId,
    //     };

    //     this.service.saveAsDraft(finalPayload).subscribe({
    //         next: (response: any) => {
    //             if (this.tableId) {
    //                 this.assignCheckListId();
    //                 this.saveHumanResourceContractData.emit({
    //                     tableId: this.tableId,
    //                     data: this.data,
    //                     inspectionType: this.inspectionType,
    //                 });
    //                 this.router.navigate([
    //                     'monitoring/certified-skilled-worker',
    //                 ]);
    //             }
    //         },
    //         error: (error) => {
    //             console.error('Error saving draft:', error);
    //         },
    //     });
    // }

    assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service.saveCheckListId(this.tableId, payload).subscribe(
            (response) => {
                this.createNotification();
                console.log('File ID assigned successfully:', response);
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
        this.router.navigate(['monitoring/occupational-health-and-safty']);
    }

    showInputRow: boolean = false;
    newEntry = {
        name: '',
        cidNo: '',
        designation: '',
        qualification: '',
        status: 'NEW',
    };

    cancelAdd() {
        this.resetNewEntry();
        this.showInputRow = false;
    }
    entryList: any[] = [];
    addNewEntry() {
        this.entryList.push({
            cidNo: '',
            fullName: '',
            designation: '',
            qualification: '',
            status: '',
        });
        console.log('entryList...........', this.entryList);
    }
  
    resetNewEntry() {
        this.newEntry = {
            name: '',
            cidNo: '',
            designation: '',
            qualification: '',
            status: 'NEW',
        };
    }

    validateMobileNumber() {
        const mobile = (this.formData?.mobileNo || '').toString().trim();
        this.errorMessages.mobile =
            mobile.length > 8
                ? "Contact number can't be more than 8 digits."
                : '';
    }
}
