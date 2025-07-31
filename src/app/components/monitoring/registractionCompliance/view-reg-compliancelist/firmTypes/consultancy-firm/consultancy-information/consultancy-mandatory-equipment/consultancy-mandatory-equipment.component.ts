import { Component, ElementRef, EventEmitter, Inject, Input, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CommonService } from '../../../../../../../../service/common.service';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../../../auth.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NzNotificationService } from 'ng-zorro-antd/notification';

declare var bootstrap: any;
@Component({
    selector: 'app-consultancy-mandatory-equipment',
    templateUrl: './consultancy-mandatory-equipment.component.html',
    styleUrls: ['./consultancy-mandatory-equipment.component.scss'],
})
export class ConsultancyMandatoryEquipmentComponent {
    formData: any = {};
    @Output() activateTab = new EventEmitter<{ id: string;data:string, tab: string }>();

    firmType: any;
    bctaNo: any;
    tableData: any[] = [];
    @Input() id: string = '';
    @Input() data: any;
    tData: any = [];
    applicationStatus: string = '';
    isSaving = false;
    bsModal: any;
    downgradeList: any[] = [];
    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: '',
    };
    licenseStatus: any;
    @ViewChild('closeActionModal', { static: false }) closeActionModal!: ElementRef;
    vehicleData: Object;
    VehicleDetails: any;
    showErrorMessage: any;
    showSuccessMessage: string;
    private getPrefix(workCategory: string): string {
        if (workCategory.startsWith('S-')) return 'S';
        if (workCategory.startsWith('A-')) return 'A';
        if (workCategory.startsWith('C-')) return 'C';
        if (workCategory.startsWith('E-')) return 'E';
        return '';
    }
    constructor(
        private service: CommonService,
        private router: Router,
        private authService: AuthServiceService,
         private notification: NzNotificationService,
    ) {}
    WorkDetail: any;
    ngOnInit() {
         this.data = this.data;
          this.applicationStatus = this.data.applicationStatus;
         this.fetchDataBasedOnBctaNo();
         console.log('this.data', this.data);
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
        // Initialize formData with default values
        this.formData = {
            equipmentType: '',
            requiredEquipment: '',
            categoryOfService: '',
            equipmentDeployed: '',
            remarks: '',
            fulfillsRequirement: '',
            lastDateToResubmit: '',
            remarksIfNo: '',
        };
        // Set the id from input
        this.id = this.id;
        const WorkDetail = this.service.getData('BctaNo');
         this.WorkDetail = WorkDetail?.data ?? this.data ?? {}; // fallback to existing `this.data` or empty object
        if (!WorkDetail || !WorkDetail.data) {
            return;
        }
        this.formData.firmType = WorkDetail.data || this.data || '';
        this.bctaNo = WorkDetail.data.consultantNo || this.data.consultantNo || '';
        this.applicationStatus = WorkDetail.data.applicationStatus || this.data.applicationStatus || '';
        
        this.licenseStatus = WorkDetail.data.licenseStatus ||  this.data || '';
        this.tData = {
            eqFulfilled: '',
            eqResubmitDeadline: '',
            eqRemarks: '',
        };

        if (this.bctaNo && this.applicationStatus === 'Suspension Resubmission') {
         this.fetchSuspendDataBasedOnBctaNo();
        } else if(this.data.consultantNo){
        this.fetchDataBasedOnBctaNo();
        }else{
 this.service.setBctaNo(this.bctaNo);
        }
       
    }
    fetchDataBasedOnBctaNo() {
        this.service.getDatabasedOnBctaNos(this.data.consultantNo,this.data.appNo).subscribe((res: any) => {
            this.tableData = res.vehicles;
        });
    }

    fetchSuspendDataBasedOnBctaNo() {
        //this.bctaNo = this.WorkDetail.data.contractorNo;
        this.service.getSuspendedDatabasedOnBctaNo(this.bctaNo).subscribe(
            (res: any) => {
                this.tableData = res.hrCompliance;
            },
            (error) => {
            }
        );
    }
    minResubmitDate: string = this.getMinDate();

    getMinDate(): string {
        const today = new Date();
        today.setDate(today.getDate()); // you can adjust if needed
        return today.toISOString().split('T')[0];
    }

    onSubmit() {}
   rejectApplication() {
          this.service.rejectApplication('consultant',this.data.consultantNo).subscribe(
            (response: any) => {
              console.log('Application rejected successfully:', response);
              this.createNotification(
                'success',
                'Success',
                'Application rejected successfully'
              );
              this.closeModal();
              this.router.navigate(['monitoring/construction']);
            },
            (error) => {
              console.error('Error rejecting application:', error);
              this.createNotification(
                'error',
                'Error',
                'Failed to reject application'
              );
            }
          )
        }
