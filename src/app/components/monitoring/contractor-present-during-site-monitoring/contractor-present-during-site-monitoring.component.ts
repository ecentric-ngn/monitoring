import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
    selector: 'app-contractor-present-during-site-monitoring',
    templateUrl: './contractor-present-during-site-monitoring.component.html',
    styleUrls: ['./contractor-present-during-site-monitoring.component.scss'],
})
export class ContractorPresentDuringSiteMonitoringComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: string;
    errorMessages: any = {};
    @Input() tableId: any;
    @Output() contractorPresentData = new EventEmitter<{
        tableId: any;
        data: any;
    }>();
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    fileAndRemark: any;
    @Input() prevTableId: any;
    @Input() data: any;
    appNoStatus: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.tableId = this.tableId;
        this.data = this.data;
        this.appNoStatus = this.data.applicationStatus;
        this.prevTableId = this.prevTableId;
        if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId;
        }
        if (this.prevTableId) {
            this.getDatabasedOnChecklistId();
        }
        console.log('tableIdincontractorrepresentive', this.tableId);
    }
    getDatabasedOnChecklistId() {
        const payload: any = [
            {
                field: 'checklist_id',
                value: this.prevTableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload, 1, 2, 'comprehensive_checklist_view').subscribe(
                (response: any) => {
                    const data = response.data[0];
                    this.formData.cidNo = data.contractor_cid_no;
                    this.formData.fullName = data.contractor_full_name;
                    this.formData.mobileNo = data.contractor_mobile_no;
                    const parsedFileResponse =
                        typeof response === 'string'
                            ? JSON.parse(response)
                            : typeof response.data[0].files === 'string'
                            ? JSON.parse(response.data[0].files)
                            : response.data[0].files;
                    this.fileAndRemark = parsedFileResponse;
                },
                // Error handler
                (error) => {
                    console.error('Error fetching contractor details:', error); // Log the error
                }
            );
    }

    onCidChange() {
        if (
            this.formData.cidNo &&
            this.formData.cidNo.toString().length === 11
        ) {
            this.getCidDetails(this.formData.cidNo);
        }
    }
    isLoading = false;
    validateMobileNumber() {
        const mobile = (this.formData?.mobileNo || '').toString().trim();
        this.errorMessages.mobile =
            mobile.length > 8
                ? "Contact number can't be more than 8 digits."
                : '';
    }
    getCidDetails(cidNo: number): void {
        this.isLoading = true;
        this.service.getCitizenDetails(cidNo).subscribe(
            (response: any) => {
                if (response?.citizenDetailsResponse?.citizenDetail?.length) {
                    const citizen =
                        response.citizenDetailsResponse.citizenDetail[0];
                    const name = [
                        citizen.firstName,
                        citizen.middleName,
                        citizen.lastName,
                    ]
                        .filter((part) => part)
                        .join(' ');
                    this.formData.fullName = name;
                    this.isLoading = false;
                } else {
                    this.errorMessages.notFound = 'Not Registered in DCRC';
                    this.isLoading = false;
                }
                console.log(response);
            },
            (error) => {
                if (error.status === 500) {
                    this.isLoading = false;
                    this.errorMessages.server = 'Something went wrong';
                    console.error('Something went wrong:', error);
                }
            }
        );
    }
    saveAndNext(form: NgForm): void {
        // Optional: Validate form
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
            return;
        }
        const payload = {
            id: parseInt(this.tableId, 10),
            contractorCidNo: this.formData.cidNo,
            contractorFullName: this.formData.fullName,
            contractorMobileNo: this.formData.mobileNo,
        };
        this.service.saveAsDraft(payload).subscribe(
            (response: any) => {
                this.createNotification();
                this.contractorPresentData.emit({
                    tableId: this.tableId,
                    data: this.data,
                }); // You can also emit the ID if needed
                this.router.navigate(['monitoring/adding-site-engineer']);
            },
            (error: any) => {}
        );
    }

    createNotification(): void {
        this.notification
            .success('Success', 'The data has been saved successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }

    onPreviousClick() {
        this.previousClicked.emit(this.tableId);
        this.router.navigate(['monitoring/hrstrength-at-site']);
    }
}
