import { Component, ViewChild } from '@angular/core';
import { CommonService } from '../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { AuthServiceService } from '../../../../auth.service';
declare var bootstrap: any;

@Component({
    selector: 'app-view-reg-compliancelist',
    templateUrl: './view-reg-compliancelist.component.html',
    styleUrls: ['./view-reg-compliancelist.component.scss'],
})
export class ViewRegCompliancelistComponent {

    filteredData: any[] = [];
    displayedData: any[] = [];
    currentPage: number = 1;
    itemsPerPage: number = 10;

    searchQuery: any;
    set_limit: number[] = [10, 15, 25, 100];
    formData: any = {};
    tableData: any = [];
    bsModal: any;
    loading: boolean = false;
    selectedIds: number[] = [];
    private isFetching = false;
    private autoRefreshInterval: any;

    firmType: string = '';
    selectedFirmType: string = '';

    selectedAction: any = {
        actionType: '',
        actionDate: '',
        remarks: '',
        newClassification: '',
        contractorId: '',
        contractorNo: ''
    };

    downgradeList: any[] = [];
    workClassificationList: any[] = [];

    reinstateData: any = null;
    reinstateModal: any = null;
    constructionFirmModal: any = null;
    searchTerm: string = '';
    statusFilter: string = 'All';
    username: string = '';
    contractorClasses = ['S-Small', 'M-Medium', 'L-Large', 'All'];
    today: string = new Date().toISOString().substring(0, 10);
    dzongkhagList: any[] = [];
    constructor(
        private service: CommonService,
        private notification: NzNotificationService,
        private router: Router,
        private authService: AuthServiceService
    ) { }

    ngOnInit() {
        this.fetchComplianceDetails();
        this.getDzongkhagList();
        this.username = this.authService.getUsername() || 'NA';
        // Auto-refresh every 60 seconds (60000 ms)
        this.autoRefreshInterval = setInterval(() => {
            this.fetchComplianceDetails();
            console.log('Auto-refreshed compliance data');
        }, 60000);
    }


      getDzongkhagList() {
        const dzongkhag = {
            viewName: 'dzongkhagList',
            pageSize: 21,
            pageNo: 1,
            condition: [],
        };

        this.service.fetchAuditData(dzongkhag).subscribe(
            (response: any) => {
                this.loading = false;
                this.dzongkhagList = response.data;
                console.log('responseDzongkag', response);
            },
            // Error handler
            (error) => {
                this.loading = false; // Set loading to false as an error occurred
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }
    ngOnDestroy() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
        }
    }

    sendMassMail() {
        this.loading = true;
        this.formData.deadline = this.calculatedDeadline;
        this.service.sendMassEmail(this.formData).subscribe({
            next: (response) => {
                this.loading = false;
                this.handleSuccess(response);
                this.resetForm();
                this.closeFirmModal();
                this.showSuccessNotification();
            },
            error: (error) => this.handleError(error)
        });
    }

    closeFirmModal() {
        if (this.constructionFirmModal) {
            this.constructionFirmModal.hide();
        } else {
            const modalEl = document.getElementById('constructionFirmModal');
            if (modalEl) {
                modalEl.classList.remove('show');
                modalEl.style.display = 'none';
                document.body.classList.remove('modal-open');
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(el => el.remove());
            }
        }
    }

    private resetForm() {
        this.dateData = {};
        this.formData = {};
    }

    private showSuccessNotification() {
        Swal.fire({
            title: 'Success!',
            text: 'The mass email has been sent successfully to the designated recipients.',
            icon: 'success',
            confirmButtonText: 'OK',
            willClose: () => {
                // Cleanup before closing
                document.body.classList.remove('swal2-shown');
                document.body.style.overflow = '';
            }
        }).then(() => {
            // Force cleanup
            const backdrops = document.querySelectorAll('.swal2-backdrop, .modal-backdrop');
            backdrops.forEach(el => el.remove());
            document.body.classList.remove('modal-open', 'swal2-no-backdrop');
            document.body.style.paddingRight = '';
        });
    }
    private handleSuccess(response: any) {
        console.log('Email sent successfully:', response);
    }

