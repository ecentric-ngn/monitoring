import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthServiceService } from '../../../../../../auth.service';
import { forkJoin } from 'rxjs';
declare var bootstrap: any;
@Component({
  selector: 'app-permanent-employee',
  templateUrl: './permanent-employee.component.html',
  styleUrls: ['./permanent-employee.component.scss']
})
export class PermanentEmployeeComponent {
  formData: any = {};
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();
  bctaNo: any;
  tableData: any;
  @Input() id: string = '';
  data: any;
  tData: any;
  applicationStatus: string = '';
  isSaving = false;
  WorkDetail: any={};
  reinstateModal: any = null;
   today: string = new Date().toISOString().substring(0, 10);
  constructor(private service: CommonService, private router: Router,private authService: AuthServiceService) { }

  ngOnInit() {
     const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');
    this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
    const WorkDetail = this.service.getData('BctaNo');
   this.WorkDetail = WorkDetail;
    if (!WorkDetail || !WorkDetail.data) {
      console.error('WorkDetail or WorkDetail.data is undefined');
      return;
      
    }

    this.formData.firmType = WorkDetail.data;
    this.bctaNo = WorkDetail.data.contractorNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    this.data = WorkDetail.data;
    this.tData = { 
       hrFulfilled: '',
       hrResubmitDeadline: '',
       hrRemarks: ''
    };

    console.log('WorkDetail', WorkDetail);
    console.log('bctaNo', this.bctaNo);

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }
  }
onClick() {
  
}
  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe((res: any) => {
      this.tableData = res.hrCompliance
      console.log('contractor employee', this.formData);
    })
  }
    reinstateData: any = null;
  getReinstateApplication(firmId: string) {
        if (!firmId) {
            console.error('Firm ID is missing.');
            return;
        }
        this.service.getReinstateApplication(firmId).subscribe({
            next: (data) => {
                this.reinstateData = data[0];
                 setTimeout(() => {
                const modalEl = document.getElementById('reinstateModal');
                    this.reinstateModal = new bootstrap.Modal(modalEl, {
                        backdrop: 'static',
                        keyboard: false
                     });
                    this.reinstateModal.show();
                 }, 0);
            },
            error: (err) => {
                console.error('Error fetching reinstate data:', err);
                this.reinstateData = null;
            }
        });
    }
  fetchTdsHcPension() {
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
      // openActionModal(row: any) {
      //     this.selectedAction = {
      //         actionType: '',
      //         actionDate: this.today,
      //         remarks: '',
      //         newClassification: '',
      //         target: row
      //     };
      //     console.log('Row passed to modal:', row);
  
      //     const modalEl = document.getElementById('actionModal');
      //     this.bsModal = new bootstrap.Modal(modalEl, {
      //         backdrop: 'static', 
      //         keyboard: false 
      //     });
      //     this.bsModal.show();
      // }
    closeModal() {
          if (this.bsModal) {
              this.bsModal.hide();
          }
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
  downloadFile(filePath: string) {
    this.service.downloadFileFirm(filePath).subscribe({
      next: (response) => {
        this.handleFileDownload(response);
      },
      error: (error) => {
        console.error('Download failed:', error);
        // Handle error (show toast/message to user)
      }
    });
  }

  private handleFileDownload(response: any) {
    // Extract filename from content-disposition header if available
    let filename = 'document.pdf'; // default filename
    const contentDisposition = response.headers.get('content-disposition');

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch && filenameMatch.length > 1) {
        filename = filenameMatch[1];
      }
    }

    // Create download link
    const blob = new Blob([response.body], { type: response.headers.get('content-type') });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  tableId: any

  saveAndNext() {
    this.isSaving = true;
    const table = this.service.setData(this.id, 'tableId', 'office-signage');
    this.tableId = this.id;
    const hr = this.tableData.map((item: any) => ({
      cidNo: item.cId,
      fullName: item.name,
      gender: item.sex,
      nationality: item.countryName,
      qualification: item.qualification,
      joiningDate: (item.joiningDate && !isNaN(new Date(item.joiningDate).getTime()))
        ? new Date(item.joiningDate).toISOString().split('T')[0]
        : '',
      tradeField: item.tradeName,
      paySlip: item.paySlipFileName,
      remarks: this.formData.remarksYes,
      tdsFetched: true
    }));
    const payload = {
      registrationReview: { 
        // id: this.tableId,
        bctaNo: this.bctaNo,
        hrFulfilled: this.tData.hrFulfilled,
        hrResubmitDeadline: this.tData.resubmitDate,
        hrRemarks: this.tData.remarksNo
       },
       
      employeeReviews: hr

    };
    
    this.service.saveOfficeSignageAndDoc(payload).subscribe((res: any) => {
       this.isSaving = false;
      console.log('res', res);
      //  this.service.setData(this.tableId, 'tableId', 'yourRouteValueHere');
      this.activateTab.emit({ id: this.tableId, tab: 'equipment' });
    });
  }

  saveAndForward() {
    this.isSaving = true;
    const table = this.service.setData(this.id, 'tableId', 'office-signage');

    this.tableId = this.id;
    const hr = this.tableData.map((item: any) => ({
      cidNo: item.cId,
      fullName: item.name,
      gender: item.sex,
      nationality: item.countryName,
      qualification: item.qualification,
      // joiningDate:  item.joiningDate, encountered an issue with date format
      joiningDate: "2024-01-01",
      tradeField: item.tradeName,
      paySlip: item.paySlipFileName,
      remarks: this.formData.remarksYes,
      tdsFetched: true
    }));
    const payload = {

      registrationReview: { 
        bctaNo: this.bctaNo,
        hrFulfilled: this.tData.hrFulfilled,
        hrResubmitDeadline: this.tData.resubmitDate,
        hrRemarks: this.tData.remarksNo
      },
      employeeReviews: hr

    };
    this.service.saveOfficeSignageAndDoc(payload).subscribe((res: any) => {
      this.isSaving = false;
      console.log('res', res);
      this.activateTab.emit({ id: this.tableId, tab: 'equipment' });
    });
  }

  update() {
    this.isSaving = true;
    const payload = {
      registrationReview: { 
        bctaNo: this.bctaNo,
        hrFulfilled: this.tData.hrFulfilled,
        hrResubmitDeadline: this.tData.resubmitDate,
        hrRemarks: this.tData.remarksNo
       }
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