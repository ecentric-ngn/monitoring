import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
    selector: 'app-certified-skilled-worker',
    templateUrl: './certified-skilled-worker.component.html',
    styleUrls: ['./certified-skilled-worker.component.scss'],
})
export class CertifiedSkilledWorkerComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: string;
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
      @Input() workId: any;
    @Output() savedCertifiedSkilledWorkerData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    userName: any;
    fileAndRemark: any;
    @Input() prevTableId: any;
    appNoStatus: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit(): void {
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userName = userDetails.username;
        }
        this.prevTableId = this.prevTableId 
          this.appNoStatus = this.data?.applicationStatus ?? null;
         if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId
        }
        if (this.prevTableId || this.workId) {
            this.getDatabasedOnChecklistId();
        }
        this.tableId = this.tableId;
        this.data = this.data;
        this.inspectionType = this.inspectionType;
    }

    carpenters: any[] = [{ level: '', number: '' }];
    masons: any[] = [{ level: '', number: '' }];
    rodBenders: any[] = [{ level: '', number: '' }];
    plumbers: any[] = [{ level: '', number: '' }];
    electricians: any[] = [{ level: '', number: '' }];
    steelFabricators: any[] = [{ level: '', number: '' }];
    painters: any[] = [{ level: '', number: '' }];
    blasters: any[] = [{ level: '', number: '' }];

    getDatabasedOnChecklistId() {
        const payload: any = [
            {
                field: 'checklist_id',
                value: this.prevTableId, // Make sure this ID matches your actual checklist
                operator: 'AND',
                condition: '=',
            },
                    {
                field: 'workid',
                value: this.workId,
                operator: 'AND',
                condition: '=',
                },
        ];

        this.service.fetchDetails(payload, 1, 100, 'csw_view').subscribe(
            (response: any) => {
                const data = response.data;
                // Clear existing arrays before repopulating
                this.carpenters = [];
                this.masons = [];
                this.rodBenders = [];
                this.plumbers = [];
                this.electricians = [];
                this.steelFabricators = [];
                this.painters = [];
                this.blasters = [];

                // Populate arrays based on skilled_worker_type
                data.forEach((item: any) => {
                    const worker = {
                    
                        level: item.certificates,
                        number: item.number_of_workers,
                    };
                    switch (item.skilled_worker_type) {
                        case 'carpenter':
                            this.carpenters.push({
                                id: item.id,
                                carpenterCertification: item.certificates,
                                carpenterNumber: item.number_of_workers,
                                
                            });
                            this.formData.carpentersRemarks = item.remarks;
                            break;

                        case 'mason':
                            this.masons.push({
                                   id: item.id,
                                masonCertification: item.certificates,
                                masonNumber: item.number_of_workers,
                                 
                            });
                            this.formData.masonsRemarks = item.remarks;
                            break;

                        case 'rodBender':
                            this.rodBenders.push({
                                   id: item.id,
                                rodBenderCertification: item.certificates,
                                rodBenderNumber: item.number_of_workers,
                                 
                            });
                            this.formData.rodBendersRemarks = item.remarks;
                            break;

                        case 'plumber':
                            this.plumbers.push({
                                   id: item.id,
                                plumberLevel: item.certificates,
                                plumberNumber: item.number_of_workers,
                                 
                            });
                            this.formData.plumbersRemarks = item.remarks;
                            break;

                        case 'electrician':
                            this.electricians.push({
                                   id: item.id,
                                electricianLevel: item.certificates,
                                electricianNumber: item.number_of_workers,
                                 
                            });
                            this.formData.electriciansRemarks = item.remarks;
                            break;

                        case 'steelFabricator':
                            this.steelFabricators.push({
                                   id: item.id,
                                steelFabricatorCertification: item.certificates,
                                steelFabricatorNumber: item.number_of_workers,
                                 
                            });
                            this.formData.steelFabricatorsRemarks =
                                item.remarks;
                            break;

                        case 'painter':
                            this.painters.push({
                                   id: item.id,
                                painterLevel: item.certificates,
                                painterNumber: item.number_of_workers,
                                 
                            });
                            this.formData.paintersRemarks = item.remarks;
                            break;

                        case 'blaster':
                            this.blasters.push({
                                   id: item.id,
                                blasterLevel: item.certificates,
                                blasterNumber: item.number_of_workers,
                                 
                            });
                            this.formData.blastersRemarks = item.remarks;
                            break;
                    }
                });

                console.log('Carpenters:', this.carpenters);
                console.log('Masons:', this.masons);
                // Log other types as needed
            },
            (error) => {
                console.error('Error fetching contractor details:', error);
            }
        );
    }

    addCarpenter() {
        this.carpenters.push({ level: '', number: '' });
    }
    removeCarpenter(index: number) {
        this.carpenters.splice(index, 1);
    }

    addMason() {
        this.masons.push({ level: '', number: '' });
    }
    removeMason(index: number) {
        this.masons.splice(index, 1);
    }

    addRodBender() {
        this.rodBenders.push({ level: '', number: '' });
    }
    removeRodBender(index: number) {
        this.rodBenders.splice(index, 1);
    }

    addPlumber() {
        this.plumbers.push({ level: '', number: '' });
    }
    removePlumber(index: number) {
        this.plumbers.splice(index, 1);
    }

    addElectrician() {
        this.electricians.push({ level: '', number: '' });
    }
    removeElectrician(index: number) {
        this.electricians.splice(index, 1);
    }

    addSteelFabricator() {
        this.steelFabricators.push({ level: '', number: '' });
    }
    removeSteelFabricator(index: number) {
        this.steelFabricators.splice(index, 1);
    }

    addPainter() {
        this.painters.push({ level: '', number: '' });
    }
    removePainter(index: number) {
        this.painters.splice(index, 1);
    }

    addBlast() {
        this.blasters.push({ level: '', number: '' });
    }
    removeBlaster(index: number) {
        this.blasters.splice(index, 1);
    }
    addBlaster() {
        this.blasters.push({ level: '', number: '' });
    }
    goBack() {}

    onFileSelected(event: any): void {
        const file: File = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                // 2MB in bytes
                this.fileError = 'File size should not exceed 2MB.';
                this.formData.uploadFile = null;
            } else {
                this.fileError = null;
                this.formData.uploadFile = file;
            }
        } else {
            this.fileError = 'Please upload a file.';
            this.formData.uploadFile = null;
        }
    }

    formType = '12';
