import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const AdminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  if (authService.isAdmin()) {
    return true;
  }

  // Redirect to dashboard if not admin
  router.navigate(['/dashboard']);
  return false;
};
