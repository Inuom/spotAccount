import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    is_active: boolean;
  };
}

export interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponse {
  message: string;
}

export interface ReAuthenticateResponse {
  authenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private apiService: ApiService) {}

  /**
   * Login with email and password
   */
  login(loginDto: LoginDto): Observable<AuthResponse> {
    console.log('AuthService: Attempting login for:', loginDto.email);
    // Use a custom headers for login to prevent caching
    return this.apiService.post<AuthResponse>('auth/login', loginDto);
  }

  /**
   * Update current user's password
   */
  updatePassword(updatePasswordDto: UpdatePasswordDto): Observable<UpdatePasswordResponse> {
    return this.apiService.post<UpdatePasswordResponse>('auth/update-password', updatePasswordDto);
  }

  /**
   * Re-authenticate user with password for sensitive operations
   */
  reAuthenticate(password: string): Observable<ReAuthenticateResponse> {
    return this.apiService.post<ReAuthenticateResponse>('auth/re-authenticate', { password });
  }

  /**
   * Get stored auth token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Store auth token
   */
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  /**
   * Remove auth token (logout)
   */
  removeToken(): void {
    localStorage.removeItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

