import { Component, ViewChild } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-view-cancel-request-app-no',
  templateUrl: './view-cancel-request-app-no.component.html',
  styleUrls: ['./view-cancel-request-app-no.component.scss']
})
export class ViewCancelRequestAppNoComponent {
filteredApplications: any[] = [];
  selectedChecklistIds: any;
  checklistIds: unknown[];
  activeAction: string;
  selectedIds: number[] = [];
  pageSize: number = 10;
  totalCount: number = 0;
  isLoading: boolean = false;
 searchQuery: string = '';
 set_limit = [10, 25, 50, 100];
  tableData: any;
  pageNo: number;
  userId: any;
    @ViewChild('closeRemarkButton') closeRemarkButton: any;
  userName: any;
  formData: any={};
constructor(private service: CommonService,  private notification: NzNotificationService,) { }

ngOnInit() {
  this.getCancelList();
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
}

getCancelList(searchQuery?: string) {
  this.isLoading = true;
  this.service.getCancelApplication().subscribe(
    (response: any[]) => {
      this.tableData=[];
      console.log('API Response:', response); // Debugging line
      this.filteredApplications = response
      console.log('Filtered Applications:', this.filteredApplications);
       // Apply filter if searchQuery is provided
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        this.filteredApplications = this.filteredApplications.filter(item => 
          (item.firmId?.toString().toLowerCase().includes(query)) || 
          (item.firmType?.toString().toLowerCase().includes(query))
        );
      }
      this.setPageData(this.pageNo);
      this.totalCount = this.filteredApplications.length;
      this.isLoading = false;
    },
    (error) => {
      this.isLoading = false;
      this.notification.error('Error', 'Failed to load cancellation items');
    }
  );
}
setPageData(page: number): void {
  const startIndex = (page - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.tableData = this.tableData.slice(startIndex, endIndex);
  console.log('Table Data:', this.tableData);
}
Searchfilter(type: any) {


}
 setLimitValue(value: any) {
    this.pageSize = value;
  }
getStatusClass(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'badge badge-warning';
    case 'APPROVED':
    case 'COMPLETED':
      return 'badge badge-success';
    case 'REJECTED':
    case 'CANCELLED':
      return 'badge badge-danger';
    default:
      return 'badge badge-secondary';
  }
}
// onCheckboxChange(tender: any): void {
//   if (tender.selected) {
//     if (!this.selectedChecklistIds.includes(tender.id)) {
//       this.selectedChecklistIds.push(tender.id);
//       console.log('selectedChecklistIds', this.selectedChecklistIds);
//       this.checklistIds = Array.from(this.selectedChecklistIds);
//     }
//   } else {
//     this.selectedChecklistIds = this.selectedChecklistIds.filter(
//       id => id !== tender.checklist_id
//     );
//   }
// }
 selectedContractorNumbers: any[] = [];
 firmTypes: any;
 selectedFirmType: string | null = null;
onCheckboxChange(changedAction: any): void {
  // ✅ Your existing logic — unchanged
  this.firmTypes= changedAction.firmType || changedAction.type;
  if (changedAction.selected) {
    this.selectedIds.push(changedAction.id);
  } else {
    this.selectedIds = this.selectedIds.filter(id => id !== changedAction.id);
  }
  const selectedItems = this.tableData.filter(item => item.selected);
  this.selectedFirmType = selectedItems.length > 0 ? selectedItems[0].firmType : null;
  // ✅ NEW: Track selected firmIds
  if (!this.selectedContractorNumbers) {
    this.selectedContractorNumbers = [];
  }
  if (changedAction.selected) {
    if (!this.selectedContractorNumbers.includes(changedAction.id)) {
      this.selectedContractorNumbers.push(changedAction.id);
    }
  } else {
    this.selectedContractorNumbers = this.selectedContractorNumbers.filter(
      id => id !== changedAction.firmId || id !== changedAction.id
    );
  }
}

