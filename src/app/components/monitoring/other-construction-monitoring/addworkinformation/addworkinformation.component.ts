import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../../service/common.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-addworkinformation',
    templateUrl: './addworkinformation.component.html',
    styleUrls: ['./addworkinformation.component.scss'],
})
export class AddworkinformationComponent {
    formData: any = {};
    dzongkhagList: any;
    @Input() workType: any;
    @Output() saveOwnerInformationData = new EventEmitter<{
        workType: any;
        ownerId: any;
        data: any;
    }>();
    ownerId: any;
    appNoStatus: any;
    otherWorkType: any;
    @Input() contractorPrevId: any;
    constructor(private service: CommonService, private router: Router) {}
    @Input() prevOwnerTableId: any;
    PocuringAgencyList: any = [];
    tableData: any = [];
    contractorId: any;
    data: any;
 ngOnInit(): void {
  // this.getPocuringAgency(); // Uncomment if needed
  this.getDzongkhagList();
  this.contractorPrevId = this.contractorPrevId ?? null;
  
  const WorkDetail = this.service.getData('BctaNo');
  this.data = WorkDetail ?? null;
  const workData = WorkDetail?.data ?? {};
  this.prevOwnerTableId = this.prevOwnerTableId || (workData.work_information_id ?? null);
  this.appNoStatus = workData.applicationStatus ?? null;
  console.log('prevOwnerTableId', this.prevOwnerTableId);
  if (this.prevOwnerTableId) {
    this.getDatabasedOnOwnerId();
  }
  this.contractorId = WorkDetail?.newContractorId ?? null;
  
  this.workType = this.workType; // seems unnecessary unless you're trying to update it dynamically
  console.log('WorkDetailinaddinformation', WorkDetail);
}


     
    showFormDetails:boolean=false

    onclick(Type: any) {
      this.otherWorkType =Type
      this.showFormDetails=true  
    }
    getDzongkhagList() {
        const dzongkhag = {
            viewName: 'dzongkhagList',
            pageSize: 20,
            pageNo: 1,
            condition: [],
        };

        this.service.fetchAuditData(dzongkhag).subscribe(
            (response: any) => {
                this.dzongkhagList = response.data;
            },
            // Error handler
            (error) => {
                console.error('Error fetching contractor details:', error); // Log the error
            }
        );
    }
    // getPocuringAgency() {
    //     const queryPayload = {
    //         viewName: 'procuringAgencyList',
    //         pageSize: 1000,
    //         pageNo: 1,
    //         condition: [],
    //     };
    //     this.service.fetchAuditData(queryPayload).subscribe(
    //         (response: any) => {
    //             this.PocuringAgencyList = response.data;
    //             const pocuringAgency = this.PocuringAgencyList.find((item: any) => item.id === this.formData.client);
    //             this.formData.client = pocuringAgency.id
    //             console.log('his.formData.client', this.formData.client);
    //         },
    //         (error) => {
    //             console.error('Error fetching contractor details:', error); // Log the error
    //         }
    //     );
    // }
    getDatabasedOnOwnerId() {
        const payload: any = [
            {
                field: 'work_id',
                value: this.prevOwnerTableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        
        this.service.fetchDetails(payload, 1, 1, 'work_with_contractor_view').subscribe(
                (response: any) => {
                    const data = response.data[0];
                    this.formData.projectName = data.project_name;
                    this.formData.contractAmount = data.contract_amount;
                    this.formData.dzongkhagId = data.dzongkhag;
                    this.formData.placeName = data.place;
                    this.formData.startDate = data.start_date;
                    this.formData.client = data.client;
                    this.formData.proposedCompletionDate =data.proposed_completion_date;
                    this.formData.workType = data.workType
                    if(this.formData.workType){
                        this.showFormDetails=true
                    }
                    // this.getPocuringAgency();
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }

    saveOwnerInformation(form: any) {
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
            return; // Exit if form is invalid
        }

        // If status is REJECTED, don't construct payload or call API
        if (this.appNoStatus === 'REJECTED' || this.contractorPrevId) {
            this.saveOwnerInformationData.emit({
                workType: this.workType,
                ownerId: this.prevOwnerTableId,
                data: this.data,
            });
            
            this.router.navigate([
                'monitoring/onsite-facilitiesand-management',
            ]);
            return;
        }

        // Only construct payload and call API if status is not REJECTED
        const payload = {
            projectName: this.formData.projectName,
            dzongkhag: this.formData.dzongkhagId,
            place: this.formData.placeName,
            contractAmount: parseInt(this.formData.contractAmount, 10),
            startDate: this.formData.startDate,
            proposedCompletionDate: this.formData.proposedCompletionDate,
            client: this.formData.client,
            contractorId: this.contractorId,
            workType: this.otherWorkType
        };

        this.service.saveWorkInformation(payload).subscribe((response: any) => {
            const idMatch = response.match(/\d+/);
            this.ownerId = idMatch ? parseInt(idMatch[0], 10) : null;
            this.saveOwnerInformationData.emit({
                workType: this.workType,
                ownerId: this.ownerId,
                   data: {
                ...this.data,
                contractorId: this.contractorId
    },
            });
            this.router.navigate([
                'monitoring/onsite-facilitiesand-management',
            ]);
        });

        console.log(payload);
    }
}
