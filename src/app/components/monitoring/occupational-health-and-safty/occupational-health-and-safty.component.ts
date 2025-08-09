import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonService } from '../../../service/common.service';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
interface FormData {
    ohsInCharge?: string;
    cidNo?: number;
    uploadFile?: File | null;
    safetySignages?: string;
    safetyEquipments?: string;
    safetyMeasures?: string;
    comments?: string;
    fireExtinguisher?: string;
    firstAidBox?: string;
    peripheralBoundaryFencing?: string;
    dustMask?: string;
    firstAidBoxCount?: number;
    peripheralBoundaryFencingCount?: number;
    dustMaskCount?: number;
    electricalSafety?: string;
    safetyHelmet?: string;
    electricalSafetyCount?: number;
    reflectiveVest?: string;
    safetyBoots?: string;
    safetyGloves?: string;
    
    fireExtinguisherType?: string;
    firstAidBoxType?: string;
    peripheralBoundaryFencingType?: string;
    dustMaskType?: string;
    goggles?: string;
    weldingMask?: string;
    safetyHarness?: string;
    remarks?: string;
    earPlug?: string;
    fullName?: string;
    mobileNo?: number;
    filePathList?: string[];
    allPathsNoFile?: boolean;
    fileIdList?: string[];
}
@Component({
    selector: 'app-occupational-health-and-safty',
    templateUrl: './occupational-health-and-safty.component.html',
    styleUrls: ['./occupational-health-and-safty.component.scss'],
})
export class OccupationalHealthAndSaftyComponent {
    formData:FormData={};
    @Output() SavedOccupationalHealthAndSaftyData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any
    }>();
    fileError: string | null = null;
    fileId: any = [];
    errorMessages = {
        mobile: '',
        server: '',
        notFound: '',
    };
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    @Input() prevTableId: any;
      @Input() workId: any;
    @Output() previousClicked = new EventEmitter<{tableId: any }>();
    userName: any;
    fileAndRemark: any;
    formType = '11';
  appNoStatus: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
            const userDetails = JSON.parse(userDetailsString);
            this.userName = userDetails.username;
        }
        this.tableId = this.tableId;
        this.data = this.data;
        this.inspectionType = this.inspectionType;
        this.prevTableId = this.prevTableId
        this.appNoStatus = this.data.applicationStatus
        if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId
        }
        if (this.prevTableId || this.workId) {
            this.getDatabasedOnChecklistId();
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
       {
        field: 'workid',
        value: this.workId,
        operator: 'AND',
        condition: '=',
        },
  ];

  this.service.fetchDetails(payload, 1, 10, 'ohs_view').subscribe(
    (response: any) => {
      if (!response?.data || response.data.length === 0) {
        console.warn('No data found for the given checklist ID.');
        return;
      }

      const data = response.data[0];
      if (!data) {
        console.warn('Data is undefined or null.');
        return;
      }

      this.formData = {};

      // Assign values safely
      this.formData.ohsInCharge = data.certified_ohs_in_charge ?? '';
      this.formData.cidNo = data.ohs_cid_number ?? '';
      this.formData.fullName = data.ohs_in_charge_full_name ?? '';
      this.formData.mobileNo = data.ohs_in_charge_mobile ?? '';
      this.formData.safetySignages = data.safety_signages_available ?? '';
      this.formData.fireExtinguisher = data.fire_extinguisher_available ?? '';
      this.formData.firstAidBox = data.first_aid_box_available ?? '';
      this.formData.peripheralBoundaryFencing = data.peripheral_fencing_available ?? '';
      this.formData.electricalSafety = data.electrical_safety_complied ?? '';
      this.formData.safetyHelmet = data.safety_helmet_used ?? '';
      this.formData.safetyBoots = data.safety_boots_used ?? '';
      this.formData.reflectiveVest = data.reflective_vest_used ?? '';
      this.formData.goggles = data.goggles_used ?? '';
      this.formData.weldingMask = data.welding_mask_used ?? '';
      this.formData.dustMask = data.dust_mask_used ?? '';
      this.formData.safetyHarness = data.safety_harness_used ?? '';
      this.formData.earPlug = data.ear_plugs_used ?? '';
      this.formData.safetyGloves = data.safety_gloves_used ?? '';
      this.formData.remarks = data.remarks ?? '';
      // Handle file paths safely
      if (data.file_path && data.file_id) {
        this.formData.filePathList = data.file_path
          .split(',')
          .map(path => path.trim());

        this.formData.fileIdList = data.file_id
          .split(',')
          .map(id => id.trim());

        this.formData.allPathsNoFile = this.formData.filePathList.every(
          path => path === 'NO_PATH'
        );

        console.log('filePathList:', this.formData.filePathList);
        console.log('fileIdList:', this.formData.fileIdList);
        console.log('allPathsNoFile:', this.formData.allPathsNoFile);
      } else {
        this.formData.filePathList = [];
        this.formData.fileIdList = [];
        this.formData.allPathsNoFile = true;
      }
    },
    (error) => {
      console.error('Error fetching contractor details:', error);
    }
  );
}


    /**
     * Handles file selection event.
     * @param event The file selection event.
     */
    /**
     * Uploads the selected file to the server and sets the file ID upon success.
     */
 

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
isFullNameDisabled:boolean=false
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
                this.isFullNameDisabled = true; // disable the field
            } else {
                this.errorMessages.notFound = 'Not Registered in DCRC';
                this.isFullNameDisabled = false; // allow manual entry
            }
            this.isLoading = false;
        },
        (error) => {
            if (error.status === 500) {
                this.isLoading = false;
                this.errorMessages.server = 'Something went wrong';
                console.error('Something went wrong:', error);
                this.isFullNameDisabled = false;
            }
        }
    );
}

