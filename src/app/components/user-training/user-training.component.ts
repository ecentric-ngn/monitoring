import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserTrainingService } from '../../service/user-training.service';
import { NavigationExtras, Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-user-training',
    templateUrl: './user-training.component.html',
    styleUrls: ['./user-training.component.scss'],
})
export class UserTrainingComponent {
    loading: boolean = true;
    searchQuery: any;
    pageSize: number = 10;
    pageNo: number = 1;
    total_records: number = 0;
    totalPages: number = 0;
    set_limit: number[] = [10, 15, 25, 100];
    selectedLimit: number = this.set_limit[0];
    formData: any[] = [];
    Tabledata: any[] = [];
    Privileges: any;
    uuid: any;
    UserData: any;
    @ViewChild('closeButton') closeButton: ElementRef;
    errorMessage: boolean = false;
    id: any;
    trainingId: any;
    pageSizes: number = 1000;
    constructor(
        private service: UserTrainingService,
        private router: Router,
        private messageService: MessageService
    ) {}
    ngOnInit() {
        this.GetUserTraingData();
        const storedPrivileges = sessionStorage.getItem('setPrivileges');
        if (storedPrivileges) {
            this.Privileges = JSON.parse(storedPrivileges);
        }
        const sessionLocalData = JSON.parse(
            sessionStorage.getItem('userDetails')
        );
        if (sessionLocalData) {
            this.uuid = sessionLocalData.userId;
        }
        setTimeout(() => {
            this.loading = false;
        }, 1000);
    }
    //hide and show the button base on receivedPrivileges
    shouldShowActionButton(): boolean {
        const hasRead =
            this.Privileges &&
            this.Privileges.some(
                (privilege) => privilege.privilege_name === 'Read'
            );
        const haswrite =
            this.Privileges &&
            this.Privileges.some(
                (privilege) => privilege.privilege_name === 'Training'
            );
        // Hide the button if only "Read" privilege is present
        if (hasRead && !haswrite) {
            return false;
        }
        // Show the button if "Reregister" privilege is present
        if (haswrite) {
            return true;
        }
        // Otherwise, show the button
        return false;
    }
    // search filter
    Searchfilter() {
        if (this.searchQuery && this.searchQuery.trim() !== '') {
            this.GetUserTraingData(this.searchQuery); // Pass search query to backend
        } else {
            this.GetUserTraingData(); // Fetch all data
        }
    }
    GetUserTraingData(searchQuery?: string) {
        this.errorMessage = false;
        const trainingDetails = {
            viewName: 'trainingData',
            pageSize: this.pageSize,
            pageNo: this.pageNo,
            condition: searchQuery
                ? [
                      {
                          field: 'trainingType',
                          value: `%${searchQuery}%`,
                          condition: 'like',
                          operator: ' AND ',
                      },
                      {
                          field: 'module',
                          value: `%${searchQuery}%`,
                          condition: ' like ',
                          operator: ' OR ',
                      },
                  ]
                : [],
        };
        this.service.GetTrainingData(trainingDetails).subscribe(
            (response: any) => {
                this.formData = response.data;
                this.total_records = response.totalCount;
                this.totalPages = Math.ceil(this.total_records / this.pageSize);
            },
            (error) => {
                this.errorMessage = true;
            }
        );
    }

