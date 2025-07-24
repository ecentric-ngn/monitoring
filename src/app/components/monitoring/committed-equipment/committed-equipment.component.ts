import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    Output,
    Type,
    ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin, isEmpty } from 'rxjs';
import { __values } from 'tslib';
@Component({
    selector: 'app-committed-equipment',
    templateUrl: './committed-equipment.component.html',
    styleUrls: ['./committed-equipment.component.scss'],
})
export class CommittedEquipmentComponent {
    formData: any = {};
    @ViewChild('closeModal') closeModal: ElementRef;
    @Output() saveCommittedEquipmentData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType;
    }>();

    @Output() previousClicked = new EventEmitter<{
        tableId: any;
        inspectionType: any;
    }>();
    fileError: string | null = null;
    fileId: any = [];
    TableData: any = [];
    equipmentName: any;
    registrationNo: any;
    vehicleData: any;
    VehicleType: any;
    equipmentLists: any;
    equipmentId: any;
    savedEquipmentData: any;
    deployedEquipments: any;
    userName: any;
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    @Input() workId: any;
    @Input() WorkId: any;
    fileAndRemark: any;
    humanResources: any;
    formType = '13';
    @Input() prevTableId: any;

    //inspectionType='OTHERS';
    appStatus: any;
    VehicleDetails: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.FetchEquipmentMasterData(); // Always fetch master data
        this.appStatus = this.data?.applicationStatus ?? null;
        this.inspectionType = this.inspectionType ?? null;
        this.workId = this.data?.id || null;
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userName = userDetails.username;
        }
        if (this.appStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
            this.getDatabasedOnChecklistId(); // Load previous data for REJECTED
            return;
        }

        if (this.prevTableId || this.workId) {
            this.getDatabasedOnChecklistId(); // Load previous data if prevTableId exists
        } else {
            // If no previous data, load equipment lists based on inspection type
            this.loadEquipmentListBasedOnInspectionType();
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

 this.service
  .fetchDetails(payload, 1, 100, 'committed_equipment_view')
  .subscribe(
    (response: any) => {
      const data = response.data;
      if (!Array.isArray(data) || data.length === 0) {
        this.loadEquipmentListBasedOnInspectionType();
        return;
      }

      // ✅ Safe to access [0] now
      this.formData.remarks = data[0].remarks;

      this.TableData = data.map((item: any) => {
        const isReplaced = item.status === 'REPLACED';
        return {
          id: item.committed_equipment_id,
          name: item.equipment_name || item.equipmentName,
          registrationNo: item.registration_number,
          status: item.status,
        };
      });
    },
    (error) => {
      console.error('Error fetching contractor details:', error);
    }
  );

    }
    loadEquipmentListBasedOnInspectionType() {
        if (this.inspectionType === 'PUBLIC') {
            this.getEqListsBasedOnBctaNoEgpTenderId();
        } else if (this.inspectionType === 'PRIVATE') {
            this.getPrivateEqLists();
        } else if (this.inspectionType === 'OTHERS') {
            this.getOtherWorkEqLists();
        }
    }

    getOtherWorkEqLists() {
        const otherWork = {
            viewName: 'contractorEquipment',
            pageSize: 100,
            pageNo: 1,
            condition: [
                {
                    field: 'contractorNo',
                    value: this.data.bctaregNumber,
                },
            ],
        };
        this.service.getList(otherWork).subscribe(
            (response: any) => {
                this.TableData = response.data;
                console.log('TableData', this.TableData);
            },
            (error) => {}
        );
    }

    /**
     * Fetches the list of equipment based on the egpTenderId and bidderId.
     * Subscribes to the observable returned by the service and assigns the response to the TableData property.
     */
    getPrivateEqLists() {
        const designation = {
            viewName: 'workBidderEq',
            pageSize: 100,
            pageNo: 1,
            condition: [
                // {
                //     field: 'contractorId',
                //     value: this.data.BCTANo,
                // },
                // {
                //     field: 'workId',
                //     value: this.data.id,
                // },
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
        this.service.getList(designation).subscribe(
            (response: any) => {
                this.TableData = response.data;
                console.log('TableData', this.TableData);
            },
            (error) => {}
        );
    }

    /**
     * Fetches the list of equipment based on the egpTenderId and bidderId.
     * Subscribes to the observable returned by the service and assigns the response to the TableData property.
     */
    getEqListsBasedOnBctaNoEgpTenderId() {
        const designation = {
            viewName: 'tenderBidderEq',
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
                // {
                //     field: 'egpTenderId',
                //     value: '19727',
                // },
                // {
                //     field: 'bidderId',
                //     value: 'ee324d22-bde9-11ef-b3ad-0026b988eaa8',
                // },
            ],
        };
        this.service.getList(designation).subscribe(
            (response: any) => {
                this.TableData = response.data;
                console.log('TableData', this.TableData);
            },
            (error) => {}
        );
    }
    // isExpandTable:boolean=false
    expandedRowId: string | null = null;

    getId(item: any) {
        this.equipmentName = item.name || item.equipmentName;
        this.equipmentId = item.id;
        this.registrationNo = item.registrationNo;
        if (this.expandedRowId === item.id) {
            this.expandedRowId = null; // collapse if already expanded
        } else {
            this.expandedRowId = item.id; // expand this row
        }
    }

    onClickYes() {
        if (
            this.inspectionType == 'PUBLIC' ||
            this.inspectionType == 'PRIVATE'
        ) {
            this.getVehicleType();
        } else {
            this.getCommittedEqDataFromCRPS();
        }
    }
    eqName: string;
    getCommittedEqDataFromCRPS() {
        const eqDetails = {
            viewName: 'contractorEquipment',
            pageSize: 100,
            pageNo: 1,
            condition: [
                {
                    field: 'contractorEquipmentId',
                    value: this.contractorEquipmentId,
                },
                {
                    field: 'equipmentName',
                    value: this.equipmentName,
                },
            ],
        };
        this.service.getList(eqDetails).subscribe(
            (response: any) => {
                const data = response.data[0];
                this.equipmentName = data.equipmentName;
                this.formData.registrationNo = data.registrationNo;
                if (this.equipmentName) {
                    this.getVehicleType();
                }
            },
            (error) => {}
        );
    }

    /**
     * Handles the click event on the status dropdown.
     * If the selected status is 'Not Deployed', it fetches the equipment master data.
     * @param event - The click event from the status dropdown.
     */
    onClickNo() {
        if (this.formData.isRegistered === 'False') {
            this.FetchEquipmentMasterData();
        }
    }

    /**
     * Fetches the equipment master data.
     * Subscribes to the observable returned by the service and assigns the response to the equipmentLists property.
     */
    FetchEquipmentMasterData(): void {
        const payload = {
            viewName: 'equipmentMaster',
            pageSize: 100,
            pageNo: 1,
            condition: [],
        };
        this.service.viewData(payload).subscribe(
            (response: any) => {
                this.equipmentLists = response.data;
            },
            (error) => {}
        );
    }

    /**
     * Retrieves the vehicle type based on the equipment name and updates the VehicleType property.
     * Subscribes to the observable returned by the service to fetch data.
     * Calls getVehicleDetails() after successfully retrieving vehicle type data.
     */
    getVehicleType(): void {
        const payload = {
            viewName: 'equipmentMaster',
            pageSize: 100,
            pageNo: 1,
            condition: [
                {
                    field: 'name',
                    value: this.equipmentName,
                },
            ],
        };

        console.log('payload.....', payload);
        this.service.viewData(payload).subscribe(
            (response: any) => {
                this.VehicleType = response.data[0].vehicleType;
                this.formData.vehicleType = this.VehicleType;
                // Fetch vehicle details after obtaining the vehicle type
                if (
                    this.inspectionType === 'PUBLIC' ||
                    this.inspectionType === 'PRIVATE'
                ) {
                    this.getVehicleDetails();
                }
            },
            (error) => {
                // Handle error scenarios (currently not implemented)
            }
        );
    }
    onRegistrationNoChange(event: any) {
        this.formData.REPLACEDregistrationNo = event;
    }
    type: any;
    onVehicleTypeChange(event: any, type: any) {
        this.type = type;
        this.VehicleType = event;
        this.registrationNo = this.formData.REPLACEDregistrationNo;
        this.getVehicleDetails();
    }
    /**
     * Retrieves the vehicle details based on the registration number and vehicle type.
     * Subscribes to the observable returned by the service and assigns the response to the formData property.
     */
    showSuccessMessage: string = '';
    showErrorMessage: string = '';
    getVehicleDetails() {
        this.showErrorMessage = '';
        this.VehicleDetails = '';
        this.service
            .getVehicleDetails(this.registrationNo, this.VehicleType)
            .subscribe(
                (response: any) => {
                    const data = response.vehicleDetail;
                    this.VehicleDetails = data;
                    console.log('VehicleDetails', this.VehicleDetails);
                    if (this.type !== 'Replaced') {
                        this.formData.registrationNo =
                            response.vehicleDetail.vehicleNumber;
                        this.formData.vehicleType =
                            response.vehicleDetail.vehicleTypeName;
                    } else if (
                        response.vehicleDetail.vehicleRegistrationDetailsId ===
                        0
                    ) {
                        this.showErrorMessage =
                            'No details found for this RegNo in BCTA';
                        console.warn('No details found for this RegNo in BCTA');
                    } else {
                        this.showErrorMessage = ''; // Clear error if successful
                    }
                },
                (error) => {
                    if (error.status === 404) {
                        this.showErrorMessage =
                            'No details found for this RegNo in BCTA';
                    } else {
                        this.showErrorMessage = 'An unexpected error occurred';
                    }
                    this.showSuccessMessage = ''; // Clear success message on error
                }
            );
    }

    equipmentForms = [
        {
            equipmentId: '',
            equipmentType: '',
            number: '',
            status: this.formData.status,
        },
    ];

    removeForm(index: number) {
        this.equipmentForms.splice(index, 1);
    }
    addForm() {
        this.equipmentForms.push({
            equipmentId: this.equipmentId,
            equipmentType: '',
            number: '',
            status: this.formData.status,
        });
    }

    verifiedPayload: any;
    isVerified: boolean = false;

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

    equipmentList: any[] = [];
    notDeployedPayload: any;
    /**
     * Handles the verification of the data.
     * Pushes the verified data into the verifiedList array.
     * Closes the modal and resets the form data.
     */
    tblId: any;
    contractorEquipmentId: string;
    getStoreId(equipmentData: any) {
        switch (this.inspectionType) {
            case 'PUBLIC':
                this.tblId = equipmentData.id;
                this.equipmentName = equipmentData.name;
                this.registrationNo = equipmentData.registrationNo;
                break;

            case 'PRIVATE':
                this.tblId = equipmentData.contractorEquipmentId;
                break;

            case 'OTHERS':
                this.tblId =
                    equipmentData.contractorEquipmentId || equipmentData.id;
                this.equipmentName = equipmentData.equipmentName;
                this.contractorEquipmentId =
                    equipmentData.contractorEquipmentId || equipmentData.id;
                console.log(
                    'contractorEquipmentId:',
                    this.contractorEquipmentId
                );
                break;
            default:
                console.warn('Unknown inspection type:', this.inspectionType);
                break;
        }
    }

    /**
     * Verifies the selected equipment data, updates the equipment list, and marks the item as verified.
     * Finds the index of the equipment data based on `tblId`. If found, constructs a `verifiedPayload`
     * with equipment details and adds it to the `equipmentList`. Sets the `verified` flag to true
     * on the matched item in `TableData` and closes the modal.
     * Also constructs a `notDeployedPayload` based on form data and adds it to `equipmentForms`.
     * Resets the form data fields related to registration and vehicle type.
     */
    showReplacementIndex: number | null = null;

    toggleReplacement(i: number): void {
        this.showReplacementIndex = this.showReplacementIndex === i ? null : i;
    }
    statusError: string = '';
    VerifiedData() {
        if (!this.formData.status) {
            this.statusError = 'Please select the status.';
            console.warn('Status validation failed: Status not selected.');
            return;
        }

        let matchedIndex = -1;

        // Match index based on inspection type
        switch (this.inspectionType) {
            case 'PUBLIC':
                matchedIndex = this.TableData?.findIndex(
                    (data) => data.id === this.tblId
                );
                console.log(
                    'Inspection Type: PUBLIC, Matched Index:',
                    matchedIndex
                );
                break;

            case 'PRIVATE':
                matchedIndex = this.TableData?.findIndex(
                    (data) =>
                        data.contractorEquipmentId ===
                        this.contractorEquipmentId
                );
                console.log(
                    'Inspection Type: PRIVATE, Matched Index:',
                    matchedIndex
                );
                break;
            case 'OTHERS':
                matchedIndex = this.TableData?.findIndex(
                    (data) =>
                        data.contractorEquipmentId ||
                        data.id === this.contractorEquipmentId
                );
                console.log(
                    'Inspection Type: OTHERS, Matched Index:',
                    matchedIndex
                );
                break;

            default:
                console.warn('Unhandled inspection type:', this.inspectionType);
        }

        if (matchedIndex !== -1) {
            const verifiedPayload = {
                id: this.equipmentId,
                status: this.formData.status,
                replacedRegistrationNo: this.formData.REPLACEDRegistrationNo,
                replacedVehicleType: this.formData.REPLACEDVehicleType,
                replacedRemarks: this.formData.replacedRemarks,
                isRegistered: this.formData.isRegistered,
            };

            this.equipmentList.push(verifiedPayload);
            console.log(
                'Verified Payload Added to equipmentList:',
                verifiedPayload
            );

            const replacedWithInfo =
                this.formData.status === 'REPLACED'
                    ? {
                          status: this.formData.status,
                          registrationNo: this.formData.REPLACEDRegistrationNo,
                          vehicleType: this.formData.REPLACEDVehicleType,
                          remarks: this.formData.replacedRemarks,
                      }
                    : null;

            const updatedItem = {
                ...this.TableData[matchedIndex],
                status: this.formData.status,
                verified: true,
                replacedWithInfo,
            };

            this.TableData = [
                ...this.TableData.slice(0, matchedIndex),
                updatedItem,
                ...this.TableData.slice(matchedIndex + 1),
            ];

            console.log(
                'Updated TableData after verification:',
                this.TableData
            );

            this.isVerified = true;
            this.statusError = '';
            this.showSuccessMessage = '';
            this.showReplacementIndex = matchedIndex;
            this.closeModal.nativeElement.click();

            this.equipmentForms.push({
                equipmentId: this.equipmentId,
                equipmentType: this.formData.equipmentType,
                number: this.formData.number,
                status: this.formData.status,
            });

            console.log('Added to equipmentForms:', this.equipmentForms);

            // Reset form fields
            this.formData = {
                ...this.formData,
                status: '',
                isRegistered: '',
                registrationNo: '',
                vehicleType: '',
                REPLACEDRegistrationNo: '',
                REPLACEDVehicleType: '',
                replacedRemarks: '',
            };

            console.log('Form data reset:', this.formData);
        } else {
            console.warn('No matched index found. Verification aborted.');
        }
    }

    resetForm() {
        this.formData.isRegistered = '';
        this.formData.registrationNo = '';
        this.formData.vehicleType = '';
        this.formData.REPLACEDRegistrationNo = '';
        this.formData.status = '';
        this.formData.replacedVehicleType = '';
        this.formData.isRegistered = '';
    }
    savedData: any[] = [];
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
                const upload$ = this.service.uploadFiles(
                    file,
                    this.formData.remarks,
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
                this.formData.remarks,
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
        // ✅ Step 1: Check if additionalItems is empty
        //   if (!this.additionalItems || this.additionalItems.length === 0) {
        //     this.createNotification('error', 'Error', 'Please add at least one equipment entry.');
        //     return;
        //   }
        let hasInvalidStatus = false;
        // ✅ Step 2: Map existing TableData logic
        this.savedData = this.TableData.map((item) => {
            const matchedForm = this.equipmentList.find(
                (form) =>
                    form.equipmentId === item.id ||
                    form.equipmentId === item.contractorEquipmentId
            );

            // ✅ Skip status validation if appStatus is 'REJECTED'
            if (this.appStatus !== 'REJECTED') {
                if (!matchedForm?.status || matchedForm.status.trim() === '') {
                    hasInvalidStatus = true;
                }
            }

            const eqList: any = {
                equipmentName: item.name,
                registrationNumber: item.registrationNo,
                remarks: this.formData.remarks,
                status: item?.status,
                isRegistered: matchedForm?.isRegistered,
                vehicleType: item.vehicleType,
                equipmentType:
                    matchedForm?.equipmentType || this.formData.equipmentType,
                equipmentNumber: matchedForm?.number || this.formData.number,
                additionalEquipment: this.equipmentForms.map((form) => ({
                    equipmentType: form.equipmentType,
                    number: form.number,
                })),
            };

            const replacedEq = this.equipmentList.find(
                (replacement) =>
                    replacement.id === item.id ||
                    replacement.id === item.contractorEquipmentId
            );

            if (replacedEq) {
                if (
                    replacedEq.status === 'NOT_DEPLOYED' ||
                    replacedEq.status === 'DEPLOYED'
                ) {
                    eqList.replacements = [];
                } else {
                    eqList.replacements = [
                        {
                            registrationNumber:
                                replacedEq.replacedRegistrationNo,
                            vehicleType: replacedEq.replacedVehicleType,
                            remarks: replacedEq.replacedRemarks,
                        },
                    ];
                }
            }

            return eqList;
        });

        // ✅ Step 3: Append additionalItems to the savedData list
        const additionalEquipmentData = this.additionalItems.map((item) => ({
            equipmentName: item.name,
            registrationNumber: item.registrationNo,
            status: item.status,
            remarks: this.formData.remarks,
            isRegistered: false,
            vehicleType: '',
            equipmentType: this.formData.equipmentType || '',
            equipmentNumber: '',
            additionalEquipment: [],
            replacements: [],
        }));

        this.savedData.push(...additionalEquipmentData);

        // ✅ Step 4: Final status validation (skipped if appStatus is 'REJECTED')
        if (
            this.appStatus !== 'REJECTED' &&
            this.savedData.some(
                (item) => !item.status || item.status.trim() === ''
            )
        ) {
            this.createNotification(
                'error',
                'Error',
                'Please verify all the equipment before processing.'
            );
            return;
        }

        // ✅ Step 5: Send the payload
        const payload = {
            committedEquipments: this.savedData,
            id: this.tableId,
            workID: this.workId,
        };

        this.service.saveAsDraft(payload).subscribe({
            next: (response: any) => {
                if (this.tableId) {
                    this.assignCheckListId();
                    this.saveCommittedEquipmentData.emit({
                        tableId: this.tableId,
                        data: this.data,
                        inspectionType: this.inspectionType,
                    });
                    this.router.navigate(['monitoring/hrstrength-at-site']);
                }
            },
            error: (error) => {
                console.error('Error saving draft:', error);
            },
        });
    }

    assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service
            .saveCheckListId(this.tableId, this.workId, payload)
            .subscribe(
                (response) => {
                    console.log('File ID assigned successfully:', response);
                    this.createNotification(
                        'success',
                        'Success',
                        'The data has been saved successfully'
                    );
                },
                (error) => {
                    this.createNotification(
                        'error',
                        'Error',
                        'Failed to save the data. Please try again.'
                    );
                    console.error('Error assigning File ID:', error);
                }
            );
    }
    onEquipmentChange(item: any) {
        const selected = this.equipmentLists.find(
            (eq) => eq.name === item.name
        );
        if (selected && selected.vehicleType) {
            item.vehicleType = selected.vehicleType; // Enable registration field
        } else {
            item.vehicleType = ''; // Disable registration field
            item.registrationNo = ''; // Optionally clear it
        }
    }

    createNotification(
        type: 'success' | 'error' | 'info' | 'warning',
        title: string,
        message: string
    ): void {
        this.notification[type](title, message).onClick.subscribe(() => {
            console.log(`${type} notification clicked!`);
        });
    }

    onPreviousClick() {
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/certified-skilled-worker']);
    }
    additionalItems: any[] = [];

    addAdditionalItem() {
        this.additionalItems.push({
            name: '',
            registrationNo: '',
            status: '',
        });
    }

    removeAdditionalItem(index: number) {
        this.additionalItems.splice(index, 1);
    }

    showCertificateModal(item: any) {
        this.registrationNo = item.registrationNo;
        this.VehicleType = item.vehicleType;
        this.getVehicleDetails();
        // this.selectedCertificate = item;
        // this.certificateModal.show();
    }
    closeModalForm() {
        // this.registrationNo = '';
        // this.VehicleType = '';
        // this.certificateModal.hide();
    }
}
