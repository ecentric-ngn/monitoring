import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Subject, Observable, map, BehaviorSubject } from "rxjs";

export interface AppConfig {
  inputStyle: string;
  colorScheme: string;
  theme: string;
  ripple: boolean;
  menuMode: string;
  scale: number;
}
export interface Message {
  author: string;
  message: string;
}

interface LayoutState {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  profileSidebarVisible: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
}

@Injectable({
  providedIn: "root",
})
export class LayoutService {
  // private privilegesSubject: any;
  next: any
  private sharedData: any;
  private username: string | null = null;
  router: any;
  privileges$: any;
  private privilegesSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private sessionDataForCrps: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  
  setPrivileges(privileges: any) {
    this.privilegesSubject.next(privileges); // Update the next value of the Subject
  }

  getPrivileges(): Observable<any> {
    return this.privilegesSubject; // Return the observable
  }

  // for ession
  setsessionDataForCrps(sessionDataForCrps: any) {
    this.sessionDataForCrps.next(sessionDataForCrps); // Update the next value of the Subject
  }

  getsessionDataForCrps(): Observable<any> {
    return this.sessionDataForCrps; // Return the observable
  }

  // for crps menu component ts
  setData(data: any) {
    this.sharedData = data;
  }

  getData() {
    return this.sharedData;
  }

  config: AppConfig = {
    ripple: false,
    inputStyle: "outlined",
    menuMode: "static",
    colorScheme: "light",
    theme: "lara-light-indigo",
    scale: 14,
  };

  state: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
  };

  public messages: Subject<Message>;

  constructor(private http: HttpClient) { }

  private configUpdate = new Subject<AppConfig>();

  private overlayOpen = new Subject<any>();

  configUpdate$ = this.configUpdate.asObservable();

  overlayOpen$ = this.overlayOpen.asObservable();


}


