import { Component, Input, ViewChild } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-view-suspend-request-app-no',
    templateUrl: './view-suspend-request-app-no.component.html',
    styleUrls: ['./view-suspend-request-app-no.component.scss'],
})
export class ViewSuspendRequestAppNoComponent {
    pageSize: number = 10;
    tableData: any;
    fullTableData: any;
    isLoading: boolean = false;
    pageNo: number = 1;
    totalCount: any;
    selectedApplicationNo: number[] = [];
    selectedIds: number[] = [];
    selectedContractorNumbers: any;
    searchQuery: string;
    set_limit: number[] = [10, 15, 25, 100];
    userId: any;
      @Input() activeTab: any;
    userName: any;
    formData: any = {};
    @ViewChild('closeRemarkButton') closeRemarkButton: any;
    constructor(
        private service: CommonService,
        private notification: NzNotificationService
    ) {}

    ngOnInit(): void {
        this.activeTab = this.activeTab;
        this.getReportList();
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
  getReportList(searchQuery?: string) {
  this.isLoading = true;
  this.service.getDatabasedOnReviewAction().subscribe(
    (response: any[]) => {
      this.fullTableData = response;

      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.trim().toLowerCase();
        this.fullTableData = this.fullTableData.filter(item => 
          item.firmId?.toString().toLowerCase().includes(query)
        );
      }
      this.totalCount = this.fullTableData.length;
      this.pageNo = 1; // reset to first page
      this.setPageData(this.pageNo);
      this.isLoading = false;
    },
    (error) => {
      this.isLoading = false;
      this.notification.error('Error', 'Failed to load action items');
    }
  );
}

    navigate(bcta_no: any) {
        const employeeDetail = {
            data: bcta_no,
            activeTab:this.activeTab
        };
        this.service.setData(
            employeeDetail,
            'BctaNo',
            'monitoring/viewSuspendDetails'
        );
    }
    firmTypesssss: any;
    selectedFirmType: string | null = null;

    onCheckboxChange(changedAction: any): void {
        // ✅ Your existing logic — unchanged
        this.firmTypesssss = changedAction.firmType || changedAction.type;

        if (changedAction.selected) {
            this.selectedIds.push(changedAction.id);
        } else {
            this.selectedIds = this.selectedIds.filter(
                (id) => id !== changedAction.id
            );
        }

        const selectedItems = this.tableData.filter((item) => item.selected);
        this.selectedFirmType =
            selectedItems.length > 0 ? selectedItems[0].firmType : null;

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

  Searchfilter(query: string) {
  this.getReportList(query);
}

    activeAction: string | null = null;
        isCheckboxDisabled(action: any): boolean {
        // Disable if a firmType is selected and it doesn't match this row's firmType
        return (
            this.selectedFirmType !== null &&
            this.selectedFirmType !== action.firmType &&
            !action.selected
        );
    }

setPageData(page: number): void {
  const startIndex = (page - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.tableData = this.fullTableData.slice(startIndex, endIndex);
  console.log('Table Data:', this.tableData);
}
    setLimitValue(value: any) {
        this.pageSize = Number(value);
        this.pageNo = 1;
        this.getReportList(this.searchQuery);
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

 submitAction(): void {
  if (this.selectedIds.length === 0) {
    return;
  }
  const nonNumericIds = this.selectedIds.filter((id) =>
    isNaN(Number(id))
  );
  if (nonNumericIds.length > 0) {
    Swal.fire(
      'Error',
      `Invalid IDs: ${nonNumericIds.join(', ')}`,
      'error'
    );
    return;
  }

  this.isLoading = true;

  const endorsePayload = {
    suspensionIds: this.selectedIds,
    reviewedBy: this.userId,
    status: this.activeAction,
  };

  const suspendPayload = {
    cdbNos: this.selectedContractorNumbers.map((item) => item.toString()),
    firmType: this.firmTypesssss,
  };

  this.service.endorseApplications(endorsePayload).subscribe({
    next: (endorseResponse: string) => {
      this.service.suspendApplications(suspendPayload).subscribe({
        next: (suspendResponse: any) => {
          this.tableData = this.tableData.filter(
            (item) => !this.selectedIds.includes(item.id)
          );
          this.selectedIds = [];
          this.selectedContractorNumbers = [];
          this.isLoading = false;
          this.formData.remarks = '';
          this.closeRemarkButton.nativeElement.click();
          this.getReportList(this.searchQuery);

          const action = this.activeAction?.toLowerCase();
          const message =
            action === 'rejected'
              ? 'Application(s) rejected successfully.'
              : `Application(s) endorsed and suspended successfully.\n${suspendResponse.message || ''}`;

          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: message,
            confirmButtonColor: '#3085d6',
          });
        },
        error: (suspendError) => {
          this.isLoading = false;
          this.handleError('Suspension Failed', suspendError);
        },
      });
    },
    error: (endorseError) => {
      this.isLoading = false;
      this.handleError('Endorsement Failed', endorseError);
    },
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
}
