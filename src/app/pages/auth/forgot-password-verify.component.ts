import { Component, OnInit, OnDestroy } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password-verify',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password-verify.component.html',
})
export class ForgotPasswordVerifyComponent implements OnInit, OnDestroy {
  verifyForm: FormGroup;
  phoneNumber: string = '';
  loading: boolean = false;
  isResending: boolean = false;
  countdown: number = 60;
  hidePassword = true;
  hideConfirmPassword = true;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService,
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.route.queryParams.subscribe((params) => {
      this.phoneNumber = params['phoneNumber'] || '';
    });
    this.startCountdown();
  }

  ngOnInit() {
    // Additional initialization logic if needed
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  startCountdown() {
    this.countdown = 60;
    timer(0, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          this.isResending = false;
        }
      });
  }

  async resendCode() {
    if (this.isResending) return;

    this.isResending = true;
    this.countdown = 60;

    try {
      await this.auth.forgotPassword(this.phoneNumber).toPromise();
      this.startCountdown();
    } catch (error) {
      console.error('Error resending code:', error);
      this.isResending = false;
    }
  }

  onSubmit() {
    if (this.verifyForm.invalid) return;
    if (
      this.verifyForm.value.newPassword !==
      this.verifyForm.value.confirmNewPassword
    ) {
      alert('Parollar mos emas!');
      return;
    }
    this.loading = true;
    const data = {
      phoneNumber: this.phoneNumber,
      code: this.verifyForm.value.code,
      newPassword: this.verifyForm.value.newPassword,
      confirmNewPassword: this.verifyForm.value.confirmNewPassword,
    };
    this.auth.resetPassword(data).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login']);
      },
      error: () => {
        this.loading = false;
        // alert("Kod yoki parolda xatolik!");
      },
    });
  }

  goBack() {
    this.router.navigate(['/forgot-password']);
  }
}
