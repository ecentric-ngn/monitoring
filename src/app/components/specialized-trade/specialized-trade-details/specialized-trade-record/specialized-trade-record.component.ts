import { HttpResponse } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { SpecializedTradeService } from '../../../../service/specialized-trade.service';

@Component({
  selector: 'app-specialized-trade-record',
  templateUrl: './specialized-trade-record.component.html',
  styleUrls: ['./specialized-trade-record.component.scss']
})
export class SpecializedTradeRecordComponent {
  @Input() data: any;
  TableData: any;
  pageSize: number=1000;
  pageNo: number=1;	
  loading: boolean;

  constructor(private service:SpecializedTradeService){}
    
  ngOnInit() {
  this.getRecordList(this.data);
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
getRecordList(data: any) {
  const specializedTradeDetails = {
    viewName: 'specializedTradeAdverseCommentRecord',
    pageSize: this.pageSize,
    pageNo: this.pageNo,
    condition:
     [
      {
       field: 'specializedTradeNo',
       value: data.specializedTradeNo
       }
      ],
  };
  this.service.ListOfSpecializedTrade(specializedTradeDetails).subscribe(
    (response: any) => {
      this.TableData = response.data;
    },
    (error) => {
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
          // Handle error appropriately
        }
      );
    }
  
    // Extract filename from the file path
    extractFileName(filePath: string): string {
      return filePath.split('/').pop() || filePath.split('\\').pop() || 'downloaded-file';
    }
}

