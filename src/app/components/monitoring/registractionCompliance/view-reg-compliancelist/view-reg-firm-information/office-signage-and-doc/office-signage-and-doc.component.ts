import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { AuthServiceService } from '../../../../../../auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
declare var bootstrap: any;
@Component({
  selector: 'app-office-signage-and-doc',
  templateUrl: './office-signage-and-doc.component.html',
  styleUrls: ['./office-signage-and-doc.component.scss']
})
export class OfficeSignageAndDocComponent implements OnInit {
  @Output() activateTab = new EventEmitter<{ id: string, tab: string }>();


  formData: any;
  bctaNo: any;
  data: any;
  id: any;
  applicationStatus: string = '';
  isSaving = false;

  // showActionModal = false;
  // selectedAction: any = {};
  // downgradeList: any[] = [];
  // today: string = new Date().toISOString().substring(0, 10);

  constructor(private service: CommonService, private router: Router, private authService: AuthServiceService) { }

  ngOnInit() {
    this.initializeFormData();
    this.loadWorkDetail();
     const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const dd = String(today.getDate()).padStart(2, '0');

    this.selectedAction.actionDate = `${yyyy}-${mm}-${dd}`;
  }
  initializeFormData() {
    this.formData = {
      officeSignboardPath: '',
      officeLocation: '',
      signboardReview: '',
      signboardResubmitDate: null,
      signboardRemarks: '',
      properFillingPath: '',
      filingReview: '',
      filingResubmitDate: null,
      filingRemarks: '',
      ohsHandBook: '',
      ohsReview: '',
      ohsResubmitDate: null,
      ohsRemarks: '',
      generalRemarks: ''
    };
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
    openActionModal(row: any) {
        this.selectedAction = {
            actionType: '',
            actionDate: this.today,
            remarks: '',
            newClassification: '',
            target: row
        };
        console.log('Row passed to modal:', row);

        const modalEl = document.getElementById('actionModal');
        this.bsModal = new bootstrap.Modal(modalEl, {
            backdrop: 'static', 
            keyboard: false 
        });
        this.bsModal.show();
    }
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

            WorkDetail: any = {};
  loadWorkDetail() {
    const WorkDetail = this.service.getData('BctaNo');
    this.WorkDetail = WorkDetail;
    console.log('Retrieved WorkDetail:', WorkDetail);
    if (!WorkDetail?.data) {
      console.error('WorkDetail data not available');
      return;
    }


    this.data = WorkDetail.data;
    this.bctaNo = this.data.contractorNo;
    this.applicationStatus = WorkDetail.data.applicationStatus;
    console.log("application Status:", this.applicationStatus);

    if (this.bctaNo) {
      this.fetchDataBasedOnBctaNo();
    }
  }

  fetchDataBasedOnBctaNo() {
    this.service.getDatabasedOnBctaNo(this.bctaNo).subscribe(
      (res: any) => {
        if (res?.complianceEntities?.length) {
          // Merge API response with initialized formData
          this.formData = { ...this.formData, ...res.complianceEntities[0] };
        }
      },
      (error) => {
        console.error('Error fetching data:', error);
      }
    );
  }

  onReviewChange() {
    if (!this.formData) return;

    this.formData = {
      ...this.formData,
      signboardResubmitDate: this.formData.signboardReview === 'No' ? null : this.formData.signboardResubmitDate,
      signboardRemarks: this.formData.signboardReview === 'No' ? '' : this.formData.signboardRemarks
    };
  }

  onFilingReviewChange() {
    if (!this.formData) return;

    // Create a new object reference to maintain change detection
    this.formData = {
      ...this.formData,
      filingResubmitDate: this.formData.filingReview === 'No' ? null : this.formData.filingResubmitDate,
      filingRemarks: this.formData.filingReview === 'No' ? '' : this.formData.filingRemarks
    };
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

  isOfficeSignboardEnabled(): boolean {
    return ['Resubmitted OS', 'Resubmitted OS and PFS', 'Submitted'].includes(this.applicationStatus);
  }

  isFilingSystemEnabled(): boolean {
    return ['Resubmitted PFS', 'Resubmitted OS and PFS', 'Submitted'].includes(this.applicationStatus);
  }

  isOhsEnabled(): boolean {
    return this.applicationStatus === 'Submitted';
  }

  isFieldEditable(field: string): boolean {
    switch (field) {
      case 'officeSignboard':
      case 'signboardReview':
        return this.isOfficeSignboardEnabled();
      case 'filingSystem':
      case 'filingReview':
        return this.isFilingSystemEnabled();
      case 'ohs':
      case 'ohsReview':
        return this.isOhsEnabled();
      default:
        return false;
    }
  }

  update() {

    this.isSaving = true;
    const payload = {
      registrationReview: {
        bctaNo: this.data.contractorNo || null,
        officeSignboard: this.formData.officeSignboardPath || null,
        signageResubmitDeadline: this.formData.signboardResubmitDate || null,
        osreview: this.formData.signboardReview || null,
        osremarks: this.formData.signboardRemarks || null,
        filingSystem: this.formData.properFillingPath || null,
        fsreview: this.formData.filingReview || null,
        fsremarks: this.formData.filingRemarks || null,
        fsresubmitDeadline: this.formData.filingResubmitDate || null,
      }
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe(
      (response: any) => {
        this.isSaving = false;
        try {
          const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
          this.id = parsedResponse.registrationReview?.id;

          Swal.fire({
            icon: 'success',
            title: 'Saved!',
            text: 'Office signage and documents review saved successfully.',
            timer: 2000,
            showConfirmButton: false
          });
          this.router.navigate(['monitoring/construction']);
        } catch (e) {
          console.error('Error parsing response:', e);
          Swal.fire('Error', 'An unexpected error occurred while parsing the response.', 'error');
        }
      },
      (error) => {
        this.isSaving = false;
        console.error('Error saving data:', error);
        Swal.fire('Error', 'Failed to save office signage and documents review.', 'error');
      }
    );
  }

  saveAndNext() {

    this.isSaving = true;

    if (this.formData.signboardReview === 'No' && !this.formData.signboardResubmitDate) {
      alert("Please provide resubmit date for office signboard.");
      return;
    }

    if (this.formData.filingReview === 'No' && !this.formData.filingResubmitDate) {
      alert("Please provide resubmit date for proper filing system.");
      return;
    }

    const payload = {
      registrationReview: {
        bctaNo: this.data.contractorNo,
        firmName: this.formData.firmName,
        contactNo: this.formData.mobileNo,
        email: this.formData.emailAddress,
        classification: this.formData.classification,
        applicationStatus: this.data.status,
        officeSignboard: this.formData.officeSignboardPath,
        osresubmitDeadline: this.formData.signboardResubmitDate,
        filingSystem: this.formData.properFillingPath,
        ohsHandbook: this.formData.ohsHandBook,
        ohsReview: this.formData.ohsReview,
        ohsRemarks: this.formData.generalRemarks,
        reviewDate: this.formData.reviewDate,
        fsreview: this.formData.filingReview,
        fsremarks: this.formData.filingRemarks,
        fsresubmitDeadline: this.formData.filingResubmitDate,
        oslocation: this.formData.officeLocation,
        osreview: this.formData.signboardReview,
        osremarks: this.formData.signboardRemarks,
        hrFulfilled: "",
        hrResubmitDeadline: "",
        hrRemarks: "",
        eqFulfilled: "",
        eqResubmitDeadline: "",
        eqRemarks: ""
      }
    };

    this.service.saveOfficeSignageAndDoc(payload).subscribe(
      (response: any) => {
        this.isSaving = false;
        try {
          const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
          this.id = parsedResponse.registrationReview?.id;
          this.activateTab.emit({ id: this.id, tab: 'employee' });
        } catch (e) {
          console.error('Error parsing response:', e);
        }
      },
      (error) => {
        this.isSaving = false;
        console.error('Error saving data:', error);
      }
    );
  }


  // openActionModal() {
  //   // Set up selectedAction and other data as needed
  //   this.selectedAction = {
  //     actionType: '',
  //     actionDate: this.today,
  //     remarks: '',
  //     // ...other fields...
  //   };
  //   this.showActionModal = true;
  // }

  // onActionModalClose() {
  //   this.showActionModal = false;
  // }

  // onActionModalSubmit(result: any) {
  //   // Handle the result from the modal (e.g., save, update, etc.)
  //   this.showActionModal = false;
  // }

}