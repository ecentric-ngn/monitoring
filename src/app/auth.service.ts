import { Injectable } from '@angular/core';
import { userManagment_redirection } from './app.const/const';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  getUsername(): string {
    throw new Error('Method not implemented.');
  }
  constructor() { }

  loggedIn(): boolean {
    // Retrieve the user details from localStorage
    const userDetailsStr = sessionStorage.getItem('userDetails');

    if (!userDetailsStr) return false;

    try {
      const userDetails = JSON.parse(userDetailsStr);
      const token = userDetails.token; // Extract token from userDetails
      return !!token && !this.isTokenExpired(token);
    } catch (error) {
      return false; // Handle invalid JSON parsing
    }
  }

  getCurrentUser() {
    const userDetailsStr = sessionStorage.getItem('userDetails');
    if (!userDetailsStr) return null;
    try {
      return JSON.parse(userDetailsStr);
    } catch {
      return null;
    }
  }

getUserInfo(): { username: string | null; userId: string | null } {
  const user = this.getCurrentUser();
  return {
    username: user?.username ?? null,
    userId: user?.userId ?? null
  };
}


  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true; // Treat invalid tokens as expired

    const expirationDate = decoded.exp * 1000; // Convert to milliseconds
    return expirationDate < Date.now();
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      // Convert Base64Url to Base64
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      // Add padding if necessary
      const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
      const decodedPayload = atob(padded);
      return JSON.parse(decodedPayload);
    } catch (error) {
      return null; // Return null if decoding fails
    }
  }
}
