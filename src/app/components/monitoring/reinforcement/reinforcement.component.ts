import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { CommonService } from '../../../service/common.service';
import { Router } from '@angular/router';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
@Component({
    selector: 'app-reinforcement',
    templateUrl: './reinforcement.component.html',
    styleUrls: ['./reinforcement.component.scss'],
})
export class ReinforcementComponent {
    formData: any = {};
    fileError: string | null = null;
    fileId: any = [];
    @Input() tableId: any;
    @Input() data: any;
    @Input() inspectionType: any;
    @Input() workId: any;
    @Output() SavedReinforcementData = new EventEmitter<{
        tableId: any;
        data: any;
        inspectionType: any;
    }>();
    @Output() previousClicked = new EventEmitter<{ tableId: any }>();
    userName: any;
    fileAndRemark: any;
    @Input() prevTableId: any;
    fileInputs: number[] = [0]; // Tracks each file input field
    fileErrors: string[] = [];
    selectedFiles: File[] = [];
    appNoStatus: any;
    constructor(
        private service: CommonService,
        private router: Router,
        private notification: NzNotificationService
    ) {}

    ngOnInit() {
        this.tableId = this.tableId;
        
        this.data = this.data;
        this.inspectionType = this.inspectionType;
         this.workId = this.data?.id || null;
        this.appNoStatus = this.data?.applicationStatus ?? null;
        if (this.appNoStatus === 'REJECTED') {
            this.prevTableId = this.tableId;
        } else {
            this.prevTableId = this.prevTableId;
        }
        if (this.prevTableId || this.workId) {
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
       {
        field: 'workid',
        value: this.workId,
        operator: 'AND',
        condition: '=',
        },
  ];

 this.service.fetchDetails(payload, 1, 10, 'reinforcement_view').subscribe(
  (response: any) => {
    const data = response.data;

    this.formEntries = data.map((item: any) => {
      // Process file paths
      let filePaths = item.file_path
        ? item.file_path
            .split(',')
            .map((path: string) => path.trim())
            .filter((path: string) => path !== 'NO_PATH')
        : [];

      return {
        id: item.id,
        rebarNumber: item.rebar_quantity_design,
        rebarSpacing: item.longitudinal_rebar_spacing_design,
        stirrupSpacing: item.stirrup_spacing_design,
        concreteCover: item.concrete_cover_design,
        remarks: item.remarks,
        filePaths: filePaths,

        // File fields
        fileInputs: [0],
        fileErrors: [''],
        files: [undefined],
      };
    });

    // ✅ Fallback if formEntries is empty
    if (!this.formEntries || this.formEntries.length === 0) {
      this.addMore();
    }

    console.log('Loaded form entries:', this.formEntries);
  },
  (error) => {
    console.error('Error fetching contractor details:', error);
  }
);

}

