import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';
import { User, UserCreate, UserLogin, LoginResponse } from '../models/user.model';
import { StorageKeys } from '../core/constants/storage-keys.constant';

/**
 * Serviço de autenticação
 */
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

  /**
   * Obtém o utilizador do armazenamento local
   */
  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(StorageKeys.USER);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Regista um novo utilizador
   */
  register(userData: UserCreate): Observable<any> {
    return this.apiService.post('/auth/register', userData);
  }

  /**
   * Inicia sessão
   */
  login(loginData: UserLogin): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login', loginData);
  }

  /**
   * Define os dados de autenticação após login
   */
  setAuthData(response: LoginResponse): void {
    localStorage.setItem(StorageKeys.ACCESS_TOKEN, response.access_token);
    localStorage.setItem(StorageKeys.USER, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }

  /**
   * Termina a sessão
   */
  logout(): void {
    localStorage.removeItem(StorageKeys.ACCESS_TOKEN);
    localStorage.removeItem(StorageKeys.USER);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Verifica se o utilizador está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(StorageKeys.ACCESS_TOKEN);
  }

  /**
   * Obtém o utilizador atual
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Obtém o token de acesso
   */
  getToken(): string | null {
    return localStorage.getItem(StorageKeys.ACCESS_TOKEN);
  }
}

