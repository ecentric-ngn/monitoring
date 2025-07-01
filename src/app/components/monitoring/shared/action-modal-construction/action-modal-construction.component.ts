import { Component, EventEmitter, Input, Output } from '@angular/core';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthServiceService } from 'src/app/auth.service';
import { CommonService } from 'src/app/service/common.service';
declare var bootstrap: any;

@Component({
  selector: 'app-action-modal-construction',
  templateUrl: './action-modal-construction.component.html',
  styleUrls: ['./action-modal-construction.component.scss']
})
export class ActionModalConstructionComponent {
  @Input() selectedAction: any;
    @Input() downgradeList: any[];
    @Input() today: string;
    @Input() visible: boolean = false;
  
    @Output() close = new EventEmitter<void>();
    @Output() submit = new EventEmitter<any>();
  
    bsModal: any;
    workClassificationList: any[] = [];
    bctaNo: string = '';
  
    // selectedAction: any = {
    //   actionType: '',
    //   actionDate: '',
    //   remarks: '',
    //   newClassification: '',
    //   contractorId: '',
    //   contractorNo: ''
    // };
  
    constructor(
      private service: CommonService,
      private authService: AuthServiceService
    ) { }
  
    ngOnInit(){
      this.service.bctaNo$.subscribe(bctaNo => {
          this.bctaNo = bctaNo;
      });
    }
  
    openActionModal() {
      this.selectedAction = {
        actionType: '',
        actionDate: this.today,
        remarks: '',
        newClassification: '',
      };
  
      const modalEl = document.getElementById('actionModal');
      this.bsModal = new bootstrap.Modal(modalEl, {
        backdrop: 'static',
        keyboard: false
      });
      this.bsModal.show();
    }
  
    onActionTypeChange() {
      if (this.selectedAction.actionType === 'downgrade') {
        const firmId = this.bctaNo;
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
  
    getClassOptions(existingClass: string) {
      const all = [
        { label: 'L - Large', value: 'L-Large' },
        { label: 'M - Medium', value: 'M-Medium' },
        { label: 'S - Small', value: 'S-Small' }
      ];
  
      if (existingClass === 'L-Large') {
        return all.filter(opt => opt.value !== 'L-Large');
      } else if (existingClass === 'M-Medium') {
        return all.filter(opt => opt.value === 'S-Small');
      } else if (existingClass === 'S-Small') {
        return [];
      }
      return [];
    }
  
    trackByWorkCategory(index: number, item: any) {
      return item.workCategory;
    }
  
    closeModal() {
      if (this.bsModal) {
        this.bsModal.hide();
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
          firmId: this.bctaNo,
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
          contractorNo: this.bctaNo,
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
          firmNo: this.bctaNo,
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
}
