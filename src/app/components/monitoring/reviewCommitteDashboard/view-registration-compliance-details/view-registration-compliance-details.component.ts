import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { map, switchMap } from 'rxjs';

interface ActionItem {
   id: number;
  contractorNo: string | null;
  type: string;
  actionType: string;
  details: string;
  status: string;
  initiatedBy: string;
  initiatedDate: string;
  isEditing?: boolean;
  selected?: boolean;
  // Add these as optional fields
  firmNo?: string;
  firmType?: string;
}

export interface CancelApplication {
  id: number;
  firmNo: string;
  firmType: string;
  details: string;
  status: string;
  initiatedBy: string;
  initiatedDate: string;
}


@Component({
  selector: 'app-view-registration-compliance-details',
  templateUrl: './view-registration-compliance-details.component.html',
  styleUrls: ['./view-registration-compliance-details.component.scss']
})
export class ViewRegistrationComplianceDetailsComponent implements OnInit {
  searchQuery: any;
  set_limit: number[] = [10, 15, 25, 100];
  formData: any = {};
  tableData: ActionItem[] = [];
  pageNo: number = 1;
  pageSize: number = 10;
  totalCount: number = 0;
  searchTerm: string = '';
  statusFilter: string = 'All';
  filteredApplications: any[] = [];
  isLoading: boolean = false;
  selectedApplicationNo: number[] = [];
  selectedIds: number[] = [];
  selectedContractorNumbers: ActionItem[] = [];
  firmType: string;
  ActionItem: any;
  items: any;
activeTab = 'active';
  selectedFilter: string;
    currentFilter: string = '';
    filteredTableData: any[] = [];
    originalTableData: any[] = []; // Initialize with your table data
  userId: any;
  userName: any;
 @ViewChild('closeRemarkButton') closeRemarkButton: any
  bctaNo: any;

