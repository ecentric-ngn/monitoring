import { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { LayoutService } from "../service/app.layout.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonService } from "../service/common.service";
import { CInet_Redirection } from "../app.const/const";
import { faCoffee } from '@fortawesome/free-solid-svg-icons';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment.prod';
@Component({
  selector: "app-menu",
  templateUrl: "./app.menu.component.html",
})
export class AppMenuComponent implements OnInit {
  faCoffee = faCoffee;
  filmIcon = faFilm;
  currentTab: string; 
  //currentTab: string = "";
  isSubMenuOpen: boolean = false;
  model: any[] = [];
  moduleName: any[] = [];
  access: any;
  module: any;
  uuid: any;
  username: any;
  userDetails: any;
  allMenuData: any[];
  menu: any;
  sessionDataForCrps: { accesstoken: any; uuid: any; module: any; username: any };
  sessionLocalData: any;
  Privileges: any;
  sessionStoreData: any;
  activeSubMenuId: string | null = null;
  activeMenuName: string | null = null;
  currentSubMenu: string = '';
  ciNet: string = '';

  constructor(
    public layoutService: LayoutService,
    private router: Router,
    private dataService: LayoutService,
    private commonService: CommonService,
   
  ) {}

  ngOnInit() {
    this.Crps();
  }
  Crps() {
    // Retrieve user details from session storage
    const sessionLocalData: any = JSON.parse(sessionStorage.getItem('sessionDataForCrps'));
    const userDetails: any = JSON.parse(sessionStorage.getItem('userDetails'));
    // Initialize variables
    let uuid, token, module;
    // Check if sessionLocalData exists
    if (sessionLocalData) {
      // Retrieve values from sessionLocalData
      module = sessionLocalData.module; // Get the module
      uuid = sessionLocalData.userId; // Get the userId (UUID)
      token = sessionLocalData.token; // Get the token
    }
    // If uuid or token is missing, prefer values from userDetails
    if (!uuid || !token || !module) {
      if (userDetails) {
        uuid = userDetails.userId || uuid;  // Use userId from userDetails if not already set
        token = userDetails.token || token; // Use token from userDetails if not already set
        module = userDetails.module || module; // Use module from userDetails if not already set
      } else {
        console.error("User details not found in session storage.");
        return; // Exit if no valid data found
      }
    }
  
    // Proceed to fetch models using the retrieved values
    if (token && uuid && module) {
      this.commonService.getModelsByUserId(uuid, token, module).subscribe(
        (response: any[]) => {
          response.forEach(menuItem => {
            if (menuItem.submenu && menuItem.submenu.length > 0) {
              menuItem.submenu.sort((a, b) => a.submenu_sequence - b.submenu_sequence);
            }
          });
          // Assign the sorted response to this.allMenuData
          this.allMenuData = response;
          this.ciNet = response[0].menu_name ;
        },
        (error: any) => {
          console.error("Error fetching models:", error);
        }
      );
    } else {
      console.error("Token, UUID, or module is missing.");
    }
  }
  navigateToDashboard(tab: string) {
    if (this.router.url === `/${tab}`) {
        this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
                this.router.navigate([`/${tab}`]);
                
            });
    } else {
        this.router.navigate([`/${tab}`]);
        
    }
}
  hasPrivilege(privileges: any[], targetPrivilege: string): boolean {
    return privileges.some((privilege) => privilege.name === targetPrivilege);
  }
  setActiveMenu(menuName: string) {
    this.activeMenuName = menuName;
  }
  setActiveSubMenu(submenuId: string) {
    this.activeSubMenuId = submenuId;
  }
  isActiveMenu(menuName: string): boolean {
    return this.activeMenuName === menuName;
  }
  isActiveSubMenu(submenuId: string): boolean {
    return this.activeSubMenuId === submenuId;
  }
  getEncryptedUserDetails(): string | null {
    const userDetails = sessionStorage.getItem('userDetails');
    if (!userDetails) {
      console.error('User details not found in sessionStorage.');
      return null;
    }
    const encrypted = CryptoJS.AES.encrypt(userDetails, environment.encryptionKey).toString();
    return encodeURIComponent(encrypted);
  }

navigate(url: string, submenuId: string, menuName: string) {
  
  // Retrieve user details and session data from sessionStorage
  const sessionLocalData = JSON.parse(sessionStorage.getItem('sessionDataForCrps') || '{}');
  const userDetails = JSON.parse(sessionStorage.getItem('userDetails') || '{}');
  // Initialize variables
  let token = '', uuid = '', username = '';
  // First, check if uuid and token are available in userDetails
  if (userDetails) {
    uuid = userDetails.userId || '';
    token = userDetails.token || '';
    username = userDetails.username || '';
  }
  
  // If uuid or token is missing, retrieve from sessionLocalData
  if (!uuid || !token) {
    if (sessionLocalData) {
      uuid = sessionLocalData.uuid || '';
      token = sessionLocalData.accesstoken || '';
      username = sessionLocalData.username || '';
    }
  }
  // Fetch module from sessionLocalData
  const module = sessionLocalData.module || '';
  if (url === 'cinet' || menuName === 'CINET Work') {
    const redirectUrl = `${CInet_Redirection}/WorkList`;
    window.location.href = redirectUrl;
  } else {
    // Navigate to a different tab
    this.currentTab = url;
    this.setActiveSubMenu(submenuId);
    this.setActiveMenu(menuName);
  
    // Use the token in your service call
    this.commonService.getPrivileges(submenuId, uuid, token).subscribe(
      (res: any) => {
        const setPrivileges = res;
        
        this.Privileges = setPrivileges;
        sessionStorage.setItem('setPrivileges', JSON.stringify(setPrivileges));
        if (this.router.url === `/${url}`) {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.dataService.setData(url);
            this.router.navigate([`/${url}`]);
          });
        } else {
          this.dataService.setData(url);
          this.router.navigate([`/${url}`]);
        }
      },
      error => {
        console.error('Error fetching privileges:', error);
      }
    );
  }
}
}


