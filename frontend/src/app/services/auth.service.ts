import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserCreate, UserLogin, LoginResponse } from '../models/user.model';
import { StorageKeys } from '../core/constants/storage-keys.constant';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(StorageKeys.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  register(userData: UserCreate): Observable<any> {
    return this.apiService.post('/auth/register', userData);
  }

  login(loginData: UserLogin): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', loginData);
  }

  setAuthData(response: LoginResponse): void {
    localStorage.setItem(StorageKeys.ACCESS_TOKEN, response.access_token);
    localStorage.setItem(StorageKeys.USER, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  logout(): void {
    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    localStorage.removeItem(StorageKeys.USER);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(StorageKeys.ACCESS_TOKEN);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem(StorageKeys.ACCESS_TOKEN);
  }
}