  constructor(
    private service: CommonService,
    private notification: NzNotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getActiveList();
    const userDetailsString = sessionStorage.getItem('userDetails');
    if (userDetailsString) {
        try {
        const userDetails = JSON.parse(userDetailsString);
        this.userId = userDetails.userId;
        this.userName = userDetails.username;
        } catch (e) {
        console.error('Error parsing userDetails from sessionStorage', e);
        }
    }
  }
onTabChange(event: any) {
  this.activeTab = event.target.value;
  if(this.activeTab == 'active'){
    this.getActiveList();
  }
  
}
// onTabChange(event: any) {
//     this.activeTab = event.target.value;
//     switch (this.activeTab) {
//         case 'suspend':
//             this.getReportList();
//             break;
//         case 'cancel':
//             this.getCancelList();
//             break;
//         case 'downgrade':
//             this.getDownGradeList();
//             break;
//              case 'active':
//             this.getActiveList();
//             break;
//     }
// }
getActiveList() {
  this.isLoading = true;
  this.showCancelTable = false;
  this.service.fetchActiveLicenseList().subscribe(
    (response: any) => {
      const contractorList = (response.emailedContractorList || []).map((item: any) => ({
        ...item,
        bctaNo: item.contractorNo,  // assuming contractorNo exists
        firmType: 'Contractor'
      }));

      const builderList = (response.emailedCertifiedBuilderList || []).map((item: any) => ({
        ...item,
        bctaNo: item.certifiedBuilderNo,
        firmType: 'certified-builder'
      }));

      const specializedFirmList = (response.emailedSpecializedFirmList || []).map((item: any) => ({
        ...item,
        bctaNo: item.specializedFirmNo,
        firmType: 'specialized-firm'
      }));

      const consultantList = (response.emailedConsultantList || []).map((item: any) => ({
        ...item,
        bctaNo: item.consultantNo,  // assuming consultantNo exists
        firmType: 'Consultant'
      }));

      this.tableData = [
        ...contractorList,
        ...builderList,
        ...specializedFirmList,
        ...consultantList
      ];

      this.isLoading = false;
      this.showCancelTable = false;
    },
    (error) => {
      this.isLoading = false;
      this.notification.error('Error', 'Failed to load action items');
    }
  );
}



fullTableData: any[] = [];



// Searchfilter() {
//   this.getReportList(this.searchQuery);
// }


setPageData(page: number): void {
  const startIndex = (page - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.tableData = this.fullTableData.slice(startIndex, endIndex);
  console.log('Table Data:', this.tableData);
}

   calculateOffset(): string {
        const currentPage = (this.pageNo - 1) * this.pageSize + 1;
        const limit_value = Math.min(
            this.pageNo * this.pageSize,
            this.totalCount
        );
        return `Showing ${currentPage} to ${limit_value} of ${this.totalCount} entries`;
    }
  getTotalPages(): number {
  return Math.ceil(this.totalCount / this.pageSize);
}

getPages(): number[] {
  const totalPages = this.getTotalPages();
  return Array.from({ length: totalPages }, (_, i) => i + 1);
}

goToPage(page: number): void {
  if (page >= 1 && page <= this.getTotalPages()) {
    this.pageNo = page;
    this.setPageData(this.pageNo);
  }
}


  private formatType(type: string): string {
    if (!type) return '-';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }

  private formatActionType(actionType: string): string {
    if (!actionType) return '-';
    return actionType.charAt(0).toUpperCase() + actionType.slice(1).toLowerCase();
  }

  filterApplications(): void {
    this.filteredApplications = this.tableData.filter((app) => {
      const matchesSearch =
        this.searchTerm === '' ||
        (app.contractorNo?.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        (app.initiatedBy?.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus =
        this.statusFilter === 'All' ||
        app.status.toLowerCase() === this.statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(): void {
    this.pageNo = 1;
    this.filterApplications();
  }

  onStatusFilterChange(): void {
    this.pageNo = 1;
    this.filterApplications();
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

firmTypesssss:any;
selectedFirmType: string | null = null;


onCheckboxChange(changedAction: any): void {
  // ✅ Your existing logic — unchanged
  this.firmType = changedAction.firmType;
  this.bctaNo = changedAction.bctaNo;
  if (changedAction.selected) {
    this.selectedIds.push(changedAction.id);
  } else {
    this.selectedIds = this.selectedIds.filter(id => id !== changedAction.bctaNo);
  }
  const selectedItems = this.tableData.filter(item => item.selected);
  this.selectedFirmType = selectedItems.length > 0 ? selectedItems[0].firmType : null;
  // ✅ NEW: Track selected firmIds
  if (!this.selectedContractorNumbers) {
    this.selectedContractorNumbers = [];
  }
  if (changedAction.selected) {
    if (!this.selectedContractorNumbers.includes(changedAction.bctaNo)) {
      this.selectedContractorNumbers.push(changedAction.bctaNo);
    }
  } else {
    this.selectedContractorNumbers = this.selectedContractorNumbers.filter(
      id => id !== changedAction.firmId || id !== changedAction.bctaNo
    );
  }
}



isCheckboxDisabled(action: any): boolean {
  // Disable if a firmType is selected and it doesn't match this row's firmType
  return (
    this.selectedFirmType !== null &&
    this.selectedFirmType !== action.firmType &&
    !action.selected
  );
}
  // Update selectAll function
  selectAll(event: any) {
    const isChecked = event.target.checked;
    this.tableData.forEach(item => {
      item.selected = isChecked;
      this.onCheckboxChange(item);
    });
  }

  // Add this helper function for select all checkbox state
  isAllSelected(): boolean {
    return this.tableData.length > 0 &&
      this.tableData.every(item => this.selectedIds.includes(item.id));
  }
  
//endorse function
// endorse(): void {
//   if (this.selectedIds.length === 0) {
//     return;
//   }

//   const nonNumericIds = this.selectedIds.filter(id => isNaN(Number(id)));
//   if (nonNumericIds.length > 0) {
//     Swal.fire('Error', `Invalid IDs: ${nonNumericIds.join(', ')}`, 'error');
//     return;
//   }

//   this.isLoading = true;

//   // First payload for the endorsement (Monitoring System)
//   const endorsePayload = {
//     suspensionIds: this.selectedIds,
//     reviewedBy: this.userId,
//     status:this.activeAction
//   };
//   // Second payload for the suspension (G2C System)
//   const suspendPayload = {
//    cdbNos: this.selectedContractorNumbers.map(item => item.toString()), 
//     firmType: this.firmTypesssss
//   };

//   // First API call - Endorse in Monitoring System
//   this.service.endorseApplications(endorsePayload).subscribe({
//     next: (endorseResponse: string) => {
//       // Only proceed to suspend if endorse succeeds
//       this.service.suspendApplications(suspendPayload).subscribe({
//         next: (suspendResponse: any) => {
//           // Both operations succeeded
//           this.tableData = this.tableData.filter(
//             item => !this.selectedIds.includes(item.id)
//           );
//           this.selectedIds = [];
//           this.selectedContractorNumbers = [];
//           this.isLoading = false;
//           this.formData.remarks = '';
//        this.closeRemarkButton.nativeElement.click();

//           Swal.fire({
//             icon: 'success',
//             title: 'Success',
//             text: `Endorsed: ${endorseResponse}\nSuspended: ${suspendResponse.message || 'Success'}`,
//             confirmButtonColor: '#3085d6'
//           });
//         },
//         error: (suspendError) => {
//           this.isLoading = false;
//           this.handleError('Suspension Failed', suspendError);
//         }
//       });
//     },
//     error: (endorseError) => {
//       this.isLoading = false;
//       this.handleError('Endorsement Failed', endorseError);
//     }
//   });
// }

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
    confirmButtonColor: '#d33'
  });
}

navigate(bcta_no: any,) {
  const employeeDetail = {
      data: bcta_no,
  };
  this.service.setData(
      employeeDetail,
      'BctaNo',
      'monitoring/viewActiveDetails'
  );
}

  onChangeFirmType(firmType: string) {
    this.firmType = firmType;

    switch (firmType) {
      case 'contractorFirm':
        this.router.navigate(['/monitoring/contractor-firm']);
        break;
      case 'consultancyFirm':
        this.router.navigate(['/monitoring/consultancy-firm']);
        break;
      case 'specializedFirm':
        this.router.navigate(['/monitoring/specialized-firm']);
        break;
      case 'certifiedBuilders':
        this.router.navigate(['/monitoring/certified-builders']);
        break;
      default:
        break;
    }
  }



  // Searchfilter() {

  //   // if(this.activeAction =='Suspended'){
  //   //   this.endorse();
  //   // }else if (this.activeAction == 'cancel') {
  //   //   this.cancelAppNo();
  //   // }else if (this.activeAction == 'downgrade') {
  //   //   this.DownGrade();
  //   // }else{
  //   //  this.pageNo = 1;
  //   // this.applySearchFilter();
  //   // }
    
  // }
     Searchfilter(type: any) {
      console.log('type', type);
        // if (this.searchQuery && this.searchQuery.trim() !== '') {
        //   if(type == 'Suspend'){
        //      this.getReportList(this.searchQuery);
        //   }else if (type == 'Cancel'){
        //     this.getCancelList(this.searchQuery);
        //   }else if (type == 'downgrade'){
        //     this.getDownGradeList(this.searchQuery);
        //   }
           
        // } else {
        //     this.getReportList(this.searchQuery);
        // }
    }

  setLimitValue(value: any) {
    this.pageSize = Number(value);
    this.pageNo = 1;
    this.getActiveList();
  }
  processAction(action: any) {
    const actionType = action.actionType.toLowerCase();
    const actionName = actionType === 'suspension' ? 'suspend' : 'cancel';
  }

//  workCategoryMap: Record<string, string> = {
//   // Existing categories from your example
//   '6cd737d4-a2b7-11e4-b4d2-080027dcfac6': 'W1-Roads and Bridges',
//   '8176bd2d-a2b7-11e4-b4d2-080027dcfac6': 'W2-Traditional Bhutanese Painting/Finishing Works',
//   '8afc0568-a2b7-11e4-b4d2-080027dcfac6': 'W3-Buildings,Irrigation,Drainage,Flood Control,Water Supply and Sewerage',
//   '9090a82a-a2b7-11e4-b4d2-080027dcfac6': 'W4-Power and Telecommunication Works',
  
//   // New consultant categories from Gyamtsho's data
//   '2adfae00-be66-11e9-9ac2-0026b988eaa8': 'S-Surveying Services',
//   'e6372584-bc15-11e4-81ac-080027dcfac6': 'A-Architectural Services',
//   'f39b9245-bc15-11e4-81ac-080027dcfac6': 'C-Civil Engineering Services',
//   'fb2aa1a7-bc15-11e4-81ac-080027dcfac6': 'E-Electrical Engineering Services',

//   // Specialized Firm categories from your JSON
//   '3h1f937c-c74f-11e4-bf37-080027dcfac6': 'SF1-Masonry',
//   '3h2f937c-c74f-11e4-bf37-080027dcfac6': 'SF2-Construction Carpentry',
//   '3h3f937c-c74f-11e4-bf37-080027dcfac6': 'SF3-Plumbing',
//   '3h4f937c-c74f-11e4-bf37-080027dcfac6': 'SF4-Electrical',
//   '3h5f937c-c74f-11e4-bf37-080027dcfac6': 'SF5-Welding & Fabrication',
//   '3h6f937c-c74f-11e4-bf37-080027dcfac6': 'SF6-Painting'
// };


// // Work Classification Mapping
// workClassificationMap: Record<string, string> = {
//   // Surveying Services classifications
//   '1129c568-be67-11e9-9ac2-0026b988eaa8': 'S5-Photogrammetric Surveying',
//   '3aba7cc5-be67-11e9-9ac2-0026b988eaa8': 'S7-Survey Instrument Calibration, Maintenance and Certification Services',
//   '4cd73d78-be67-11e9-9ac2-0026b988eaa8': 'S3-Bathymetric Surveying',
//   '5fa269a3-be67-11e9-9ac2-0026b988eaa8': 'S6-GIS & Remote Sensing',
//   '8a6ea970-be66-11e9-9ac2-0026b988eaa8': 'S1-Cadastral Surveying',
//   'b20d9185-be66-11e9-9ac2-0026b988eaa8': 'S2-Topographic Surveying',
//   'fb9e92cb-be66-11e9-9ac2-0026b988eaa8': 'S4-Geodetic & Precision Surveying',
  
//   // Electrical Engineering classifications
//   '1a4e9b6f-bc18-11e4-81ac-080027dcfac6': 'E3-Urban & Rural Electrification, Transmission Line, Communication & Scada',
//   '271c4483-bc18-11e4-81ac-080027dcfac6': 'E4-Construction Management & Site Supervision',
//   '30a3dd3c-bc18-11e4-81ac-080027dcfac6': 'E5-Sub-station',
//   '3ceb09ba-bc18-11e4-81ac-080027dcfac6': 'E6-Energy Efficiency Services',
//   '4461b1b0-bc18-11e4-81ac-080027dcfac6': 'E7-House Wiring',
//   'ded7b309-bc17-11e4-81ac-080027dcfac6': 'E1-Investigation & Design of Hydro Power Projects',
//   'ef1e617f-bc17-11e4-81ac-080027dcfac6': 'E2-Operation & Maintenance of Hydro Power Projects',
  
//   // Architectural Services classifications
//   '2dc059a3-bc17-11e4-81ac-080027dcfac6': 'A1-Architectural and Interior Design',
//   '378c8114-bc17-11e4-81ac-080027dcfac6': 'A2-Urban Planning',
//   '42914a22-bc17-11e4-81ac-080027dcfac6': 'A3-Landscaping and Site Development',
  
//   // Civil Engineering classifications
//   '51f58a70-bc17-11e4-81ac-080027dcfac6': 'C1-Structural Design',
//   '5b147a4d-bc17-11e4-81ac-080027dcfac6': 'C2-Geo-Tech Studies',
//   '6516bfdd-bc17-11e4-81ac-080027dcfac6': 'C3-Social & Environment Studies',
//   '7b84fd72-bc17-11e4-81ac-080027dcfac6': 'C4-Roads, Bridges, Buildings & Air Ports',
//   'a8ee79e6-bc17-11e4-81ac-080027dcfac6': 'C5-Irrigation, Hydraulics, WaterSupply, Sanitation, Sewerage & Solid Waste',
//   'be34bd47-bc17-11e4-81ac-080027dcfac6': 'C6-Construction Management & Site Supervision',
//   'cc3bfc36-bc17-11e4-81ac-080027dcfac6': 'C7-Water Resources & Hydro Power Projects',
//   '003f9a02-c3eb-11e4-af9f-080027dcfac6': 'M-Medium',
//   '0c14ebea-c3eb-11e4-af9f-080027dcfac6': 'R-Registered',
//   'e19afe94-c3ea-11e4-af9f-080027dcfac6': 'L-Large',
//   'ef832830-c3ea-11e4-af9f-080027dcfac6': 'S-Small',
//   '3h1f937c-c74f-11e4-bf37-080027dcfac6': 'SF1-Masonry',
//   '3h2f937c-c74f-11e4-bf37-080027dcfac6': 'SF2-Construction Carpentry',
//   '3h3f937c-c74f-11e4-bf37-080027dcfac6': 'SF3-Plumbing',
//   '3h4f937c-c74f-11e4-bf37-080027dcfac6': 'SF4-Electrical',
//   '3h5f937c-c74f-11e4-bf37-080027dcfac6': 'SF5-Welding & Fabrication',
//   '3h6f937c-c74f-11e4-bf37-080027dcfac6': 'SF6-Painting'
// };

// getDownGradeList(searchQuery?: string) {
//   this.isLoading = true;
//   this.service.getDownGradeDetails().subscribe(
//     (response: any[]) => {
//       this.tableData = response.map(item => {
//         const oldClassification = this.workClassificationMap[item.oldClassificationId] || item.oldClassificationId;
//         const newClassification = item.newClassificationId 
//           ? ` → ${this.workClassificationMap[item.newClassificationId] || item.newClassificationId}`
//           : '';
          
//         return {
//           id: Number(item.id) || 0,
//           contractorId: item.firmId || '',
//           contractorNo: item.bctaNo || '',
//           type: this.formatType(item.firmType),
//           details: this.workCategoryMap[item.workCategoryId] || '-', // Use the mapped name
//           fromTo: `${oldClassification}${newClassification}`,
//           initiatedBy: item.requestedBy || '-',
//           initiatedDate: item.requestedOn || '',
//           status: item.status,
//           actionType: '',
//           selected: false
//         };
//       });
//       this.filteredApplications = [...this.tableData];
//       this.totalCount = this.filteredApplications.length;
//       console.log('Filtered Applications:', this.totalCount);
//       this.isLoading = false;
//        this.showCancelTable = false
//     },
//     (error) => {
//       this.isLoading = false;
//       this.notification.error('Error', 'Failed to load action items');
//     }
//   );
// }

// DownGrade(): void {
//   if (this.selectedIds.length === 0) return;
//   // Validate IDs
//   if (this.selectedIds.some(id => id == null || isNaN(id))) {
//     Swal.fire('Error', 'Invalid ID(s) selected', 'error');
//     return;
//   }
//   const payload = {
//     downgradeIds: this.selectedIds,
//     reviewedBy: this.userId,
//     status: this.activeAction
//   };
//   this.isLoading = true;
//   this.service.DownGradeApplications(payload).subscribe({
//     next: (response) => {
//       this.tableData = this.tableData.filter(item => !this.selectedIds.includes(item.id));
//        this.getDownGradeList();
//       this.selectedIds = [];
//       this.formData.remarks = '';
//        this.closeRemarkButton.nativeElement.click();
//       Swal.fire('Success', 'Operation completed', 'success');
//     },
//     error: (error) => {
//       const errorMsg = error.error?.message || error.message || 'Request failed';
//       Swal.fire('Error', errorMsg, 'error');
//     },
//     complete: () => this.isLoading = false
//   });
// }
showCancelTable: boolean = false;
// getCancelList(searchQuery?: string) {
//   this.isLoading = true;
//   this.service.getCancelApplication().subscribe(
//     (response: any[]) => {
//       this.tableData=[];
//       this.showCancelTable = true;
//       console.log('API Response:', response); // Debugging line
//       this.filteredApplications = response
//       console.log('Filtered Applications:', this.filteredApplications);
//        // Apply filter if searchQuery is provided
//       if (searchQuery && searchQuery.trim() !== '') {
//         const query = searchQuery.trim().toLowerCase();
//         this.filteredApplications = this.filteredApplications.filter(item => 
//           (item.firmId?.toString().toLowerCase().includes(query)) || 
//           (item.firmType?.toString().toLowerCase().includes(query))
//         );
//       }
//       this.setPageData(this.pageNo);
//       this.totalCount = this.filteredApplications.length;
//       this.isLoading = false;
//     },
//     (error) => {
//       this.isLoading = false;
//       this.notification.error('Error', 'Failed to load cancellation items');
//     }
//   );
// }
activeAction: 'cancel' | 'downgrade' | 'Suspended' | 'rejected' | null = null;
get modalTitle(): string {
  switch (this.activeAction) {
    case 'cancel':
      return 'Remarks';
    case 'downgrade':
      return 'Remarks';
    case 'Suspended':
    case 'rejected':
      return 'Remarks';
    default:
      return '';
  }
}

// cancelAppNo(): void {
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
//     firmType: this.firmTypesssss

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
filterByType(firmType: string) {

  // If no firmType is selected (or 'all' is selected), show all data
  if (!firmType || firmType === this.firmTypesssss) {
    this.filteredApplications = [...this.tableData];
  } else {
    // Filter the data based on the selected firmType
    this.filteredApplications = this.tableData.filter(item => item.firmType === firmType);
  }
  
  // Update the total count
  this.totalCount = this.filteredApplications.length;
}
submitAction(): void {
  if (this.selectedIds.length === 0) {
    return;
  }

  const nonNumericIds = this.selectedIds.filter(id => isNaN(Number(id)));
  if (nonNumericIds.length > 0) {
    Swal.fire('Error', `Invalid IDs: ${nonNumericIds.join(', ')}`, 'error');
    return;
  }
  this.isLoading = true;
  const endorsePayload = {
    firmNo: this.bctaNo,
    suspensionIds: this.selectedIds,
    firmType: this.firmType,
    reviewedBy: this.userId,
    licenseStatus: 'Active',
    applicationStatus: 'APPROVED',
  };
  this.service.approveActiveApplications(endorsePayload).subscribe({
    next: (endorseResponse: any) => {
      this.selectedIds = [];
      this.isLoading = false;
      this.formData.remarks = '';
      this.closeRemarkButton.nativeElement.click();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Endorsed: ${endorseResponse.body || 'Success'}`,
        confirmButtonColor: '#3085d6',
      });
      this.getActiveList();
    },
    error: (endorseError) => {
      this.isLoading = false;
      this.handleError('Endorsement Failed', endorseError);
    },
  });
}


 
}

