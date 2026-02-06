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
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
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
    this.forgotForm = this.fb.group({
      countryCode: ['+998', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;
    this.loading = true;
    const phoneNumber =
      this.forgotForm.value.countryCode.replace('+', '') +
      this.forgotForm.value.phone;
    this.auth.forgotPassword(phoneNumber).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/forgot-password-verify'], {
          queryParams: { phoneNumber },
        });
      },
      error: () => {
        this.loading = false;
        // alert("Telefon raqam topilmadi yoki xatolik!");
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
