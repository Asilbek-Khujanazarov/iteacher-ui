import { Component } from '@angular/core';

import { TestNavigationComponent } from '../../../test-navigation/test-navigation.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TestNavigationComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {}
