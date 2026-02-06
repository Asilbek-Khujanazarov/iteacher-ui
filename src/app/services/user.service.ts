import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  registeredDate: string;
  lastLoginDate: string | null;
  avatarUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.api}/User/me`);
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('File', file);
    return this.http.post<{ avatarUrl: string }>(
      `${this.api}/User/avatar`,
      formData,
    );
  }
}
