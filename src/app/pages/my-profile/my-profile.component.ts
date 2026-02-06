import { Component, OnInit } from '@angular/core';
import { UserService, UserProfile } from '../../services/user.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PhoneFormatPipe } from '../../pipes/phone-format.pipe';
@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    PhoneFormatPipe,
  ],
})
export class MyProfileComponent implements OnInit {
  user: UserProfile | null = null;
  loading = true;
  error: string | null = null;
  avatarUploading = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.getMyProfile().subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: () => {
        this.error = "Ma'lumotlarni yuklashda xatolik yuz berdi";
        this.loading = false;
      },
    });
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.avatarUploading = true;
      this.userService.uploadAvatar(file).subscribe({
        next: (res) => {
          if (this.user) this.user.avatarUrl = res.avatarUrl;
          this.avatarUploading = false;
        },
        error: () => {
          this.avatarUploading = false;
          alert('Avatarni yuklashda xatolik yuz berdi');
        },
      });
    }
  }
}
