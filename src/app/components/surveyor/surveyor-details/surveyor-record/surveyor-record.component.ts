import { HttpResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { SurveyorService } from '../../../../service/surveyor.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-surveyor-record',
  templateUrl: './surveyor-record.component.html',
  styleUrls: ['./surveyor-record.component.scss']
})
export class SurveyorRecordComponent {
  @Input() data: any;
  TableData: any;
   pageSize: number=1000;
  pageNo: number=1;	
  loading: boolean=true
  constructor(private service:SurveyorService, private messageService:MessageService){}
  ngOnInit() {
  this.getRecordList(this.data);
  }
  getRecordList(data: any) {
  const surveyorDetails = {
    viewName: 'surveyorAdverseCommentRecord',
    pageSize: this.pageSize,
    pageNo: this.pageNo,
    condition:
     [
      {
       field: 'surveyorNo',
       value: data.surveyorNo
       }
      ],
  };
  this.service.getListOfSurveyor(surveyorDetails).subscribe(
    (response: any) => {
      this.TableData = response.data;
      this.loading=false
    },
    (error) => {
      console.log(error);
      this.loading=false
    }
  );
}
    // To download the file with its original name based on the file path
    viewFile(filePath: string): void {
      this.service.downloadFile(filePath).subscribe(
        (response: HttpResponse<Blob>) => {
          const filename: string = this.extractFileName(filePath);
          const binaryData = [response.body];
          const blob = new Blob(binaryData, { type: response.body.type });
          const downloadLink = document.createElement('a');
          downloadLink.href = window.URL.createObjectURL(blob);
          downloadLink.setAttribute('download', filename);
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadLink.href);
        },
        (error) => {
          console.error('Download failed', error);
          this.showErrorMessage('Something went wrong.Please try again later.Download failed')
          // Handle error appropriately
        }
      );
    }
    showErrorMessage(message: string) {
      this.messageService.add({ severity: 'error', summary: 'error', detail: message });
    }
    // Extract filename from the file path
    extractFileName(filePath: string): string {
      return filePath.split('/').pop() || filePath.split('\\').pop() || 'downloaded-file';
    }
}

