import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthServiceService } from './auth.service';
import { userManagment_redirection } from './app.const/const';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private inactivityTimeout: any;

  constructor(private authServiceService: AuthServiceService, private router: Router) {
    this.startInactivityTimeout(); // Initialize the inactivity timer
    this.addActivityListeners();
    this.addUnloadListener(); // Add the unload listener for tab/window close
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const url: string = state.url;
    if (this.authServiceService.loggedIn()) {
      return true;
    } else {
      // Store the attempted URL for redirecting
      sessionStorage.setItem('redirectUrl', url);
      this.redirectToLogin();
      return false;
    }
  }

  private redirectToLogin(): void {
    localStorage.clear();  // Clear localStorage on logout
    const login = `${userManagment_redirection}`; // Redirect URL
    window.location.href = login;
  }

  // Start the inactivity timeout
  private startInactivityTimeout(): void {
    this.clearInactivityTimeout();
    this.inactivityTimeout = setTimeout(() => {
      this.redirectToLogin();
    }, 1800000); // 5 minutes = 300000 ms
  }

  // Clear the timeout
  private clearInactivityTimeout(): void {
    if (this.inactivityTimeout) {
      clearTimeout(this.inactivityTimeout);
    }
  }

  // Add event listeners to reset the inactivity timer on user interaction
  private addActivityListeners(): void {
    const events = ['click', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach((event) =>
      window.addEventListener(event, () => {
        this.startInactivityTimeout();
      })
    );
  }

  // Add a listener for when the window or tab is closed
  private addUnloadListener(): void {
    window.addEventListener('beforeunload', () => {
      localStorage.clear();  // Clear localStorage when the user closes the tab or window
    });
  }
}
