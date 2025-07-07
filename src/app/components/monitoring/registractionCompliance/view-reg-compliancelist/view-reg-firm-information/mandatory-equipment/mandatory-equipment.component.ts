import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../auth.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-mandatory-equipment',
  templateUrl: './mandatory-equipment.component.html',
  styleUrls: ['./mandatory-equipment.component.scss']
})
export class MandatoryEquipmentComponent {
  formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();

  firmType: any
  bctaNo: any
  tableData: any
  @Input() id: string = ''
  data: any;
  tData: any;
  applicationStatus: string = '';
  isSaving = false;
  WorkDetail: any;

  constructor(private service: CommonService, private router: Router, private authService: AuthServiceService) { }

  ngOnInit() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
    // Initialize formData with default values
    this.formData = {
      equipmentType: '',
      requiredEquipment: '',
      categoryOfService: '',
      equipmentDeployed: '',
      finalRemarks: '',
    };

    this.tData = {
      eqFulfilled: '',
      eqResubmitDeadline: '',
      eqRemarks: ''
    }

    // Set the id from input
    this.id = this.id;
    const WorkDetail = this.service.getData('BctaNo');
    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
    }
    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.contractorNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.data = WorkDetail.data;
    this.WorkDetail = WorkDetail;
    console.log('WorkDetail', WorkDetail);
    console.log('bctaNo', this.bctaNo);
    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }

    this.service.setBctaNo(this.bctaNo);
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.vehicles
      console.log('contractor equipment', this.formData);
    })
  }