cleardata() {
    this.formData.fullName = '',
    this.formData.cidNo=0;
    this.isFullNameDisabled = false;
}
    addFileInput() {
        this.fileInputs.push(this.fileInputs.length);
        this.fileErrors.push('');
    }
    /**
     * Handles the file selection event and validates the selected file.
     * If a file is selected, it checks if the file size exceeds 2MB. If the file size
     * is valid, it sets the file for upload; otherwise, it sets an error message.
     * If no file is selected, it sets an error message indicating that a file must be uploaded.
     *
     * @param event - The file input change event containing the selected file.
     * @param index - The index of the file input field.
     */
    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];
   onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];

        // Check file size (2MB = 2 * 1024 * 1024 bytes)
        if (file.size > 2 * 1024 * 1024) {
        this.fileErrors[index] = 'File size must be less than or equal to 2MB.';
        this.selectedFiles[index] = null;
        input.value = ''; // Clear the input
        return;
        }

        this.selectedFiles[index] = file;
        this.fileErrors[index] = ''; // Clear error on valid file
        console.log('selectedFiles', this.selectedFiles);
    } else {
        this.fileErrors[index] = 'Please select a valid file.';
    }
    }
    removeFileInput(index: number) {
        this.fileInputs.splice(index, 1);
        this.fileErrors.splice(index, 1);
        this.selectedFiles.splice(index, 1);
    }
 
     saveAndNext(form: NgForm) {
      if (form.invalid) {
          Object.keys(form.controls).forEach((field) => {
              const control = form.controls[field];
              control.markAsTouched({ onlySelf: true });
          });
          return; // Stop execution if form is invalid
      }
      // Always call uploadFiles, even if no files are selected
      const uploadObservables = [];
      if (this.selectedFiles && this.selectedFiles.length > 0) {
          for (const file of this.selectedFiles) {
              const upload$ = this.service.uploadFiles(file, this.formData.remarks, this.formType, this.userName, this.workId);
              uploadObservables.push(upload$);
          }
      }  else {
        // Send dummy file instead of null
        const dummyFile = new File([new Blob()], 'empty.txt', { type: 'text/plain' });
        const upload$ = this.service.uploadFiles(dummyFile, this.formData.remarks, this.formType, this.userName, this.workId);
        uploadObservables.push(upload$);
       }
    forkJoin(uploadObservables).subscribe({
        next: (fileIds: any[]) => {
            for (const id of fileIds) {
                const match = id?.match?.(/[0-9a-fA-F\-]{36}/);
                if (match) {
                    this.fileId.push(match[0]);
                }
            }
            this.saveDraftPayload();
        },
        error: (err) => {
            console.error('Error uploading files:', err);
            this.fileError = 'File upload failed.';
        },
    });
}
    private saveDraftPayload() {
      const payload = {
            id: this.tableId,
            workID: this.workId,
            certifiedOhsInCharge: this.formData?.ohsInCharge,
            ohsCidNumber: this.formData.cidNo,
            ohsInChargeFullName: this.formData.fullName,
            ohsInChargeMobile: this.formData.mobileNo,
            safetySignagesAvailable: this.formData.safetySignages,
            fireExtinguisherAvailable:
            this.formData.fireExtinguisher,
            firstAidBoxAvailable: this.formData.firstAidBox,
            peripheralFencingAvailable:this.formData.peripheralBoundaryFencing,
            electricalSafetyComplied:this.formData.electricalSafety,                
            safetyHelmetUsed: this.formData.safetyHelmet,           
            safetyBootsUsed: this.formData.safetyBoots,
            reflectiveVestUsed: this.formData.reflectiveVest,
            gogglesUsed: this.formData.goggles,
            weldingMaskUsed: this.formData.weldingMask,
            dustMaskUsed: this.formData.dustMask,
            safetyHarnessUsed: this.formData.safetyHarness,
            safetyGlovesUsed: this.formData.safetyGloves,
            earPlugsUsed: this.formData.earPlug,                                        
     };
      this.service.saveAsDraft(payload).subscribe({
        next: (response: any) => {
          const parsedResponse = typeof response === 'string' ? JSON.parse(response) : response;
          this.tableId = parsedResponse.checklistsInfo.id;
          if (this.tableId) {
            this.assignCheckListId();
            this.SavedOccupationalHealthAndSaftyData.emit({
            tableId: this.tableId,
            data: this.data,
            inspectionType: this.inspectionType
            });
            this.router.navigate(['/monitoring/list-ofhrin-contract']);
          }
        },
        error: (error) => {
          console.error('Error saving draft:', error);
        }
      });
    }
    /**
     * Assigns the uploaded file to the given checklist ID.
     * The method sends a request to save the checklist ID and
     * logs the result upon success or error.
     */
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

    /**
     * Creates a success notification to inform the user that data has been saved successfully.
     * A click event is also subscribed to log a message when the notification is clicked.
     */
    createNotification(): void {
        this.notification
            .success('Success', 'The data has been saved successfully')
            .onClick.subscribe(() => {
                console.log('notification clicked!');
            });
    }

    onPreviousClick() {
        this.previousClicked.emit(this.tableId); // Emit event to go back to previous form
        this.router.navigate(['monitoring/reinforcement']);
    }
        /**
         * Downloads a file from the server based on the provided filePath.
         * @param filePath The file path on the server to download the file from.
         */
    
        viewFile(attachment: string): void {
        this.service.downloadFile(attachment).subscribe(
        (response: HttpResponse<Blob>) => {
          const binaryData = [response.body];
          // Create a Blob from the response
          const blob = new Blob(binaryData, { type: response.body.type });
          // Generate a URL for the Blob
          const blobUrl = window.URL.createObjectURL(blob);
          // Open a new window
          const newWindow = window.open('', '_blank', 'width=800,height=600');
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
}