saveAndNext(form: NgForm) {
    if (form.invalid) {
        Object.keys(form.controls).forEach((field) => {
            const control = form.controls[field];
            control.markAsTouched({ onlySelf: true });
        });
        return;
    }

    // Check if tableId exists and data is already present
    if (this.tableId && this.data && this.data.length > 0) {
        // If data exists, navigate without sending new payload
        this.assignCheckListId();
        this.savedCertifiedSkilledWorkerData.emit({
            tableId: this.tableId,
            data: this.data,
            inspectionType: this.inspectionType,
        });
        this.router.navigate(['monitoring/committed-equipment']);
        return;
    }

    // Only create and send payload if no existing data
    const payload = [
        ...this.carpenters.map((item) => ({
            id:item.id,
            skilledWorkerType: 'carpenter',
            numberOfWorkers: item.carpenterNumber,
            certificates: item.carpenterCertification,
            remarks: this.formData.carpentersRemarks || '',
        })),
        ...this.masons.map((item) => ({
            id:item.id,
            skilledWorkerType: 'mason',
            numberOfWorkers: item.masonNumber,
            certificates: item.masonCertification,
            remarks: this.formData.masonsRemarks || '',
        })),
        ...this.rodBenders.map((item) => ({
            id:item.id,
            skilledWorkerType: 'rodBender',
            numberOfWorkers: item.rodBenderNumber,
            certificates: item.rodBenderCertification,
            remarks: this.formData.rodBendersRemarks || '',
        })),
        ...this.steelFabricators.map((item) => ({
            id:item.id,
            skilledWorkerType: 'steelFabricator',
            numberOfWorkers: item.steelFabricatorNumber,
            certificates: item.steelFabricatorCertification,
            remarks: this.formData.steelFabricatorsRemarks || '',
        })),
        ...this.plumbers.map((item) => ({
            id:item.id,
            skilledWorkerType: 'plumber',
            numberOfWorkers: item.plumberNumber,
            certificates: item.plumberLevel,
            remarks: this.formData.plumbersRemarks || '',
        })),
        ...this.electricians.map((item) => ({
            id:item.id,
            skilledWorkerType: 'electrician',
            numberOfWorkers: item.electricianNumber,
            certificates: item.electricianLevel,
            remarks: this.formData.electriciansRemarks || '',
        })),
        ...this.painters.map((item) => ({
            id:item.id,
            skilledWorkerType: 'painter',
            numberOfWorkers: item.painterNumber,
            certificates: item.painterLevel,
            remarks: this.formData.paintersRemarks || '',
        })),
        ...this.blasters.map((item) => ({
            id:item.id,
            skilledWorkerType: 'blaster',
            numberOfWorkers: item.blasterNumber,
            certificates: item.blasterLevel,
            remarks: this.formData.blastersRemarks || '',
        })),
    ];

    console.log('payload..............', payload);
    this.service
        .saveCertifiedSkillWorkerData(payload, this.tableId, this.workId || '').subscribe(
            (response: any) => {
                if (this.tableId) {
                    this.assignCheckListId();
                    this.savedCertifiedSkilledWorkerData.emit({
                        tableId: this.tableId,
                        data: this.data,
                        inspectionType: this.inspectionType,
                    });
                    this.router.navigate(['monitoring/committed-equipment']);
                }
            },
            (error: any) => {
                console.error('Error saving draft:', error);
            }
        );
}
    assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service.saveCheckListId(this.tableId,this.workId, payload).subscribe(
            (response) => {
                this.createNotification();
                console.log('File ID assigned successfully:', response);
            },
            (error) => {
                console.error('Error assigning File ID:', error);
            }
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
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/list-ofhrin-contract']);
    }

}
