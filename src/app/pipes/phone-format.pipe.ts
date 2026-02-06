import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'phoneFormat',
})
export class PhoneFormatPipe implements PipeTransform {
  transform(value: string | number): string {
    if (!value) return '';

    // faqat raqamlarni olish
    let phone = value.toString().replace(/\D/g, '');

    // +998 bilan boshlash
    if (!phone.startsWith('998')) {
      phone = '998' + phone;
    }

    // +998 XXXXXXXXX format
    const match = phone.match(/^(998)(\d{9})$/);

    if (match) {
      return `+${match[1]} ${match[2]}`; // bitta bo‘sh joy
    }

    return value.toString();
  }
}
