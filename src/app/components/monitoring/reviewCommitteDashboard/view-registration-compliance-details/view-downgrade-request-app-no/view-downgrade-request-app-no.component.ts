import { Component, Input, ViewChild } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-downgrade-request-app-no',
  templateUrl: './view-downgrade-request-app-no.component.html',
  styleUrls: ['./view-downgrade-request-app-no.component.scss']
})
export class ViewDowngradeRequestAppNoComponent {
  filteredApplications: any[];
  totalCount: number;
  tableData: any[] = [];  
isLoading = false;
  pageSize: number= 10;
  pageNo: number= 1;
  searchQuery: any;
  @Input() activeTab: any;
  set_limit = [10, 25, 50, 100];
  selectedIds: number[] = [];
    selectedApplicationNo: number[] = [];
    selectedContractorNumbers: any;
    firmTypes: any = {};
  userId: any;
  userName: any;
  formData: any={};
   @ViewChild('closeRemarkButton') closeRemarkButton: any;
  selectedFirmType: any;
  type: any;
    categoryList: any;
    classificationList: any;
    fullApplications: any=[];
constructor(private service: CommonService,  private notification: NzNotificationService,) { }
activeAction: 'cancel' | 'Downgraded' | 'Suspended' | 'rejected' | null = null;
  ngOnInit() {
    this.getDownGradeList();
    this.activeTab = this.activeTab;
    this.getCategoryList();
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
 
  setLimitValue(value: any) {
    this.pageSize = Number(value);
    this.pageNo = 1;
    this.getDownGradeList(this.searchQuery);
  }
  private formatType(type: string): string {
    if (!type) return '-';
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  }
  Searchfilter(query: string) {
  this.getDownGradeList(query);
}

 

navigate(bcta_no: any,) {
  const employeeDetail = {
      data: bcta_no,
      activeTab:this.activeTab
  };
  this.service.setData(
      employeeDetail,
      'BctaNo',
      'monitoring/viewDetails'
  );
}
    onCheckboxChange(changedAction: any): void {
        // ✅ Your existing logic — unchanged
        this.type = changedAction.firmType || changedAction.type;

        if (changedAction.selected) {
            this.selectedIds.push(changedAction.id);
        } else {
            this.selectedIds = this.selectedIds.filter(
                (id) => id !== changedAction.id
            );
        }

        const selectedItems = this.tableData.filter((item) => item.selected);
        this.selectedFirmType =
            selectedItems.length > 0 ? selectedItems[0].firmTypes : null;

        // ✅ NEW: Track selected firmIds
        if (!this.selectedContractorNumbers) {
            this.selectedContractorNumbers = [];
        }

        if (changedAction.selected) {
            if (
                !this.selectedContractorNumbers.includes(
                    changedAction.firmId ||
                        changedAction.id ||
                        changedAction.contractorNo
                )
            ) {
                this.selectedContractorNumbers.push(
                    changedAction.firmId ||
                        changedAction.id ||
                        changedAction.contractorNo
                );
            }
        } else {
            this.selectedContractorNumbers =
                this.selectedContractorNumbers.filter(
                    (id) =>
                        id !== changedAction.firmId ||
                        id !== changedAction.id ||
                        changedAction.contractorNo
                );
        }
    }

  getDownGradeList(searchQuery?: string) {
  this.isLoading = true;
  this.service.getDownGradeDetails().subscribe(
    (response: any[]) => {
      this.filteredApplications =response;
       this.getCategoryList();
        this.getClassificationList();
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        this.filteredApplications = this.filteredApplications.filter(item => 
          item.bctaNo?.toString().toLowerCase().includes(query)
        );
      }
      this.totalCount = this.filteredApplications.length;
        this.setPageData(this.pageNo);
      this.isLoading = false;
      this.pageNo = 1;
    },
    (error) => {
      this.isLoading = false;
      this.notification.error('Error', 'Failed to load action items');
    }
  );
}
workCategoryName:any
 getCategoryList() {
  const payload = [{}];

  this.service.fetchDetails(payload, this.pageNo, 100, 'workCategory_view').subscribe(
    (response: any) => {
      this.categoryList = response.data;

      // Create a map of category id to workCategory for faster lookup
      const categoryMap = new Map(
        this.categoryList.map(item => [item.id, item.workCategory])
      );

      // Map the workCategoryId in filteredApplications to their workCategory names
      this.filteredApplications = this.filteredApplications.map(item => ({
        ...item,
        workCategory: categoryMap.get(item.workCategoryId) || 'Unknown'
      }));

      console.log('Mapped Applications with Work Categories:', this.filteredApplications);
    },
    (error) => {
      console.error('Failed to fetch category list', error);
    }
  );
}

getClassificationList() {
  const payload = [{}];

  this.service.fetchDetails(payload, this.pageNo, 100, 'workClassification_view').subscribe(
    (response: any) => {
      this.classificationList = response.data;

      // Create a map for easy lookup: id -> workClassification
      const classificationMap = new Map(
        this.classificationList.map(item => [item.id, item.workClassification])
      );

      // Attach oldClassification and newClassification to each application
      this.filteredApplications = this.filteredApplications.map(item => ({
        ...item,
        oldClassification: classificationMap.get(item.oldClassificationId) || 'cancel',
        newClassification: classificationMap.get(item.newClassificationId) || 'cancel'
      }));

      console.log('Mapped Applications with Classifications:', this.filteredApplications);
    },
    (error) => {
      console.error('Failed to fetch classification list', error);
    }
  );
}

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
    status: this.activeAction,
  };

  this.isLoading = true;

  this.service.DownGradeApplications(payload).subscribe({
    next: (response) => {
      this.tableData = this.tableData.filter(item => !this.selectedIds.includes(item.id));
      this.getDownGradeList();
      this.selectedIds = [];
      this.formData.remarks = '';
      this.closeRemarkButton.nativeElement.click();

      // Determine message based on action
      const action = this.activeAction?.toLowerCase();
      const message =
        action === 'rejected'
          ? 'Application(s) rejected successfully.'
          : action === 'downgraded'
          ? 'Application(s) downgraded successfully.'
          : 'Operation completed successfully.';

      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: message,
        confirmButtonColor: '#3085d6',
      });
    },
    error: (error) => {
      const errorMsg = error.error?.message || error.message || 'Request failed';
      Swal.fire('Error', errorMsg, 'error');
    },
    complete: () => (this.isLoading = false),
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
     setPageData(page: number): void {
            const startIndex = (page - 1) * this.pageSize;
            const endIndex = startIndex + this.pageSize;
            this.tableData = this.filteredApplications.slice(startIndex, endIndex);
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
    
       
    
}


