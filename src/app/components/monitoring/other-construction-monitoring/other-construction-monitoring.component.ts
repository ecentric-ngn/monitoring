import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '../../../service/common.service';
import { NgForm } from '@angular/forms';

@Component({
    selector: 'app-other-construction-monitoring',
    templateUrl: './other-construction-monitoring.component.html',
    styleUrls: ['./other-construction-monitoring.component.scss'],
})
export class OtherConstructionMonitoringComponent {
    formData: any = {};
    @Input() workType: any;
    displayMessage: string;
    dzongkhagList: any;
    tableData: any;
    constructor(private router: Router, private service: CommonService) {}

    ngOnInit() {
        this.workType = this.workType;
        this.fetchOtherConstructionDetails();
    }
    saveObservationReport(form: any) {
        console.log(this.formData);
    }

    navigateToEdit(data: any) {
        const workDetail = { data: data.work_information_id, checklistid: data.id, workType: this.workType,otherWorkType:data.workType };
        this.service.setData(workDetail, 'BctaNo', 'monitoring/WorkDetail');
    }
pageNo:number = 1;
pageSize:number = 10;
   fetchOtherConstructionDetails(searchQuery?: string) {
    const payload: any[] = [];
    // Add search condition if searchQuery is provided
    if (searchQuery) {
        payload.push(
            {
            field: 'contractorNo',
            value: `%${searchQuery}%`,
            condition: 'LIKE',
            operator: 'AND'
        },
         {
            field: 'applicationStatus',
            value: `%${searchQuery}%`,
            condition: 'LIKE',
            operator: 'AND'
        },
    );
    }
    this.service
        .fetchDetails(
            payload,
            this.pageNo,
            this.pageSize,
            't_otherconstruction_view'
        )
        .subscribe(
            (response: any) => {
                this.tableData = response.data;
            },
            (error) => {
                console.error('Error fetching contractor details:', error);
            }
        );
}

    searchBasedOnBCTANo() {
        const contractor = {
            viewName: 'contractor',
            pageSize: 10,
            pageNo: 1,
            condition: [
                {
                    field: 'contractorNo',
                    value: this.formData.contractorNo,
                },
            ],
        };
        this.service.viewData(contractor).subscribe(
            (response: any) => {
                if (response.data.length) {
                    this.formData = response.data[0];
                } else {
                    this.displayMessage =
                        'No data found for this BCTA number. Please add it manually';
                    this.formData.nameOfFirm = '';
                    this.formData.address = '';
                    this.formData.ownerDetails = '';
                }
            },
            (error) => {}
        );
    }
    newContractorId: any;
    clearErrorMessage() {
        this.displayMessage = '';
    }
    saveCrpsDetails(form: NgForm) {
        
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
            return;
        }
        const contractorDetails = {
            bctaregNumber: this.formData.contractorNo,
            ownerName: this.formData.ownerDetails,
            specializedFirmName: this.formData.nameOfFirm,
            specializedClass: this.formData.workClassification,
            address: this.formData.establishmentAddress ,
            mobileNumber: this.formData.mobileNo,
            email: this.formData.email,
            clientOwnerName: this.formData.ClientOwnerName,
            clientAddress: this.formData.clientCurrentAddress,
            clientMobileNumber: this.formData.clientMobileNo,
            clientEmail: this.formData.clientEmailAddress,

        };
        this.service.saveNewContractorInformationData(contractorDetails).subscribe(
                (response: any) => {
                    // Success handler
                    const idMatch = response.match(/\d+/); // extract digits from string
                    this.newContractorId = idMatch
                        ? parseInt(idMatch[0], 10)
                        : null;
                    console.log('ownerId', this.newContractorId);
                    const WorkDetail = {
                        data: contractorDetails,
                        workId: this.workType,
                        newContractorId: this.newContractorId,
                        workType: this.workType,
                    };
                    this.service.setData(
                        WorkDetail,
                        'BctaNo',
                        'monitoring/WorkDetail'
                    );
                },
                (error: any) => {
                    console.error('Error saving work information', error);
                    // Optionally show error toast or message
                }
            );
    }

    resetData() {
        this.formData = {};
    }
}
