import { Component, OnInit, OnDestroy } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Subject, timer } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-register-verify',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register-verify.component.html',
})
export class RegisterVerifyComponent implements OnInit, OnDestroy {
  verifyForm: FormGroup;
  phoneNumber: string = '';
  password: string = '';
  firstName: string = '';
  lastName: string = '';
  loading: boolean = false;
  isResending: boolean = false;
  countdown: number = 60;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {
    this.verifyForm = this.fb.group({
      code: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.phoneNumber = params['phoneNumber'] || '';
      this.password = params['password'] || '';
      this.firstName = params['firstName'] || '';
      this.lastName = params['lastName'] || '';
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.verifyForm.get(fieldName);
    return field ? field.invalid && (field.dirty || field.touched) : false;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.verifyForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) {
      return "Bu maydon to'ldirilishi shart";
    }
    if (field.hasError('minlength') || field.hasError('maxlength')) {
      return "Tasdiqlash kodi 6 raqamdan iborat bo'lishi kerak";
    }
    return '';
  }

  async resendCode() {
    if (this.isResending) return;

    this.isResending = true;
    this.countdown = 60;

    try {
      const data = {
        phoneNumber: this.phoneNumber,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName,
      };
      await this.authService.register(data.phoneNumber).toPromise();
      this.startCountdown();
    } catch (error) {
      console.error('Error resending code:', error);
      this.isResending = false;
    }
  }

  private startCountdown() {
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

  async onSubmit() {
    if (this.verifyForm.invalid || this.loading) return;

    this.loading = true;
    const code = this.verifyForm.get('code')?.value;

    try {
      const data = {
        phoneNumber: this.phoneNumber,
        password: this.password,
        code: code,
        firstName: this.firstName,
        lastName: this.lastName,
      };
      const response = await this.authService.verifyCode(data).toPromise();
      if (response?.tokens?.accessToken) {
        // Set token using auth service
        this.authService.setToken(response.tokens.accessToken);

        // Store additional data
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', response.tokens.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.user));
        }

        // Role bo'yicha yo'naltirish
        const token = response.tokens.accessToken;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role =
          payload[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ];

        if (role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      }
    } catch (error) {
      console.error('Error verifying code:', error);
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.navigate(['/register']);
  }
}
