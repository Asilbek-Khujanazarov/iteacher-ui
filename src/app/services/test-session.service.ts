import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface StartTestResponseDto {
  sessionId: string;
  questions: QuestionDto[];
  durationMinutes: number;
  deadline: Date;
}

export interface QuestionDto {
  id: string;
  text: string;
  imageUrl: string | null;
  answers: AnswerDto[];
}

export interface AnswerDto {
  id: string;
  text: string;
  imageUrl: string | null;
  isCorrect: boolean;
  correctDescription?: string;
}

export interface AnswerInputDto {
  questionId: string;
  answerId: string;
}

export interface TestResultDto {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswerCount: number;
  startedAt: Date;
  finishedAt: Date;
  grade: string;
  failureReason: string | null;
  correctQuestions: QuestionDto[];
  wrongQuestions: QuestionDto[];
  unansweredQuestions: QuestionDto[];
}

@Injectable({
  providedIn: 'root',
})
export class TestSessionService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  startTest(): Observable<StartTestResponseDto> {
    return this.http
      .post<StartTestResponseDto>(`${this.api}/Test/start`, {})
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err.error?.message || 'Server error')),
        ),
      );
  }

  submitAnswer(sessionId: string, dto: AnswerInputDto): Observable<void> {
    return this.http
      .post<void>(`${this.api}/Test/${sessionId}/answer`, dto)
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err.error?.message || 'Server error')),
        ),
      );
  }

  finishTest(sessionId: string): Observable<TestResultDto> {
    return this.http
      .post<TestResultDto>(`${this.api}/Test/${sessionId}/finish`, {})
      .pipe(
        catchError((err) =>
          throwError(() => new Error(err.error?.message || 'Server error')),
        ),
      );
  }
}
