import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { tap, catchError, timeout } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private readonly TIMEOUT = 30000; // 30 seconds timeout
  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.isAuthenticatedSubject.next(!!this.getToken());
    }
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Xatolik yuz berdi';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Xatolik: ${error.error.message}`;
    } else {
      if (error.status === 0) {
        errorMessage =
          'Serverga ulanishda xatolik. Internet aloqangizni tekshiring.';
      } else if (error.status === 408) {
        errorMessage = "So'rov vaqti tugadi. Qaytadan urinib ko'ring.";
      } else {
        errorMessage = `Server xatoligi: ${error.status} - ${error.message}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  private addTimeout<T>(request: Observable<T>): Observable<T> {
    return request.pipe(timeout(this.TIMEOUT), catchError(this.handleError));
  }

  private getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload[
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
      ];
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getUserRole() === 'Admin';
  }

  register(phoneNumber: string): Observable<any> {
    return this.addTimeout(
      this.http.post(`${this.api}/Auth/register`, { phoneNumber }),
    );
  }

  verifyCode(data: any): Observable<any> {
    return this.addTimeout(
      this.http.post(`${this.api}/Auth/register/verify`, data),
    );
  }

  login(phoneNumber: string, password: string): Observable<any> {
    return this.addTimeout(
      this.http.post(`${this.api}/Auth/login`, { phoneNumber, password }),
    );
  }

  loginVerify(data: any): Observable<any> {
    return this.addTimeout(
      this.http.post(`${this.api}/Auth/login/verify`, data).pipe(
        tap((response: any) => {
          if (response?.item1?.accessToken) {
            this.setToken(response.item1.accessToken);
            if (response.item2) {
              this.setUser(response.item2);
            }
          }
        }),
      ),
    );
  }

  forgotPassword(phoneNumber: string) {
    return this.addTimeout(
      this.http.post(`${this.api}/Auth/forgot-password`, { phoneNumber }),
    );
  }

  resetPassword(data: any) {
    return this.addTimeout(
      this.http.post(`${this.api}/Auth/reset-password`, data),
    );
  }

  setToken(token: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('accessToken', token);
      this.isAuthenticatedSubject.next(true);
    }
  }

  removeToken() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      this.isAuthenticatedSubject.next(false);
    }
  }

  logout() {
    this.removeToken();
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  setUser(user: any) {
    this.userSubject.next(user);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  getUser() {
    return this.userSubject.value;
  }
}