    private handleError(error: any) {
        console.error('Error sending email:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Failed to send mass email. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    }

    dateData: any = {};

    get calculatedDeadline() {
        if (this.dateData.date) {
            const d = new Date(this.dateData.date);
            d.setDate(d.getDate() + 7); //7 days deadline
            return d.toISOString().substring(0, 10);
        }
        return '';
    }

    onChangeFirmType(firmType: string) {
        this.firmType = firmType;

        switch (firmType) {
            // case 'constructionFirm':
            //     this.router.navigate(['/reg-compliance/construction']);
            //     break;
            case 'consultancyFirm':
                this.router.navigate(['/monitoring/consultancy']);
                break;
            case 'specializedFirm':
                this.router.navigate(['/monitoring/specialized']);
                break;
            case 'certifiedBuilders':
                this.router.navigate(['/monitoring/certified']);
                break;
            default:
                break;
        }
    }

    fetchComplianceDetails() {
        if (this.isFetching) return;

        this.isFetching = true;
        this.service.fetchComplianceData().subscribe(
            (response: any) => {
                this.tableData = response;
                this.filteredData = this.tableData;
                this.updateDisplayedData();
                console.log('Fetched Data', this.tableData);
                this.isFetching = false;
            },
            (error) => {
                console.error('Error fetching compliance data:', error);
                this.isFetching = false;
            }
        );
    }

    Searchfilter() {
        const query = (this.searchQuery || '').toLowerCase();
        this.filteredData = this.tableData.filter(item =>
            (item.contractorNo && item.contractorNo.toString().toLowerCase().includes(query)) ||
            (item.nameOfFirm && item.nameOfFirm.toLowerCase().includes(query)) ||
            (item.applicationStatus && item.applicationStatus.toLowerCase().includes(query)) ||
            (item.licenseStatus && item.licenseStatus.toLowerCase().includes(query))
        );
        this.currentPage = 1; // Reset to first page on new search
        this.updateDisplayedData();
    }

    updateDisplayedData() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        this.displayedData = this.filteredData.slice(start, end);
    }

    setLimitValue(value: any) {
        this.itemsPerPage = +value;
        this.currentPage = 1;
        this.updateDisplayedData();
    }

    goToPreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updateDisplayedData();
        }
    }

    goToNextPage() {
        if (this.currentPage * this.itemsPerPage < this.filteredData.length) {
            this.currentPage++;
            this.updateDisplayedData();
        }
    }

    navigate(data: any) {
        // Only proceed if status is "Submitted"
        if (data.applicationStatus === 'Submitted' || data.applicationStatus === 'Resubmitted PFS'
            || data.applicationStatus === 'Resubmitted OS and PFS' || data.applicationStatus === 'Resubmitted OS'
            || data.applicationStatus === 'Resubmitted HR' || data.applicationStatus === 'Resubmitted EQ' || data.applicationStatus === 'Suspension Resubmission' || data.applicationStatus === 'Suspension Approved') {
            const workId = data.contractorNo;
            this.prepareAndNavigate(data, workId);
        }
    }

    private prepareAndNavigate(data: any, workId: string) {
        const workDetail = {
            data: data,
            firmType: this.firmType
        };

        console.log('Navigation payload:', workDetail);

        this.service.setData(
            workDetail,
            'BctaNo',
            'monitoring/RegFirmInformation'
        );
    }

    onCheckboxChange(event: Event, id: string) {
        const isChecked = (event.target as HTMLInputElement).checked;
        const numericId = Number(id); // convert to number

        if (isChecked) {
            if (!this.selectedIds.includes(numericId)) {
                this.selectedIds.push(numericId);
            }
        } else {
            this.selectedIds = this.selectedIds.filter(item => item !== numericId);
        }

        console.log('Selected IDs (as numbers):', this.selectedIds);
    }

    forwardToRC() {
        if (this.selectedIds.length === 0) {
            Swal.fire('Warning', 'No items selected', 'warning');
            return;
        }

        const payload = this.selectedIds

        this.service.forwardToReviewCommitee(payload).subscribe(
            (res) => {
                console.log('Successfully sent selected IDs:', res);
                Swal.fire('Success', 'Selected contractors submitted successfully', 'success');
            },
            (error) => {
                console.error('Error sending selected IDs:', error);
                Swal.fire('Error', 'Failed to submit selected contractors', 'error');
            }
        );
    }

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

    onActionTypeChange() {
        if (this.selectedAction.actionType === 'downgrade') {
            const firmId = this.selectedAction.target?.contractorId;
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
                firmId: this.selectedAction.target?.contractorId,
                bctaNo:this.selectedAction.target?.contractorNo,
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

    closeReinstateModal() {
        if (this.reinstateModal) {
            this.reinstateModal.hide();
        }
    }

    reinstate(row: any) {
        const payload = {
            firmNo: row,
            firmType: "contractor",
            licenseStatus: "Active"
        };

        const approvePayload = {
            firmType: "Contractor",
            cdbNos: row
        };

        forkJoin({
            reinstate: this.service.reinstateLicense(payload),
            approve: this.service.approveReinstatement(approvePayload)
        }).subscribe({
            next: ({ reinstate, approve }) => {
                if (reinstate && reinstate.toLowerCase().includes('license status updated to active')) {
                    Swal.fire('Success', 'License Reinstated and Approved Successfully', 'success');
                    this.closeModal();
                } else {
                    Swal.fire('Warning', 'Unexpected response from server.', 'warning');
                }
                this.router.navigate(['/monitoring/construction']);
                this.closeModal();
            },
            error: (err) => {
                console.error('Reinstatement error:', err);
                this.closeModal();
                Swal.fire('Success', 'License Reinstated and Approved Successfully', 'success');
            }
        });
    }

}
