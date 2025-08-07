import { Component } from '@angular/core';
import { CommonService } from '../../../../../service/common.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
    selector: 'app-application-details',
    templateUrl: './application-details.component.html',
    styleUrls: ['./application-details.component.scss'],
})
export class ApplicationDetailsComponent {
    formData: any = {};
    data: any;
    checklistId: any;
    userId: any;
    groupedData: { skilled_worker_type: string; workers: any }[];
    reinforcementList: any;
    OnsiteQuantityList: any;
    monitoringTeamList: any;
    committedEquipmentList: any;
    SiteMonitoringTeamList: any;
    pageNo: number = 1;
    pageSize: number = 100;
    appNoStatus: any;
    dzongkhagName: any;
    awardedBctaNo: any;
    inspectionType: any;
    constructor(
        private service: CommonService,
        private notification: NzNotificationService,
        private router: Router,
    ) {}
    humanResources: any[] = [];
    committedEquipment: any[] = [];
    monitoringTeam: any[] = [];
    siteEngineers: any[] = [];
    fileAndRemark: any;
    contractDocFiles: string[] = [];
    onsiteFiles: string[] = [];
    workProgressFiles: string[] = [];
    qualificationFiles: string[] = [];
    workTaskFiles: string[] = [];
    ohsFiles: string[] = [];
    equipmentFiles: string[] = [];
    application_number: any[] = [];
    selectedAppNoChecklisId: string | null = null;
    showFormData: boolean = false;
    selectedChecklistIds: string[] = [];

    ngOnInit() {
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userId = userDetails.userId;
        }
        const data = this.service.getData('applicationNumber');
        this.data = data;
        this.inspectionType = this.data.inspection_type;
        
        this.appNoStatus = data.applicationStatus;
        this.checklistId = data.checklist_id;
        if(this.checklistId){
            this.getAllData();
            this.gethumanResourceList();
            this.getReinforcementList();
            this.getOnsiteQuantityList();
            this.getMonitoringTeamList();
            this.getSiteMonitoringTeamList();
            this.getCommitedEquipmentList();
            this.getSkilledWorkerList();
            this.getclientList();
        }
    }
    gethumanResourceList() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload, 1, 100, 'human_resources_view').subscribe(
                (response: any) => {
                    this.humanResources = response.data;
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }
  getclientList() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload, 1, 100, 'work_with_contractor_view').subscribe(
                (response: any) => {
                    this.formData = response.data[0];
                    
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }
    getReinforcementList() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload,this.pageNo,this.pageSize,'reinforcement_view').subscribe(
                (response: any) => {
                    this.reinforcementList = response.data;
                    console.log('this.formData', this.humanResources);
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }
    getOnsiteQuantityList() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload, this.pageNo, this.pageSize,'oq_confirmation_view' ).subscribe(
                (response: any) => {
                    this.OnsiteQuantityList = response.data;
                    console.log('this.formData', this.humanResources);
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }

    getMonitoringTeamList() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload,this.pageNo,this.pageSize,'v_monitoring_team_members').subscribe(
                (response: any) => {
                    this.monitoringTeamList = response.data;
                    console.log('this.formData', this.humanResources);
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }

    getCommitedEquipmentList() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload,this.pageNo,this.pageSize,'committed_equipment_view').subscribe(
                (response: any) => {
                    this.committedEquipmentList = response.data;
                    console.log('this.formData', this.humanResources);
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }

    getAllData() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];

        this.service.fetchDetails(payload,this.pageNo,this.pageSize,'comprehensive_checklist_view').subscribe(
                (response: any) => {
                    this.formData = response.data[0];
                    // Split the file path strings into arrays
                    this.contractDocFiles = this.splitFilePaths(
                        this.formData.contractDocfile_path
                    );
                    this.onsiteFiles = this.splitFilePaths(
                        this.formData.onsitefile_path
                    );
                    this.workProgressFiles = this.splitFilePaths(
                        this.formData.workProgressfile_path
                    );
                    this.qualificationFiles = this.splitFilePaths(
                        this.formData.qualificationfile_path
                    );
                    this.workTaskFiles = this.splitFilePaths(
                        this.formData.worktaskfile_path
                    );
                    this.ohsFiles = this.splitFilePaths(
                        this.formData.ohsfile_path
                    );

                    console.log(
                        'this.formData with split paths:',
                        this.formData
                    );
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }

    // Helper to split comma-separated file paths, and handle null/empty

  splitFilePaths(paths: string | null): string[] {
    if (!paths) return [];
    
    // Split by comma, trim whitespace, and filter
    const result = paths
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0 && p !== 'NO_PATH');
    
    return result.length > 0 ? result : [];
}
    // Extract file name from full path
    getFileName(filePath: string): string {
        if (!filePath) return '';
        const parts = filePath.split(/[/\\]/);
        return parts[parts.length - 1];
    }
       goBack() {
        const WorkDetail = {
            data: this.data,
        };
        this.service.setData(WorkDetail, 'appData', 'SubmittedReport');
    }
    getSiteMonitoringTeamList() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload,this.pageNo,this.pageSize,'client_site_engineers_view').subscribe(
                (response: any) => {
                    this.SiteMonitoringTeamList = response.data;
                    console.log('this.formData', this.humanResources);
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }

    getSkilledWorkerList() {
        const payload: any = [
            {
                field: 'checklist_id',
                value:this.checklistId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service.fetchDetails(payload, this.pageNo, this.pageSize, 'csw_view')
            .subscribe(
                (response: any) => {
                    const rawData = response.data;
                    const grouped = rawData.reduce((acc, item) => {
                        if (!acc[item.skilled_worker_type]) {
                            acc[item.skilled_worker_type] = [];
                        }
                        acc[item.skilled_worker_type].push(item);
                        return acc;
                    }, {} as { [key: string]: any[] });
                    this.groupedData = Object.keys(grouped).map((key) => ({
                        skilled_worker_type: key,
                        workers: grouped[key],
                    }));
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }
 
    createNotification(): void {
        this.notification
            .success('Success', 'The data has been reviewed successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }
    viewFile(attachment: string): void {
        this.service.downloadFile(attachment).subscribe(
            (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                // Create a Blob from the response
                const blob = new Blob(binaryData, { type: response.body.type });
                // Generate a URL for the Blob
                const blobUrl = window.URL.createObjectURL(blob);
                // Open a new window
                const newWindow = window.open(
                    '',
                    '_blank',
                    'width=800,height=600'
                );
                if (newWindow) {
                    // Write HTML content to the new window
                    newWindow.document.write(`
                  <html>
                    <head>
                    </head>
                    <body>
                      <h1>File</h1>
                      <iframe src="${blobUrl}" width="100%" height="100%" style="border: none;"></iframe>
                    </body>
                  </html>
                `);

                    // Optionally revoke the object URL after a timeout to free up resources
                    setTimeout(() => {
                        window.URL.revokeObjectURL(blobUrl);
                    }, 100);
                } else {
                    console.error('Failed to open the new window');
                }
            },
            (error: HttpErrorResponse) => {
                // Check for specific error status
                if (error.status === 404) {
                      this.createNotificationS('error');
                    console.error('File not found', error);
                }
            }
        );
    }

       createNotificationS(type: string): void {
    if (type.toLowerCase() === 'error') {
        const message = 'The document is not found';
        this.notification.error('Error', message).onClick.subscribe(() => {
            console.log('notification clicked!');
        });
    }
}
    extractFileName(filePath: string): string {
        return (
            filePath.split('/').pop() ||
            filePath.split('\\').pop() ||
            'downloaded-file'
        );
    }
  
}