navigate(bcta_no: any,) {
  const employeeDetail = {
      data: bcta_no,
  };
  this.service.setData(
      employeeDetail,
      'BctaNo',
      'monitoring/viewCancelDetails'
  );
}

  // submitAction(): void {
  //       if (this.selectedIds.length === 0) {
  //           return;
  //       }
  //       const nonNumericIds = this.selectedIds.filter((id) =>
  //           isNaN(Number(id))
  //       );
  //       if (nonNumericIds.length > 0) {
  //           Swal.fire(
  //               'Error',
  //               `Invalid IDs: ${nonNumericIds.join(', ')}`,
  //               'error'
  //           );
  //           return;
  //       }

  //       this.isLoading = true;

  //       // First payload for the endorsement (Monitoring System)
  //       const endorsePayload = {
  //           suspensionIds: this.selectedIds,
  //           reviewedBy: this.userId,
  //           status: this.activeAction,
  //       };
  //       // Second payload for the suspension (G2C System)
  //       const suspendPayload = {
  //           cdbNos: this.selectedContractorNumbers.map((item) =>
  //               item.toString()
  //           ),
  //           firmType: this.firmTypes,
  //       };

  //       // First API call - Endorse in Monitoring System
  //       this.service.endorseApplications(endorsePayload).subscribe({
  //           next: (endorseResponse: string) => {
  //               // Only proceed to suspend if endorse succeeds
  //               this.service.suspendApplications(suspendPayload).subscribe({
  //                   next: (suspendResponse: any) => {
  //                       // Both operations succeeded
  //                       this.tableData = this.tableData.filter(
  //                           (item) => !this.selectedIds.includes(item.id)
  //                       );
  //                       this.selectedIds = [];
  //                       this.selectedContractorNumbers = [];
  //                       this.isLoading = false;
  //                       this.formData.remarks = '';
  //                       this.closeRemarkButton.nativeElement.click();

  //                       Swal.fire({
  //                           icon: 'success',
  //                           title: 'Success',
  //                           text: `Endorsed: ${endorseResponse}\nSuspended: ${
  //                               suspendResponse.message || 'Success'
  //                           }`,
  //                           confirmButtonColor: '#3085d6',
  //                       });
  //                   },
  //                   error: (suspendError) => {
  //                       this.isLoading = false;
  //                       this.handleError('Suspension Failed', suspendError);
  //                   },
  //               });
  //           },
  //           error: (endorseError) => {
  //               this.isLoading = false;
  //               this.handleError('Endorsement Failed', endorseError);
  //           },
  //       });
  //   }
//   submitAction(): void {
//   if (this.selectedIds.length === 0) return;
//   // Validate IDs
//   const nonNumericIds = this.selectedIds.filter(id => isNaN(Number(id)));
//   if (nonNumericIds.length > 0) {
//     Swal.fire('Error', `Invalid IDs: ${nonNumericIds.join(', ')}`, 'error');
//     return;
//   }
//   this.isLoading = true;
//   // First payload for cancellation (Monitoring System)
//   const cancelPayload = {
//     cancellationIds: this.selectedIds,
//     reviewedBy: this.userId ,
//      status: this.activeAction
//   };
//   // Second payload for the other system (adjust according to your needs)
//   const otherSystemPayload = {
//     cdbNos: this.selectedContractorNumbers.map(item => item.toString()),
//     firmType: this.firmTypes

//   };
//   // First API call - Cancel in Monitoring System
//   this.service.CancelApplications(cancelPayload).subscribe({
//     next: (cancelResponse: string) => {
//       // Only proceed to second operation if first succeeds
//       this.service.cancelApplications(otherSystemPayload).subscribe({
//         next: (otherSystemResponse: any) => {
//           // Both operations succeeded
//           this.tableData = this.tableData.filter(item => !this.selectedIds.includes(item.id));
//           this.getCancelList();
//           this.selectedIds = [];
//           this.formData.remarks = '';
//           this.selectedContractorNumbers = [];
//           this.isLoading = false;
//           this.closeRemarkButton.nativeElement.click();

//           Swal.fire({
//             icon: 'success',
//             title: 'Success',
//             text: `Cancelled: ${cancelResponse}\nOther System: ${otherSystemResponse.message || 'Success'}`,
//             confirmButtonColor: '#3085d6'
//           });
//         },
//         error: (otherSystemError) => {
//           this.isLoading = false;
//           this.handleError('Other System Operation Failed', otherSystemError);
//         }
//       });
//     },
//     error: (cancelError) => {
//       this.isLoading = false;
//       this.handleError('Cancellation Failed', cancelError);
//     }
//   });
// }

    submitAction(): void {
  if (this.selectedIds.length === 0) return;
  // Validate IDs
  if (this.selectedIds.some(id => id == null || isNaN(id))) {
    Swal.fire('Error', 'Invalid ID(s) selected', 'error');
    return;
  }
  const payload = {
    downgradeIds: this.selectedIds,
    reviewedBy: this.userId,
    status: 'Downgraded',
  };
  this.isLoading = true;
  this.service.DownGradeApplications(payload).subscribe({
    next: (response) => {
      this.tableData = this.tableData.filter(item => !this.selectedIds.includes(item.id));
       this.getCancelList();
      this.selectedIds = [];
      this.formData.remarks = '';
       this.closeRemarkButton.nativeElement.click();
      Swal.fire('Success', 'Operation completed', 'success');
    },
    error: (error) => {
      const errorMsg = error.error?.message || error.message || 'Request failed';
      Swal.fire('Error', errorMsg, 'error');
    },
    complete: () => this.isLoading = false
  });
}

       private handleError(operation: string, error: any): void {
            let errorMessage = 'Operation failed';
    
            if (typeof error === 'string') {
                errorMessage = `${operation}: ${error}`;
            } else if (error.error?.message) {
                errorMessage = `${operation}: ${error.error.message}`;
            } else if (error.message) {
                errorMessage = `${operation}: ${error.message}`;
            }
    
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
                confirmButtonColor: '#d33',
            });
        }

        resetForm() {
          this.formData.remarks = '';
        }

}
