import { Component, Input } from '@angular/core';
import { EngineerService } from '../../../../service/engineer.service';
import { HttpResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-engineer-record',
  templateUrl: './engineer-record.component.html',
  styleUrls: ['./engineer-record.component.scss']
})
export class EngineerRecordComponent {
  @Input() data: any;
  TableData: any;
   pageSize: number=1000;
  pageNo: number=1;	
  loading: boolean;
  constructor(private service:EngineerService ,private messageService:MessageService){}
  ngOnInit() {
  this.getRecordList(this.data);

    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
getRecordList(data: any) {
  const engineerDetails = {
    viewName: 'engineerAdverseCommentRecord',
    pageSize: this.pageSize,
    pageNo: this.pageNo,
    condition:
     [
      {
       field: 'engineerNo',
       value: data.engineerNo
       }
      ],
  };
  this.service.getListOfEngineer(engineerDetails).subscribe(
    (response: any) => {
      this.TableData = response.data;
    },
    (error) => {
      console.log(error);
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
  
          // Clean up
          document.body.removeChild(downloadLink);
          window.URL.revokeObjectURL(downloadLink.href);
        },
        (error) => {
          this.showErrorMessage('Requested file not found.Download failed')
          console.error('Download failed', error);
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
