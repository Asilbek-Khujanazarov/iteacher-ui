import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TestSessionService,
  StartTestResponseDto,
  TestResultDto,
  QuestionDto,
} from '../../../services/test-session.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-test-session',
  templateUrl: './test-session.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class TestSessionComponent implements OnInit, OnDestroy {
  session: StartTestResponseDto | null = null;
  result: TestResultDto | null = null;
  currentQuestionIndex: number = 0;
  currentQuestion: QuestionDto | null = null;
  selectedAnswerId: string | null = null;
  timeRemaining: Date = new Date(0);
  loading = false;
  error: string | null = null;
  selectedImage: SafeUrl | null = null;
  showFinishConfirm = false;
  private timerSubscription: Subscription | null = null;

  constructor(
    private testSessionService: TestSessionService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.stopTimer();
  }

  startTest(): void {
    this.loading = true;
    this.error = null;
    this.result = null;
    this.session = null;
    this.currentQuestionIndex = 0;
    this.selectedAnswerId = null;
    this.showFinishConfirm = false;

    this.testSessionService.startTest().subscribe({
      next: (response: StartTestResponseDto) => {
        this.session = response;
        this.currentQuestion = response.questions[0];
        this.startTimer(response.deadline);
        this.loading = false;
      },
      error: (err: any) => {
        this.error =
          err.status === 401
            ? 'Foydalanuvchi autentifikatsiyadan o‘tmagan'
            : 'Testni boshlashda xatolik yuz berdi';
        this.loading = false;
      },
    });
  }

  submitAnswer(): void {
    if (!this.session || !this.currentQuestion || !this.selectedAnswerId)
      return;

    this.loading = true;
    this.error = null;

    this.testSessionService
      .submitAnswer(this.session.sessionId, {
        questionId: this.currentQuestion.id,
        answerId: this.selectedAnswerId,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.selectedAnswerId = null;

          // Check if this is the last question
          if (
            this.session &&
            this.currentQuestionIndex === this.session.questions.length - 1
          ) {
            this.finishTest();
          } else {
            this.currentQuestionIndex++;
            this.currentQuestion =
              this.session?.questions[this.currentQuestionIndex] || null;
          }
        },
        error: (err: any) => {
          this.error =
            err.message === 'Vaqt tugagan, test avtomatik tugatildi'
              ? 'Vaqt tugagan! Test avtomatik yakunlandi.'
              : 'Javobni yuborishda xatolik yuz berdi';
          this.loading = false;
          if (err.message === 'Vaqt tugagan, test avtomatik tugatildi') {
            this.finishTest();
          }
        },
      });
  }

  onAnswerSelect(answerId: string): void {
    this.selectedAnswerId = answerId;
    this.submitAnswer(); // Automatically submit the answer
  }

  confirmFinishTest(): void {
    this.showFinishConfirm = true;
  }

  cancelFinishTest(): void {
    this.showFinishConfirm = false;
  }

  finishTest(): void {
    if (!this.session) return;

    this.loading = true;
    this.error = null;
    this.stopTimer();

    this.testSessionService.finishTest(this.session.sessionId).subscribe({
      next: (response: TestResultDto) => {
        this.result = response;
        this.session = null;
        this.currentQuestion = null;
        this.showFinishConfirm = false;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Testni yakunlashda xatolik yuz berdi';
        this.loading = false;
        this.showFinishConfirm = false;
      },
    });
  }

  openImage(image: string): void {
    this.selectedImage = this.sanitizer.bypassSecurityTrustUrl(image);
  }

  closeImage(): void {
    this.selectedImage = null;
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  private startTimer(deadline: Date): void {
    this.stopTimer();
    const updateInterval = 1000; // Update every second
    this.timerSubscription = interval(updateInterval).subscribe(() => {
      const now = new Date();
      const timeDiff = new Date(deadline).getTime() - now.getTime();
      if (timeDiff <= 0) {
        this.timeRemaining = new Date(0);
        this.finishTest();
      } else {
        this.timeRemaining = new Date(timeDiff);
      }
    });
  }

  private stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
}