createNotification(
  type: 'success' | 'error' | 'info' | 'warning',
  title: string,
  message: string
): void {
  this.notification[type](title, message).onClick.subscribe(() => {
  });
}
    tableId: any;
    saveAndNext() {
        this.isSaving = true;
        const table = this.service.setData(
            this.tableId,
            'tableId',
            'office-signage'
        );
        this.tableId = this.id;

        const eq = this.tableData.map((item: any) => ({
            equipmentType: item.equipmentName,
            requiredEquipment: item.vehicleType,
            categoryOfService: null,
            equipmentDeployed: null,
        }));

        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.data.consultantNo || this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
            consultantEquipmentDto: eq,
        };
        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe(
            (res: any) => {
                this.isSaving = false;
                this.activateTab.emit({
                    id: this.tableId,
                    data:this.data,
                    tab: 'consultancyMonitoring',
                });
            },
            (error) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to save',
                    icon: 'error',
                });
            }
        );
    }

    notifyContractor() {
        this.isSaving = true;
        const table = this.service.setData(
            this.id,
            'tableId',
            'office-signage'
        );
        this.tableId = this.id;

        const eq = this.tableData.map((item: any) => ({
            equipmentType: item.equipmentName,
            requiredEquipment: item.vehicleType,
            categoryOfService: null,
            equipmentDeployed: null,
        }));

        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.data.consultantNo || this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
            consultantEquipmentDto: eq,
        };

        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Requirements Not Met',
                    text: 'The firm has been notified to resubmit the form',
                    icon: 'warning',
                    confirmButtonText: 'OK',
                });
                this.router.navigate(['monitoring/consultancy']);
               // this.activateTab.emit({ id: this.tableId, tab: 'monitoring' });
            },
            error: (error) => {
                this.isSaving = false;
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to notify firm',
                    icon: 'error',
                });
            },
        });
    }

    update() {
        this.isSaving = true;
        const payload = {
            consultantRegistrationDto: {
                bctaNo: this.data.consultantNo || this.bctaNo,
                eqFulfilled: this.tData.fulfillsRequirement,
                eqResubmitDeadline: this.tData.resubmitDate,
                eqRemarks: this.tData.remarks,
            },
        };

        this.service.saveOfficeSignageAndDocConsultancy(payload).subscribe({
            next: (res: any) => {
                this.isSaving = false;
                Swal.fire({
                    icon: 'success',
                    title: 'Updated successfully!',
                    showConfirmButton: false,
                    timer: 2000,
                }).then(() => {
                    this.router.navigate(['monitoring/consultancy']);
                });
            },
            error: (err) => {
                this.isSaving = false;
                Swal.fire({
                    icon: 'error',
                    title: 'Update failed!',
                    text:
                        err?.error?.message ||
                        'Something went wrong. Please try again.',
                    confirmButtonText: 'OK',
                });
            },
        });
    }
  closeModal() {
        this.closeActionModal.nativeElement.click();
    }
    onActionTypeChange() {
        if (this.selectedAction.actionType === 'cancel') {
            const firmId = this.formData.firmType.consultantId;
            const firmType = 'consultant';
            if (!firmId) {
                console.error(
                    'firmId is undefined. Check if the selected row has consultantNo.'
                );
                return;
            }

            forkJoin({
                categoryData: this.service.getWorkCategory('consultant'),
                existingClassData: this.service.getClassification(
                    firmType,
                    firmId
                ),
            }).subscribe({
                next: ({ categoryData, existingClassData }) => {
                    const workCategories = categoryData.workCategory;
                    const workClassifications = categoryData.workClassification;

                    // Build a map: workCategory -> Set of existing classification IDs
                    const existingMap: { [cat: string]: Set<string> } = {};
                    for (const item of existingClassData) {
                        if (
                            item.workCategory &&
                            item.consultantWorkClassificationId
                        ) {
                            const key = String(item.workCategory).trim();
                            if (!existingMap[key]) {
                                existingMap[key] = new Set();
                            }
                            existingMap[key].add(
                                String(
                                    item.consultantWorkClassificationId
                                ).trim()
                            );
                        }
                    }

                      this.downgradeList = workCategories
                        .map((category: any) => {
                            const prefix = this.getPrefix(
                                category.workCategory
                            );
                            const categoryKey = String(
                                category.workCategory
                            ).trim();

                            const possibleClassifications = workClassifications
                                .filter(
                                    (cls: any) =>
                                        cls.type === 'consultant' &&
                                        cls.workClassification.startsWith(
                                            prefix
                                        ) &&
                                        existingMap[categoryKey] &&
                                        existingMap[categoryKey].has(
                                            String(cls.id).trim()
                                        )
                                )
                                .map((cls: any) => ({
                                    id: cls.id,
                                    name: cls.workClassification,
                                    checked: true,
                                    preChecked: true,
                                }));

                            // Return null if no classification matches
                            if (possibleClassifications.length === 0) {
                                return null;
                            }

                            return {
                                workCategory: category.workCategory,
                                workCategoryId: category.id,
/*************  ✨ Windsurf Command 🌟  *************/
                                classifications: possibleClassifications,
                            };
                        })
      
                        .filter((item: any) => item !== null); // Remove nulls
                },
                error: (err) => {
                    console.error('Error fetching downgrade data:', err);
                },
            });
        } else {
            this.downgradeList = [];
        }
    }

    submitAction() {
        console.log('Submit Action triggered with:', this.selectedAction);
        if (
            !this.selectedAction.actionType ||
            !this.selectedAction.actionDate ||
            !this.selectedAction.remarks
        ) {
            alert('All required fields must be filled.');
            return;
        }
        if (this.selectedAction.actionType === 'cancel') {
            console.log('Cancel action initiated.');
            // Collect all unchecked, previously pre-checked classifications
            const downgradeEntries: any[] = [];
            this.downgradeList.forEach((entry) => {
                entry.classifications.forEach((cls: any) => {
                    if (cls.preChecked && !cls.checked) {
                        downgradeEntries.push({
                            workCategoryId: entry.workCategoryId,
                            existingWorkClassificationId: cls.id,
                        });
                    }
                });
            });

            console.log('Downgrade entries:', downgradeEntries);

            if (downgradeEntries.length === 0) {
                Swal.fire(
                    'Error',
                    'Please uncheck at least one existing class to downgrade.',
                    'error'
                );
                return;
            }

            const payload = {
                consultantId: this.formData.firmType.consultantId,
                requestedBy: this.authService.getUsername(),
                downgradeEntries,
                applicationID: this.formData.firmType.appNo,
            };
            this.service.downgradeConsultancy(payload).subscribe({
                next: (res: string) => {
                    if (
                        res &&
                        res
                            .toLowerCase()
                            .includes('downgrade request submitted')
                    ) {
                        Swal.fire(
                            'Success',
                            'Forwarded to Review Committee',
                            'success'
                        );
                        this.closeModal();
                         this.router.navigate(['monitoring/consultancy']);
                    } else {
                        Swal.fire(
                            'Error',
                            res || 'Something went wrong while forwarding.',
                            'error'
                        );
                        this.closeModal();
                         this.router.navigate(['monitoring/consultancy']);
                    }
                },
                error: (err) => {
                    console.error('Error during downgrade:', err);
                    Swal.fire(
                        'Error',
                        'Something went wrong while forwarding.',
                        'error'
                    );
                    this.closeModal();
                },
            });
        } else if (this.selectedAction.actionType === 'suspend') {
            console.log('Suspend action initiated.');

            const payload = {
                firmNo: this.selectedAction.target?.consultantNo,
                suspendedBy: this.authService.getUsername(),
                suspensionDate: this.selectedAction.actionDate
                    ? new Date(this.selectedAction.actionDate).toISOString()
                    : null,
                firmType: 'Consultant',
                suspendDetails: this.selectedAction.remarks,
            };
            this.service.suspendFirm(payload).subscribe({
                next: (res) => {
                    console.log('Suspend response:', res);
                    Swal.fire(
                        'Success',
                        'Forwarded to Review Committee',
                        'success'
                    );
                    this.closeModal();
                     this.router.navigate(['monitoring/consultancy']);
                },
                error: (err) => {
                    console.error('Error during suspension:', err);
                    Swal.fire('Error', 'Failed to suspend contractor', 'error');
                },
            });
        }
    }
    onClick() {}
    downloadFile(filePath: string): void {
      const sanitizedPath = filePath.replace(/\s+/g, ' ');
      this.service.downloadFileFirm(sanitizedPath).subscribe(
            (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                const mimeType = response.body?.type || 'application/octet-stream';
                const blob = new Blob(binaryData, { type: mimeType });
                const blobUrl = window.URL.createObjectURL(blob);
    
                // Ensure filename is properly extracted and decoded
                const fileName = this.extractFileName(filePath);
                const isImage = mimeType.startsWith('image/');
    
                const newWindow = window.open('', '_blank', 'width=800,height=600');
                if (newWindow) {
                    newWindow.document.write(`
                        <html>
                            <head>
                                <title>File Preview</title>
                            </head>
                            <body style="margin:0; text-align: center;">
                                <div style="padding:10px;">
                                    <a href="${blobUrl}" download="${fileName}" 
                                       style="font-size:16px; color:blue;" 
                                       target="_blank">⬇ Download ${fileName}</a>
                                </div>
                                ${isImage
                                    ? `<img src="${blobUrl}" style="max-width:100%; height:auto;" alt="Image Preview"/>`
                                    : `<iframe src="${blobUrl}" width="100%" height="90%" style="border:none;"></iframe>`}
                            </body>
                        </html>
                    `);
    
                    // Clean up after window is closed
                    newWindow.onbeforeunload = () => {
                        window.URL.revokeObjectURL(blobUrl);
                    };
                } else {
                    console.error('Failed to open the new window');
                    // Fallback to direct download if window fails to open
                    this.forceDownload(blob, fileName);
                }
            },
            (error: HttpErrorResponse) => {
                if (error.status === 404) {
                    console.error('File not found', error);
                    this.showErrorMessage();
                }
            }
        );
    }

    
    // Improved filename extraction
    private extractFileName(filePath: string): string {
        try {
            // Handle URL encoded paths
            const decodedPath = decodeURIComponent(filePath);
            // Extract filename and remove any query parameters
            return decodedPath.split('/').pop()?.split('?')[0] || 'download';
        } catch {
            return filePath.split('/').pop() || 'download';
        }
    }
    
    // Fallback direct download method
    private forceDownload(blob: Blob, fileName: string) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    }

    getVehicleData(data:any) {
      this.service.getVehicleDetails(this.data.vehicleNumber,this.data.vehicleType)
                .subscribe(
                (response: any) => {
                    const data = response.vehicleDetail;
                    this.VehicleDetails = data;
                 if ( response.vehicleDetail.vehicleRegistrationDetailsId ===0) {
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
}