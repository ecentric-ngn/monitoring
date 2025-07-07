import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
    selector: 'app-review-and-submit',
    templateUrl: './review-and-submit.component.html',
    styleUrls: ['./review-and-submit.component.scss'],
})
export class ReviewAndSubmitComponent {
    formData: any = {};
    data: any;
    tableData: any;
    humanResources: any[] = [];
    committedEquipment: any[] = [];
    monitoringTeam: any[] = [];
    siteEngineers: any[] = [];
    @Input() tableId: any;
    applicationNumber: any;
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    reinforcementList: any;
    OnsiteQuantityList: any;
    monitoringTeamList: any;
    SiteMonitoringTeamList: any;
    committedEquipmentList: any;
    groupedData: { skilled_worker_type: string; workers: any }[];
    pageNo: number = 1;
    pageSize: number = 100;
    fileAndRemark: any;
     set_limit: number[] = [10, 15, 25, 100];
    constructor(private service: CommonService, private router: Router) {}

    ngOnInit() {
        this.tableId = this.tableId;
        this.getAllData();
        this.gethumanResourceList();
        this.getReinforcementList();
        this.getOnsiteQuantityList();
        this.getMonitoringTeamList();
        this.getSiteMonitoringTeamList();
        this.getCommitedEquipmentList();
        this.getSkilledWorkerList();
    }
    showReplacementMap: { [key: number]: boolean } = {};
    showReplacMap: { [key: number]: boolean } = {};
    toggleReplacement(index: number): void {
        this.showReplacementMap[index] = !this.showReplacementMap[index];
    }

    toggleReplace(index: number): void {
        this.showReplacMap[index] = !this.showReplacMap[index];
    }

    gethumanResourceList() {
        const payload: any = [
            {
                field: 'checklist_id',
                     value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(
                payload,
                this.pageNo,
                this.pageSize,
                'human_resources_view'
            )
            .subscribe(
                (response: any) => {
                    this.humanResources = response.data;
                    console.log('this.formData', this.humanResources);
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
                     value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(
                payload,
                this.pageNo,
                this.pageSize,
                'reinforcement_view'
            )
            .subscribe(
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
                     value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(
                payload,
                this.pageNo,
                this.pageSize,
                'oq_confirmation_view'
            )
            .subscribe(
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
                value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(
                payload,
                this.pageNo,
                this.pageSize,
                'v_monitoring_team_members'
            )
            .subscribe(
                (response: any) => {
                    this.monitoringTeamList = response.data;
                    console.log('this.formData', this.monitoringTeamList);
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
                   value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(
                payload,
                this.pageNo,
                this.pageSize,
                'committed_equipment_view'
            )
            .subscribe(
                (response: any) => {
                    this.committedEquipmentList = response.data;
                    this.equipmentFiles = this.splitFilePaths(
                        this.committedEquipmentList[0].eqfile_path
                    );
                  
                },
                (error) => {
                    console.error('Error fetching contractor details:', error);
                }
            );
    }
    contractDocFiles: string[] = [];
    onsiteFiles: string[] = [];
    workProgressFiles: string[] = [];
    qualificationFiles: string[] = [];
    workTaskFiles: string[] = [];
    ohsFiles: string[] = [];
    equipmentFiles: string[] = [];

    getAllData() {
        const payload: any = [
            {
                field: 'checklist_id',
                  value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
        ];

        this.service
            .fetchDetails(
                payload,
                this.pageNo,
                this.pageSize,
                'comprehensive_checklist_view'
            )
            .subscribe(
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

    getSiteMonitoringTeamList() {
        const payload: any = [
            {
                field: 'checklist_id',
                  value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(
                payload,
                this.pageNo,
                this.pageSize,
                'client_site_engineers_view'
            )
            .subscribe(
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
                     value: this.tableId,
                operator: 'AND',
                condition: '=',
            },
        ];
        this.service
            .fetchDetails(payload, this.pageNo, this.pageSize, 'csw_view')
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


        viewFile(attachment: string): void {
        this.service.downloadFile(attachment).subscribe(
            (response: HttpResponse<Blob>) => {
            const binaryData = [response.body];
            const blob = new Blob(binaryData, { type: response.body?.type });
            const blobUrl = window.URL.createObjectURL(blob);
            const fileName = this.extractFileName(attachment);

            // Open file in new window for preview
            const newWindow = window.open('', '_blank', 'width=800,height=600');
            if (newWindow) {
                newWindow.document.write(`
                <html>
                    <head><title>File Viewer</title></head>
                    <body style="margin:0;padding:0;display:flex;flex-direction:column;height:100%;">
                    <div style="padding:10px;text-align:right;">
                        <button onclick="downloadFile()" style="padding:8px 16px;background:#007bff;color:white;text-decoration:none;border:none;border-radius:4px;font-family:sans-serif;">Download</button>
                    </div>
                    <iframe src="${blobUrl}" style="flex-grow:1;width:100%;border:none;"></iframe>
                    <script>
                        function downloadFile() {
                        const link = document.createElement('a');
                        link.href = "${blobUrl}";
                        link.download = "${fileName}";
                        link.click();
                        }
                    </script>
                    </body>
                </html>
                `);
            } else {
                console.error('Failed to open the new window');
            }
            },
            (error: HttpErrorResponse) => {
            if (error.status === 404) {
                console.error('File not found', error);
            }
            }
        );
        }

        extractFileName(filePath: string): string {
            return (
                filePath.split('/').pop() ||
                filePath.split('\\').pop() ||
                'downloaded-file'
            );
        }
    /**
     * Submit all the data to the server and generate a new application number.
     * After successful submission, show a success message with the new application number.
     * If submission fails, show an error message.
     */
    // submitAllData() {
    //     this.service.generateApplicationNo(this.tableId).subscribe(
    //         (response: any) => {
    //             const parsedResponse =
    //                 typeof response === 'string'
    //                     ? JSON.parse(response)
    //                     : response;
    //             this.applicationNumber =
    //                 parsedResponse.checklistsInfo.applicationNumber;
    //             // Show a success message with the new application number
    //             Swal.fire({
    //                 icon: 'success',
    //                 title: 'Submission Successful',
    //                 text: `You have successfully submitted. The new application number is: ${this.applicationNumber}`,
    //             });
    //         },
    //         (error: any) => {
    //             // Show an error message if submission fails
    //             Swal.fire({
    //                 icon: 'error',
    //                 title: 'Submission Failed',
    //                 text: 'Something went wrong. Please try again.',
    //             });
    //         }
    //     );
    // }
    submitAllData() {
        this.service.generateApplicationNo(this.tableId).subscribe(
            (response: any) => {
                const parsedResponse =
                    typeof response === 'string'
                        ? JSON.parse(response)
                        : response;
                this.applicationNumber =
                    parsedResponse.checklistsInfo.applicationNumber;

                Swal.fire({
                    icon: 'success',
                    title: 'Submission Successful',
                    text: `You have successfully submitted. The new application number is: ${this.applicationNumber}`,
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Navigate to review-report-list component
                        this.router.navigate(['viewApplication']);
                    }
                });
            },
            (error: any) => {
                Swal.fire({
                    icon: 'error',
                    title: 'Submission Failed',
                    text: 'Something went wrong. Please try again.',
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Navigate to review-report-list component
                        // this.router.navigate(['viewApplication']);
                    }
                });
            } // <-- Close error callback
        ); // <-- Close subscribe call
    }


    onPreviousClick() {
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/monitoring-team']);
    }
}
