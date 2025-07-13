import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
@Component({
    selector: 'app-hrstrength-at-site',
    templateUrl: './hrstrength-at-site.component.html',
    styleUrls: ['./hrstrength-at-site.component.scss'],
})
export class HRStrengthAtSiteComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: string;
    @Input() tableId: any;
     @Output() humanResourcestrengthsitedata = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    fileAndRemark: any;
    userName: any;
    @Input() prevTableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    
    appNoStatus: any ={};
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.inspectionType = this.inspectionType;
        this.tableId = this.tableId;
        this.prevTableId = this.prevTableId;
          this.appNoStatus = this.data?.applicationStatus ?? null;

         if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId
        }
        if (this.prevTableId) {
            this.getDatabasedOnChecklistId();
        }
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userName = userDetails.username;
        }
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
        this.service
            .fetchDetails(payload, 1, 2, 'human_resources_strength')
            .subscribe(
                (response: any) => {
                    const data = response.data[0];
                    this.formData.totalNoOfBhutaneseLabors = data.total_bhutanese_labors;
                    this.formData.totalNoOfNumericNonBhutaneseLabors =data.total_non_bhutanese_labors;
                    this.formData.remarks = data.remarks;
                },
                // Error handler
                (error) => {
                    console.error('Error fetching contractor details:', error); // Log the error
                }
            );
    }
    formType: '14';
    remarks: any
    saveAndNext(form: NgForm): void {
        // Uncomment this block if you want form validation

        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
            return;
        }
 // Create a static dummy file
    const fileContent = new Blob(['This is a static file content'], { type: 'text/plain' });
    const staticFile = new File([fileContent], 'staticFile.txt', { type: 'text/plain' });
    const payload={
        remarks: this.formData.remarks
    }
    this.remarks = payload
    this.service.uploadFiles(staticFile,this.formData.remarks,'14',this.userName )
            .subscribe((fileId: string) => {
                const match = fileId.match(/[0-9a-fA-F\-]{36}/);
                if (match) {
                    this.fileId = match[0];
                } else {
                    this.formData.uploadFile = 'NoFileUploaded';
                    return;
                }

                const payload = {
                    totalBhutaneseLabors:
                        this.formData.totalNoOfBhutaneseLabors,
                    totalNonBhutaneseLabors:
                        this.formData.totalNoOfNumericNonBhutaneseLabors,
                    id: this.tableId,
                };

                this.service.saveAsDraft(payload).subscribe((response: any) => {
                    this.createNotification();
                    this.humanResourcestrengthsitedata.emit({
                        tableId: this.tableId,
                        data: this.data,
                        inspectionType: this.inspectionType
                    });
                    this.router.navigate([
                        'monitoring/contractor-present-during-site-monitoring',
                    ]);
                });
            });
    }

    createNotification(): void {
        this.notification
            .success('Success', 'The data has been saved successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }

    onPreviousClick() {
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/committed-equipment']);
    }
}