    openModalWithWorkId(id: string): void {
        this.trainingId = id;
        const trainingDetails = {
            viewName: 'trainingParticipantData',
            pageSize: this.pageSizes,
            pageNo: this.pageNo,
            condition: [
                {
                    field: 'trainingId',
                    value: id,
                },
            ],
        };
        this.service.GetParticipantData(trainingDetails).subscribe(
            (response: any) => {
                this.UserData = response.data;
            },
            (error) => {
                console.error('Error fetching training data:', error); // Log any errors
            }
        );
    }
    updateParticipant(data: any) {
        const saveData = [
            {
                bctaNo: data.bctaNo,
                fullName: data.fullName,
                cidNo: data.cidNo,
                designation: data.designation,
                gender: data.gender,
                qualification: data.qualification, // Fixed duplicate key
                mobileNo: data.mobileNo,
                id: data.id,
                trainingId: data.trainingId,
            },
        ];
        this.service.updateParticipantData(saveData).subscribe(
            (response: any) => {
                this.openModalWithWorkId(data);
                this.showUpdateMessage();
            },
            (error) => {
                console.error('Error updating participant data:', error);
            }
        );
    }
    //method to delete the participant
    deleteParticipant(id: any) {
        this.service.deleteParticipantData(id).subscribe((response: any) => {
            this.closeButton.nativeElement.click();
            this.showDeleteMessage();
            this.GetUserTraingData();
        });
    }
    showDeleteMessage() {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Training Details  deleted successfully',
        });
    }

    showUpdateMessage() {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Training Form  updated successfully',
        });
    }
    navigateToEditForm(data: any) {
        const navigationExtras: NavigationExtras = {
            state: {
                trainingId: data.id,
            },
        };
        this.router.navigate(['/edit-user-training'], navigationExtras);
    }
    // Method to set limit value
    setLimitValue(value: any) {
        this.pageSize = parseInt(value);
        this.pageNo = 1;
        //this.loading=true
        this.GetUserTraingData();
        // console.log('loading')
    }
    previousPage() {
        if (this.pageNo > 1) {
            this.pageNo--;
            this.GetUserTraingData();
        }
    }
    nextPage() {
        if (this.pageNo < this.totalPages) {
            this.pageNo++;
            this.GetUserTraingData();
        }
    }
    goToPage(pageSize: number) {
        if (pageSize >= 1 && pageSize <= this.totalPages) {
            this.pageNo = pageSize;
            this.GetUserTraingData();
        }
    }
    // Method to calculate starting and ending entry numbers
    calculateOffset(): string {
        const currentPage = (this.pageNo - 1) * this.pageSize + 1;
        const limit_value = Math.min(
            this.pageNo * this.pageSize,
            this.total_records
        );
        return `Showing ${currentPage} to ${limit_value} of ${this.total_records} entries`;
    }
    generatePageArray(): number[] {
        const pageArray: number[] = [];
        // If total_pages is less than or equal to 4, display all pages
        if (this.totalPages <= 4) {
            for (let i = 1; i <= this.totalPages; i++) {
                pageArray.push(i);
            }
        } else {
            // Display the first two and last two pages
            if (this.pageNo <= 2) {
                for (let i = 1; i <= 2; i++) {
                    pageArray.push(i);
                }
                pageArray.push(-1); // Placeholder for ellipsis
                for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
                    pageArray.push(i);
                }
            } else if (this.pageNo >= this.totalPages - 1) {
                for (let i = 1; i <= 2; i++) {
                    pageArray.push(i);
                }
                pageArray.push(-1); // Placeholder for ellipsis
                for (let i = this.totalPages - 1; i <= this.totalPages; i++) {
                    pageArray.push(i);
                }
            } else {
                // Display the current page, previous and next page, and the first and last pages
                if (this.pageNo === 3) {
                    for (let i = 1; i <= this.pageNo + 1; i++) {
                        pageArray.push(i);
                    }
                    pageArray.push(-1); // Placeholder for ellipsis
                    for (
                        let i = this.totalPages - 1;
                        i <= this.totalPages;
                        i++
                    ) {
                        pageArray.push(i);
                    }
                } else {
                    for (let i = 1; i <= 2; i++) {
                        pageArray.push(i);
                    }
                    pageArray.push(-1); // Placeholder for ellipsis
                    for (let i = this.pageNo - 1; i <= this.pageNo + 1; i++) {
                        pageArray.push(i);
                    }
                    pageArray.push(-1); // Placeholder for ellipsis
                    for (
                        let i = this.totalPages - 1;
                        i <= this.totalPages;
                        i++
                    ) {
                        pageArray.push(i);
                    }
                }
            }
        }
        return pageArray;
    }
}
