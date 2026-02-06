import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { RegisterComponent } from './pages/auth/register.component';
import { RegisterVerifyComponent } from './pages/auth/register-verify.component';
import { AdminDashboardComponent } from './pages/Admin/admin-dashboard/admin-dashboard.component';
import { DashboardComponent } from './pages/Dashboards/dashboard/dashboard.component';
import { LoginComponent } from './pages/auth/login.component';
import { LoginVerifyComponent } from './pages/auth/login-verify.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';
import { ForgotPasswordVerifyComponent } from './pages/auth/forgot-password-verify.component';
import { AdminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { MyProfileComponent } from './pages/my-profile/my-profile.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: HomeComponent,
        pathMatch: 'full',
        canActivate: [guestGuard],
      },
      { path: 'about', component: AboutComponent },
      {
        path: 'register',
        component: RegisterComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'verify-code',
        component: RegisterVerifyComponent,
        canActivate: [guestGuard],
      },
      {
        path: 'admin-dashboard',
        component: AdminDashboardComponent,
        canActivate: [AdminGuard, authGuard],
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [authGuard],
      },
      { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
      {
        path: 'login-verify',
        component: LoginVerifyComponent,
        canActivate: [guestGuard],
      },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      {
        path: 'forgot-password-verify',
        component: ForgotPasswordVerifyComponent,
      },
      {
        path: 'my-profile',
        component: MyProfileComponent,
        canActivate: [authGuard],
      },
    ],
  },
];
