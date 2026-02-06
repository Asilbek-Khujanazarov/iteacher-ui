import {
  Injectable,
  ComponentRef,
  createComponent,
  ApplicationRef,
  Injector,
  Type,
} from '@angular/core';
import { NotificationComponent } from '../components/notification/notification.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
  ) {}

  show(message: string, type: 'success' | 'error' = 'success') {
    const componentRef = createComponent(NotificationComponent, {
      environmentInjector: this.appRef.injector,
      elementInjector: this.injector,
    });

    componentRef.instance.message = message;
    componentRef.instance.type = type;

    document.body.appendChild(componentRef.location.nativeElement);
    this.appRef.attachView(componentRef.hostView);

    componentRef.instance.ngOnDestroy = () => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    };
  }
}
