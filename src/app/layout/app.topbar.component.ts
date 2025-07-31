import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LayoutService } from '../service/app.layout.service'
import { userManagment_redirection } from '../app.const/const';
import * as CryptoJS from 'crypto-js';
import { environment } from  '../../environments/environment.prod';
@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopBarComponent {
    @ViewChild('menubutton') menuButton!: ElementRef;
    @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;
    @ViewChild('topbarmenu') menu!: ElementRef;
@ViewChild('wrapperMenu') wrapperMenu!: ElementRef;

    access: any;
  module: any;
  uuid: any;
  username: any;
  userDetails: any;
  allMenuData: any[];

 // menu: any;
  sessionDataForCrps: { accesstoken: any; uuid: any; module: any; username: any };
  sessionStoreData: any;
  userSessionService: any;
  role: string;

  constructor(
    public layoutService: LayoutService,
    private route: ActivatedRoute,
   
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
        const userDetailsString = sessionStorage.getItem('userDetails');
        if (userDetailsString) {
          const userDetails = JSON.parse(userDetailsString);
          this.username = userDetails.username;
        }
      }
  // Optional: toggle manually
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    console.log('Menu toggled:', this.isMenuOpen);
  }

  isMenuOpen = false;
@HostListener('document:click', ['$event'])
handleClickOutside(event: MouseEvent): void {
  if (!this.wrapperMenu || !this.wrapperMenu.nativeElement) {
    return;
  }

  const clickedInside = this.wrapperMenu.nativeElement.contains(event.target);
  if (!clickedInside) {
    console.log('Clicked outside .wrapper-menu');
    this.closeSidebar();
  }
}
   closeSidebar(): void {
    // Your logic to close sidebar/menu
    console.log('Sidebar closed');
  }
  Logout() {
    // sessionStorage.clear();
    // localStorage.clear();
    const url = `${userManagment_redirection}/`;
    window.location.href = url;
  }
  getEncryptedUserDetails(): string | null {
    const userDetails = sessionStorage.getItem('userDetails');
    if (!userDetails) {
      return null;
    }
    const encrypted = CryptoJS.AES.encrypt(userDetails, environment.encryptionKey).toString();
    return encodeURIComponent(encrypted);
  }
  backToPortal() {
    const encryptedData = this.getEncryptedUserDetails();
    if (!encryptedData) return;
    const url = `${userManagment_redirection}/Portal?data=${encryptedData}`;
    window.location.href = url;
  }
  
}





