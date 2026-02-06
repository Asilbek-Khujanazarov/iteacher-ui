import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChildren,
  QueryList,
  ViewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements AfterViewInit {
  @ViewChildren('featureItem') featureItems!: QueryList<ElementRef>;
  @ViewChild('carousel') carousel!: ElementRef;
  @ViewChild('carouselItems') carouselItems!: ElementRef;
  private currentSlide = 0;
  private slideInterval: any;

  ngAfterViewInit() {
    // Intersection Observer for feature items
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      { threshold: 0.1 },
    );

    this.featureItems.forEach((item) => {
      observer.observe(item.nativeElement);
    });

    // Carousel auto-slide
    this.startAutoSlide();
  }

  startAutoSlide() {
    const totalSlides = this.carouselItems.nativeElement.children.length;
    this.slideInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % totalSlides;
      const offset = -this.currentSlide * 100;
      this.carouselItems.nativeElement.style.transform = `translateX(${offset}%)`;
    }, 5000); // 5 seconds interval
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }
}
