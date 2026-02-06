import { Component } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  loading = false;
  countryCodes = [
    { value: '+998', label: 'uz +998' },
    { value: '+7', label: 'ru +7' },
    { value: '+1', label: 'us +1' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
  ) {
    this.loginForm = this.fb.group({
      countryCode: ['+998', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;
    this.loading = true;
    const phoneNumber =
      this.loginForm.value.countryCode.replace('+', '') +
      this.loginForm.value.phone;
    const password = this.loginForm.value.password;
    this.auth.login(phoneNumber, password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/login-verify'], {
          queryParams: {
            phoneNumber,
            password,
          },
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }
}