onClick() {}

  // For date validation (optional)
  minResubmitDate: string = this.getMinDate();

  getMinDate(): string {
    const today = new Date();
    today.setDate(today.getDate()); // you can adjust if needed
    return today.toISOString().split('T')[0];
  }

  onSubmit() {

  }
   downgradeList: any[] = [];
    workClassificationList: any[] = [];
      onActionTypeChange() {
            if (this.selectedAction.actionType === 'downgrade') {
                const firmId = this.WorkDetail.data.contractorId;
                const firmType = 'contractor';
                console.log("firmId:", firmId);
                if (!firmId) {
                    console.error('firmId is undefined. Check if the selected row has contractorId or consultantNo.');
                    return;
                }
                forkJoin({
                    categoryData: this.service.getWorkCategory('contractor'),
                    existingClassData: this.service.getClassification(firmType, firmId)
                }).subscribe({
                    next: ({ categoryData, existingClassData }) => {
                        const workCategories = categoryData.workCategory;
                        this.workClassificationList = categoryData.workClassification;
                        const classificationMap = existingClassData.reduce((acc: any, item: any) => {
                            acc[item.workCategory] = item.existingWorkClassification;
                            return acc;
                        }, {});
                        this.downgradeList = workCategories.map((category: any) => ({
                            workCategory: category.workCategory,
                            workCategoryId: category.id,
                            existingClass: classificationMap[category.workCategory] || 'Unknown',
                            newClass: ''
                        }));
                    },
                    error: (err) => {
                        console.error('Error fetching downgrade data:', err);
                    }
                });
            } else {
                this.downgradeList = [];
            }
        }

            selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: ''
    };
        bsModal: any;
 today: string = new Date().toISOString().substring(0, 10);
            submitAction() {
                if (!this.selectedAction.actionType || !this.selectedAction.actionDate || !this.selectedAction.remarks) {
                    alert("All required fields must be filled.");
                    return;
                }
        
                if (this.selectedAction.actionType === 'downgrade') {
                    const downgradeEntries = this.downgradeList
                        .filter(entry => entry.newClass && entry.newClass !== '')
                        .map(entry => {
                            // Find the id for the selected newClass label
                            const classification = this.workClassificationList.find(
                                (c: any) => c.workClassification === entry.newClass
                            );
                            return {
                                workCategoryId: entry.workCategoryId,
                                newWorkClassificationId: classification ? classification.id : null
                            };
                        });
        
                    if (downgradeEntries.length === 0) {
                        Swal.fire('Error', 'Please select at least one new class to downgrade.', 'error');
                        return;
                    }
        
                    const payload = {
                        firmId: this.selectedAction.target?.contractorId,
                        firmType: "Contractor",
                        downgradeEntries,
                        requestedBy: this.authService.getUsername()
                    };
        
                    this.service.downgradeFirm(payload).subscribe({
                        next: (res: string) => {
                            if (res && res.toLowerCase().includes('downgrade request submitted')) {
                                Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                                this.closeModal();
                            } else {
                                Swal.fire('Error', res || 'Something went wrong while forwarding.', 'error');
                                this.closeModal();
                            }
                        },
                        error: (err) => {
                            Swal.fire('Error', 'Something went wrong while forwarding.', 'error');
                            console.error(err);
                            this.closeModal();
                        }
                    });
        
                } else if (this.selectedAction.actionType === 'cancel') {
                    const payload = {
                        contractorNo: this.selectedAction.target?.contractorNo,
                        // contractorId: this.selectedAction.target?.contractorId, 
                        contractorCancelledBy: this.authService.getUsername(),
                        contractorCancelledDate: this.selectedAction.actionDate,
                        contractorType: "Contractor",
                        suspendDetails: this.selectedAction.remarks,
                    };
                    this.service.cancelFirm(payload).subscribe({
                        next: (res) => {
                            Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                            this.closeModal();
                        },
                        error: (err) => {
                            Swal.fire('Error', 'Failed to cancel contractor', 'error');
                        }
                    });
                } else if (this.selectedAction.actionType === 'suspend') {
                    const payload = {
                        firmNo: this.selectedAction.target?.contractorNo,
                        // contractorId: this.selectedAction.target?.contractorId,
                        suspendedBy: this.authService.getUsername(),
                        suspensionDate: this.selectedAction.actionDate
                            ? new Date(this.selectedAction.actionDate).toISOString()
                            : null,
                        firmType: "Contractor",
                        suspendDetails: this.selectedAction.remarks,
                    };
                    this.service.suspendFirm(payload).subscribe({
                        next: (res) => {
                            Swal.fire('Success', 'Forwarded to Review Committee', 'success');
                            this.closeModal();
                        },
                        error: (err) => {
                            Swal.fire('Error', 'Failed to suspend contractor', 'error');
                        }
                    });
                }
            }
               closeModal() {
        if (this.bsModal) {
            this.bsModal.hide();
        }
    }

  tableId: any
  saveAndNext() {
    this.isSaving = true;
    const table = this.service.setData(this.tableId, 'tableId', 'office-signage');
    this.tableId = this.id;
    const eq = this.tableData.map((item: any) => ({
      "isRegistered": item.equipmentType,
      "vehicleType": item.vehicleType,
      "registrationNo": item.registrationNo,
      "ownerName": item.ownerName,
      "ownerCid": item.ownerCid,
      "equipmentType": item.equipmentName,
      "mandatoryEquipmentFulfilled": this.formData.fulfillsRequirement,
      "remarks": this.formData.finalRemarks,
    }));

    const payload = {
      registrationReview: {
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.resubmitRemarks
      },
      equipmentReviews: eq
    };
    this.service.saveOfficeSignageAndDoc(payload).subscribe((res: any) => {
      this.isSaving = false;
      console.log('res', res);
      // this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'monitoring' });
    },
      (error) => {
        this.isSaving = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to save',
          icon: 'error'
        });
      }
    );
  }

  notifyContractor() {
    this.isSaving = true;
    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;

    const eq = this.tableData.map((item: any) => ({
      "isRegistered": item.equipmentType,
      "vehicleType": item.vehicleType,
      "registrationNo": item.registrationNo,
      "ownerName": item.ownerName,
      "ownerCid": item.ownerCid,
      "equipmentType": item.equipmentName,
      "remarks": this.formData.finalRemarks,
    }));

    const payload = {
      registrationReview: {
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.resubmitRemarks
      },

      equipmentReviews: eq
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        Swal.fire({
          title: 'Requirements Not Met',
          text: 'The contractor has been notified to resubmit the form',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        // this.router.navigate(['monitoring/construction']);   
        this.activateTab.emit({ id: this.tableId, tab: 'monitoring' });
      },
      error: (error) => {
        this.isSaving = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to notify contractor',
          icon: 'error'
        });
      }
    });
  }

  update() {
    this.isSaving = true;
    const payload = {
      registrationReview: {
        bctaNo: this.bctaNo,
        eqFulfilled: this.tData.fulfillsRequirement,
        eqResubmitDeadline: this.tData.resubmitDate,
        eqRemarks: this.tData.resubmitRemarks
      },
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'success',
          title: 'Updated successfully!',
          showConfirmButton: false,
          timer: 2000
        }).then(() => {
          this.router.navigate(['monitoring/construction']);
        });
      },
      error: (err) => {
        this.isSaving = false;
        Swal.fire({
          icon: 'error',
          title: 'Update failed!',
          text: err?.error?.message || 'Something went wrong. Please try again.',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}