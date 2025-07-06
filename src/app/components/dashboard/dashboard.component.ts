import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../../service/app.layout.service';
import * as CryptoJS from 'crypto-js';
import { environment } from  '../../../environments/environment.prod';
import { CommonService } from '../../service/common.service';

@Component({
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  sessionPortalData: any;
  sessionTimeoutSubscription: any;
  router: any;
  pageSize:number=10
  pageNo:number=1
  loading: boolean = true;
  totalCounts: any;
  constructor(
    public layoutService: LayoutService,
    private route: ActivatedRoute,
    private service: CommonService,
  ) {}

  ngOnInit() {
    const encryptedData = decodeURIComponent(this.route.snapshot.queryParamMap.get('data') || '');
    
    if (encryptedData) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, environment.encryptionKey);
        const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        sessionStorage.setItem('userDetails', JSON.stringify(decrypted));
      } catch (error) {
      }
    }
    this.getTotalCountList()
    // Check if sessionDataForCrps is not already in sessionStorage
    if (!sessionStorage.getItem('sessionDataForCrps')) {
      // Subscribe to queryParams and set session data if not already set
      this.route.queryParams.subscribe((params: any) => {
        const sessionDataForCrps: any = {
          accesstoken: params['token'],
          module: params['module'],
        };
        sessionStorage.setItem('sessionDataForCrps', JSON.stringify(sessionDataForCrps));
        sessionStorage.setItem('accesstoken', params['token']);
      });
    } else {
    }
  }
    getTotalCountList() {
      const contractor = []
        // viewName: 'stats',
        // pageSize: this.pageSize,
        // pageNo: this.pageNo,
        // condition: [],
      this.service.fetchDetails(contractor, this.pageNo, this.pageSize, 'view_stats').subscribe(
        (response: any) => {
          this.loading = false;
          this.totalCounts = response.data;
        },
        (error) => {
          this.loading = false;
          console.error('Error fetching contractor details:', error);
        }
      );
    }
  }

     
