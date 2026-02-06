import { Component, NgModule } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';

@Component({
  selector: 'app-test-navigation',
  imports: [FormsModule],
  templateUrl: './test-navigation.component.html',
})
export class TestNavigationComponent {
  email: string = '';

  subscribe() {
    alert('Rahmat! ' + this.email + ' — xabarnoma ro‘yxatiga qo‘shildi.');
    this.email = '';
  }
}
