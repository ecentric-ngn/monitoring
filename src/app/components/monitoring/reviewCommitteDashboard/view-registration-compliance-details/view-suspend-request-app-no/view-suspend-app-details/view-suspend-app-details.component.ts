import { Component } from '@angular/core';
import { CommonService } from '../../../../../../service/common.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-view-suspend-app-details',
  templateUrl: './view-suspend-app-details.component.html',
  styleUrls: ['./view-suspend-app-details.component.scss']
})
export class ViewSuspendAppDetailsComponent {
bctaNo: string = '';
 complianceEntities: any[] = [];
  vehicles: any[] = [];
  hrCompliance: any[] = [];
  WorkDetail: any = {};
  tableData: any;
  pageNo: any;
  pageSize: any;
  formData: any={};
  showErrorMessage: any;
constructor(private service: CommonService) {}



ngOnInit() {
 const WorkDetail = this.service.getData('BctaNo');
    this.WorkDetail = WorkDetail.data;
    console.log('WorkDetail', WorkDetail);
    if(this.WorkDetail.firmId){
      this.getAppDetailsByBcNo();
    }
}

getAppDetailsByBcNo() {
  this.service.getDatabasedOnBctaNos(this.WorkDetail.firmId,this.WorkDetail.applicationID).subscribe((res: any) => {
   this.complianceEntities = res.complianceEntities || [];
   
      this.vehicles = res.vehicles || [];
      this.hrCompliance = res.hrCompliance || [];
      this.fetchComplianceDetails();

  });
}

  fetchComplianceDetails() {
  const payload = [
    {
      field: 'bctaNo',
      value: this.WorkDetail.firmId,
      condition: 'LIKE',
      operator: 'AND'
    }
  ];
    this.service.fetchDetails(payload,1,10,'combine_firm_dtls_view').subscribe(
            (response: any) => {
               this.formData = response.data[0] || {};
                console.log('tableData.........', this.formData);
            },
            (error) => {
                console.error('Error fetching contractor details:', error);
            }
        );
}

downloadFile(filePath: string): void {
  const sanitizedPath = filePath.replace(/\s+/g, ' ');
  this.service.downloadFileFirm(sanitizedPath).subscribe(
        (response: HttpResponse<Blob>) => {
            const binaryData = [response.body];
            const mimeType = response.body?.type || 'application/octet-stream';
            const blob = new Blob(binaryData, { type: mimeType });
            const blobUrl = window.URL.createObjectURL(blob);

            // Ensure filename is properly extracted and decoded
            const fileName = this.extractFileName(filePath);
            const isImage = mimeType.startsWith('image/');

            const newWindow = window.open('', '_blank', 'width=800,height=600');
            if (newWindow) {
                newWindow.document.write(`
                    <html>
                        <head>
                            <title>File Preview</title>
                        </head>
                        <body style="margin:0; text-align: center;">
                            <div style="padding:10px;">
                                <a href="${blobUrl}" download="${fileName}" 
                                   style="font-size:16px; color:blue;" 
                                   target="_blank">⬇ Download ${fileName}</a>
                            </div>
                            ${isImage
                                ? `<img src="${blobUrl}" style="max-width:100%; height:auto;" alt="Image Preview"/>`
                                : `<iframe src="${blobUrl}" width="100%" height="90%" style="border:none;"></iframe>`}
                        </body>
                    </html>
                `);

                // Clean up after window is closed
                newWindow.onbeforeunload = () => {
                    window.URL.revokeObjectURL(blobUrl);
                };
            } else {
                console.error('Failed to open the new window');
                // Fallback to direct download if window fails to open
                this.forceDownload(blob, fileName);
            }
        },
        (error: HttpErrorResponse) => {
            if (error.status === 404) {
                console.error('File not found', error);
                this.showErrorMessage();
            }
        }
    );
}



// Improved filename extraction
private extractFileName(filePath: string): string {
    try {
        // Handle URL encoded paths
        const decodedPath = decodeURIComponent(filePath);
        // Extract filename and remove any query parameters
        return decodedPath.split('/').pop()?.split('?')[0] || 'download';
    } catch {
        return filePath.split('/').pop() || 'download';
    }
}

// Fallback direct download method
private forceDownload(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 100);
}

printCertificate(): void {
  const certificateContent = document.querySelector('.container') as HTMLElement;
  if (certificateContent) {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'visible';
    const options = {
      scale: 2,
      useCORS: true,
      scrollY: -window.scrollY,
      windowHeight: certificateContent.scrollHeight
    };
    html2canvas(certificateContent, options).then((canvas) => {
      document.body.style.overflow = originalOverflow;
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgProps = {
        width: canvas.width,
        height: canvas.height
      };
      // First create the PDF
      const pdf = new jsPDF({
        orientation: imgProps.width > imgProps.height ? 'landscape' : 'portrait',
        unit: 'mm'
      });
      
      const pageHeight = pdf.internal.pageSize.getHeight();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const ratio = imgProps.width / imgProps.height;
      
      let height = imgProps.height / 100 * 25.4; // Convert pixels to mm
      let width = height * ratio;
      
      if (width > pageWidth) {
        width = pageWidth;
        height = width / ratio;
      }
      
      let position = 0;
      while (position < height) {
        if (position > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'JPEG', 0, -position, width, height);
        position += pageHeight;
      }
      
      pdf.save('Certificate.pdf');
    });
  }
}
}
