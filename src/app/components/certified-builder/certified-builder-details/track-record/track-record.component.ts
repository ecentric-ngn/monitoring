import { Component, Input } from '@angular/core';
import { CertifiedBuilderService } from '../../../../service/certified-builder.service';
import { MessageService } from 'primeng/api';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-track-record',
  templateUrl: './track-record.component.html',
  styleUrls: ['./track-record.component.scss']
})
export class TrackRecordComponent {
  @Input() data: any;
  TableData:any[]  
  pageSize:number=100;
  pageNo:number=1;
  constructor(private service:CertifiedBuilderService, private messageService:MessageService,){}

  ngOnInit(){
    this.getTrackRecordList(this.data) 
}
//getting the human resource
  getTrackRecordList(data:any){
    const certifiedBuilder = {
      "viewName": "trackRecord",
      "pageSize":this.pageSize,
      "pageNo":this.pageNo,
      "condition": [
         {
          "field": "contractorId",
          "value": data.certifiedBuilderNo 
       }
    ]
  }
    this.service.getListOfCertifiedBuilder(certifiedBuilder)
    .subscribe(
      (response: any) => {
        this.TableData = response.data.map((item: any) => {
          let apsScoreTen = 0;
          const hundredOntimeCompletion = item.hundredOntimeCompletion || 0; // Ensure value exists
          // Calculate score based on the formula
          if (hundredOntimeCompletion >= 95) {
            apsScoreTen = 10; // Full score for completion between 95% and 100%
          } else if (hundredOntimeCompletion >= 55) {
            // Subtract 1 point for every 5% decrease, rounded off to the nearest lower 5%
            const scoreReduction = Math.floor((100 - hundredOntimeCompletion) / 5);
            apsScoreTen = 10 - scoreReduction; // Subtract calculated points from 10
          } else {
            apsScoreTen = null; // Below 55%, score is 0
          }
          return {
            ...item,
            apsTen: apsScoreTen // Add the calculated apsTen value
          };
        });
      },
      (error: any) => {
        if (error.status === 500) {
          // Display error message if status is 500
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong, please try again later.' });
        } else {
          // Handle other errors if needed
          console.error('Error:', error);
        }
      }
    );
  }
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
  extractFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath.split('\\').pop() || 'downloaded-file';
  }
  showErrorMessage(message: string) {
    this.messageService.add({ severity: 'error', summary: 'error', detail: message });
    
  }
  }
   
