import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Answer {
  id: string;
  text: string | null; // Ixtiyoriy
  image?: File | null; // Ixtiyoriy
  imageUrl?: string | null; // Ixtiyoriy
  isCorrect: boolean;
  correctDescription?: string | null; // Ixtiyoriy
}

export interface Question {
  id: string;
  text: string | null; // Ixtiyoriy
  imageUrl?: string | null; // Ixtiyoriy
  answers: Answer[];
}

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createQuestion(formData: FormData): Observable<void> {
    return this.http
      .post<void>(`${this.api}/Question`, formData)
      .pipe(catchError(this.handleError));
  }

  getAllQuestions(
    page: number,
    pageSize: number,
  ): Observable<{ questions: Question[]; total: number }> {
    return this.http
      .get<{
        questions: Question[];
        total: number;
      }>(`${this.api}/Question/page?page=${page}&pageSize=${pageSize}`)
      .pipe(catchError(this.handleError));
  }

  getQuestionById(id: string): Observable<Question> {
    return this.http
      .get<Question>(`${this.api}/Question/${id}`)
      .pipe(catchError(this.handleError));
  }

  updateQuestion(id: string, formData: FormData): Observable<void> {
    return this.http
      .put<void>(`${this.api}/Question/${id}`, formData)
      .pipe(catchError(this.handleError));
  }

  deleteQuestion(id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.api}/Question/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Noma’lum xatolik yuz berdi';
    if (error.status === 404) {
      errorMessage = 'Ma’lumot topilmadi';
    } else if (error.status === 400) {
      errorMessage =
        'So‘rovda xatolik: ' +
        (error.error?.message || 'Noto‘g‘ri ma’lumotlar');
    } else if (error.status === 500) {
      errorMessage = 'Server xatosi: Iltimos, keyinroq urinib ko‘ring';
    }
    return throwError(() => new Error(errorMessage));
  }
}