    /**
     * Uploads the selected file to the server.
     * Subscribes to the Observable returned by the service and
     * sets the file ID to the response.
     */
    uploadFile(): void {
        this.service.uploadFile(this.formData.uploadFile).subscribe(
            (response: string) => {
                // Set the file ID to the response from the server
                this.fileId = response;
            },
            (error: any) => {
                // Handle any errors that occur during the upload
                console.error('Error uploading!', error);
            }
        );
    }
    formEntries = [
        {
            id: '',
            rebarNumber: '',
            rebarSpacing: '',
            stirrupSpacing: '',
            concreteCover: '',
            remarks: '',
            fileInputs: [0], // start with one file input
            fileErrors: [''],
            files: [],
            filePaths: [],
        },
    ];
    removeForm(index: number) {
        this.formEntries.splice(index, 1);
        this.fileErrors.splice(index, 1);
    }
    addFileInput(entryIndex: number) {
        this.formEntries[entryIndex].fileInputs.push(
            this.formEntries[entryIndex].fileInputs.length
        );
        this.formEntries[entryIndex].fileErrors.push('');
        this.formEntries[entryIndex].files.push(undefined as any);

        console.log(
            `Added file input for form entry ${entryIndex}. Total file inputs:`,
            this.formEntries[entryIndex].fileInputs.length
        );
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

    selectedFilesMap: Map<number, File[]> = new Map(); // index -> files array

    onFileSelected(event: any, entryIndex: number, fileIndex: number) {
        const selectedFile = event.target.files[0];
        const entry = this.formEntries[entryIndex];

        if (!selectedFile) {
            entry.fileErrors[fileIndex] = 'No file selected';
            entry.files[fileIndex] = undefined as any;
            console.warn(
                `No file selected for entry ${entryIndex}, file input ${fileIndex}`
            );
            return;
        }

        // Allowed file types
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
        if (!allowedTypes.includes(selectedFile.type)) {
            entry.fileErrors[fileIndex] =
                'Invalid file type. Allowed: PDF, JPEG, PNG';
            entry.files[fileIndex] = undefined as any;
            console.error(
                `Invalid file type "${selectedFile.type}" at entry ${entryIndex}, file ${fileIndex}`
            );
            return;
        }

        // Max size 3MB
        const maxSize = 2 * 1024 * 1024;
        if (selectedFile.size > maxSize) {
            entry.fileErrors[fileIndex] = 'File size exceeds 2 MB limit';
            entry.files[fileIndex] = undefined as any;
            console.error(
                `File size ${selectedFile.size} bytes exceeds limit at entry ${entryIndex}, file ${fileIndex}`
            );
            return;
        }

        // Success
        entry.files[fileIndex] = selectedFile;
        entry.fileErrors[fileIndex] = '';
        console.log(
            `File selected for entry ${entryIndex}, file input ${fileIndex}:`,
            selectedFile.name,
            `(${selectedFile.size} bytes)`
        );
    }

    removeFileInput(entryIndex: number, fileIndex: number) {
        const entry = this.formEntries[entryIndex];
        entry.fileInputs.splice(fileIndex, 1);
        entry.fileErrors.splice(fileIndex, 1);
        entry.files.splice(fileIndex, 1);
    }

    // removeForm(index: number) {
    //   this.formEntries.splice(index, 1);
    // }

    addMore(): void {
        this.formEntries.push({
            id: '',
            rebarNumber: '',
            rebarSpacing: '',
            stirrupSpacing: '',
            concreteCover: '',
            remarks: '',
            fileInputs: [0],
            fileErrors: [''],
            files: [],
            filePaths: [],
        });
        this.fileErrors.push('');
    }
    formType = '10';
    saveAndNext(form: NgForm) {
        if (form.invalid) {
            Object.keys(form.controls).forEach((field) => {
                const control = form.controls[field];
                control.markAsTouched({ onlySelf: true });
            });
            return;
        }

        const uploadObservables = [];

        this.formEntries.forEach((entry, index) => {
            const selectedFiles = entry.files?.filter((file) => !!file); // remove undefined/null

            if (selectedFiles.length > 0) {
                for (const file of selectedFiles) {
                    const upload$ = this.service.uploadFiles(
                        file,
                        entry.remarks,
                        this.formType,
                        this.userName,
                        this.workId
                    );
                    uploadObservables.push(upload$);
                }
            } else {
                const upload$ = this.service.uploadFiles(
                    null,
                    entry.remarks,
                    this.formType,
                    this.userName,
                     this.workId
                );
                uploadObservables.push(upload$);
            }
        });

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
        const payload = this.formEntries.map((entry) => ({
            id: entry.id,
            rebarQuantityDesign: entry.rebarNumber,
            longitudinalRebarSpacingDesign: entry.rebarSpacing,
            stirrupSpacingDesign: entry.stirrupSpacing,
            concreteCoverDesign: entry.concreteCover,
            remarks: entry.remarks,
        }));

      this.service.saveReinforcementData(payload, this.tableId, this.workId).subscribe({
  next: (response: any) => {
    const parsedResponse = JSON.parse(response); // Convert string to object

    // Use existing tableId if available, otherwise extract from response
    if (!this.tableId) {
      const id = parsedResponse?.[0]?.id;
      this.tableId = id || this.getTableIdFromResponse(parsedResponse);
    }

    if (this.tableId) {
      if (this.appNoStatus === 'REJECTED') {
        this.SavedReinforcementData.emit({
          tableId: this.tableId,
          data: this.data,
          inspectionType: this.inspectionType,
        });
        this.router.navigate(['/monitoring/occupational-health-and-safty']);
      } else {
        this.assignCheckListId();
        this.SavedReinforcementData.emit({
          tableId: this.tableId,
          data: this.data,
          inspectionType: this.inspectionType,
        });
        this.router.navigate(['/monitoring/occupational-health-and-safty']);
      }
    }
  },
  error: (error) => {
    console.error('Error saving draft:', error);
  },
});

    }
    getTableIdFromResponse(response: any): any {
  if (response && response.length > 0) {
    // Add more fallback logic if needed
    return response[0]?.someOtherId || null;
  }
  return null;
}


    assignCheckListId() {
        const payload = this.fileId; // this is a valid array of fileIds
        this.service.saveCheckListId(this.tableId,this.workId, payload).subscribe(
            (response) => {
                this.createNotification();
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
        this.previousClicked.emit(this.tableId);
        this.router.navigate(['/monitoring/work-progress']);
    }

    viewFile(attachment: string): void {
        this.service.downloadFile(attachment).subscribe(
            (response: HttpResponse<Blob>) => {
                const binaryData = [response.body];
                const blob = new Blob(binaryData, {
                    type: response.body?.type,
                });
                const blobUrl = window.URL.createObjectURL(blob);
                const fileName = this.extractFileName(attachment);

                // Open file in new window for preview
                const newWindow = window.open(
                    '',
                    '_blank',
                    'width=800,height=600'
                );
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
}
