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
  selector: 'app-login-verify',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login-verify.component.html',
})
export class LoginVerifyComponent implements OnInit, OnDestroy {
  verifyForm: FormGroup;
  phoneNumber: string = '';
  password: string = '';
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
      await this.authService.login(this.phoneNumber, this.password).toPromise();
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
      };
      const response = await this.authService.loginVerify(data).toPromise();
      if (response?.item1?.accessToken) {
        this.authService.setToken(response.item1.accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', response.item1.refreshToken);
          localStorage.setItem('user', JSON.stringify(response.item2));
        }
        this.authService.setUser(response.item2);
        const token = response.item1.accessToken;
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
    this.router.navigate(['/login']);
  }
}
