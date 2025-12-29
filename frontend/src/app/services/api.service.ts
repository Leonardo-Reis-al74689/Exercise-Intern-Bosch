import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { StorageKeys } from '../core/constants/storage-keys.constant';
import { MessagesService } from '../core/services/messages.service';

/**
 * Serviço base para comunicação com a API
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private messagesService: MessagesService
  ) {}

  /**
   * Obtém os headers HTTP com autenticação
   */
  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem(StorageKeys.ACCESS_TOKEN);
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  /**
   * Trata erros HTTP e retorna mensagens apropriadas
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = this.messagesService.ERRORS.UNKNOWN;
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `${this.messagesService.ERRORS.NETWORK}: ${error.error.message}`;
    } else {
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = this.messagesService.getHttpErrorMessage(error.status);
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => this.handleError(error))
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError((error) => this.handleError(error))
    );
  }
}

