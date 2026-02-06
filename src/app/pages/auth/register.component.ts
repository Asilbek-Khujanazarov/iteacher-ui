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
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  hidePassword = true;
  loading = false;
  genders = [
    { value: 1, label: 'Erkak' },
    { value: 2, label: 'Ayol' },
  ];
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
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      gender: [null, Validators.required],
      countryCode: ['+998', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit() {
    if (this.registerForm.invalid) return;
    this.loading = true;
    const phoneNumber =
      this.registerForm.value.countryCode.replace('+', '') +
      this.registerForm.value.phone;
    this.auth.register(phoneNumber).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/verify-code'], {
          queryParams: {
            phoneNumber,
            firstName: this.registerForm.value.firstName,
            lastName: this.registerForm.value.lastName,
            gender: this.registerForm.value.gender,
            password: this.registerForm.value.password,
          },
        });
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
