import { Component, OnInit } from '@angular/core';

import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import {
  QuestionService,
  Question,
  Answer,
} from '../../../services/question.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-management-question',
  templateUrl: './management-question.component.html',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
})
export class ManagementQuestionComponent implements OnInit {
  questions: Question[] = [];
  totalQuestions: number = 0;
  currentPage: number = 1;
  pageSize: number = 50;
  loading = false;
  error: string | null = null;
  editingQuestionId: string | null = null;
  questionForm: FormGroup;
  imageUploading = false;
  questionImagePreview: SafeUrl | null = null;
  answerImagePreviews: (SafeUrl | null)[] = [];
  selectedImage: SafeUrl | null = null;
  showDeleteDialog: boolean = false;
  questionToDelete: string | null = null;

  constructor(
    private fb: FormBuilder,
    private questionService: QuestionService,
    private sanitizer: DomSanitizer,
  ) {
    this.questionForm = this.fb.group(
      {
        text: [''],
        image: [null],
        answers: this.fb.array(
          [],
          [
            Validators.required,
            this.minAnswersValidator(2),
            this.oneCorrectAnswerValidator(),
          ],
        ),
      },
      { validators: this.textOrImageValidator() },
    );
  }

  ngOnInit(): void {
    this.loadQuestions();
  }

  get answers(): FormArray {
    return this.questionForm.get('answers') as FormArray;
  }

  loadQuestions(): void {
    this.loading = true;
    this.error = null;
    this.questionService
      .getAllQuestions(this.currentPage, this.pageSize)
      .subscribe({
        next: (response: { questions: Question[]; total: number }) => {
          this.questions = response.questions;
          this.totalQuestions = response.total;
          this.loading = false;
        },
        error: (err: any) => {
          this.error = err.message;
          this.loading = false;
        },
      });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage = page;
      this.loadQuestions();
    }
  }

  getTotalPages(): number {
    return Math.ceil(this.totalQuestions / this.pageSize);
  }

  minAnswersValidator(min: number) {
    return (formArray: FormArray): { [key: string]: any } | null => {
      return formArray.length >= min ? null : { minAnswers: true };
    };
  }

  oneCorrectAnswerValidator() {
    return (formArray: FormArray): { [key: string]: any } | null => {
      const hasCorrect = formArray.controls.some(
        (control) => control.get('isCorrect')?.value,
      );
      return hasCorrect ? null : { oneCorrectAnswer: true };
    };
  }

  textOrImageValidator() {
    return (control: FormGroup): { [key: string]: any } | null => {
      const text = control.get('text')?.value;
      const image = control.get('image')?.value;
      return (text && text.trim()) || image ? null : { textOrImage: true };
    };
  }

  answerTextOrImageValidator() {
    return (control: FormGroup): { [key: string]: any } | null => {
      const text = control.get('text')?.value;
      const image = control.get('image')?.value;
      const imageUrl = control.get('imageUrl')?.value;
      return (text && text.trim()) || image || imageUrl
        ? null
        : { textOrImage: true };
    };
  }

  createAnswer(answer?: Answer): FormGroup {
    return this.fb.group(
      {
        text: [answer?.text || ''],
        image: [null],
        imageUrl: [answer?.imageUrl || ''],
        isCorrect: [answer?.isCorrect || false],
        correctDescription: [answer?.correctDescription || ''],
      },
      { validators: this.answerTextOrImageValidator() },
    );
  }

  addAnswer(answer?: Answer): void {
    if (this.answers.length < 6) {
      this.answers.push(this.createAnswer(answer));
      this.answerImagePreviews.push(
        answer?.imageUrl
          ? this.sanitizer.bypassSecurityTrustUrl(answer.imageUrl)
          : null,
      );
    } else {
      this.error = 'Maksimal 6 ta javob qo‘shish mumkin';
    }
  }

  removeAnswer(index: number): void {
    if (this.answers.length > 2) {
      this.answers.removeAt(index);
      this.answerImagePreviews.splice(index, 1);
    } else {
      this.error = 'Kamida 2 ta javob bo‘lishi kerak';
    }
  }

  editQuestion(question: Question): void {
    this.editingQuestionId = question.id;
    this.questionForm.reset();
    this.questionForm.patchValue({
      text: question.text || '',
      image: null,
    });
    this.questionImagePreview = question.imageUrl
      ? this.sanitizer.bypassSecurityTrustUrl(question.imageUrl)
      : null;
    this.answerImagePreviews = [];
    this.answers.clear();
    question.answers.forEach((answer) => {
      this.addAnswer(answer);
    });
  }

  cancelEdit(): void {
    this.editingQuestionId = null;
    this.questionForm.reset();
    this.questionImagePreview = null;
    this.answerImagePreviews = [];
    this.answers.clear();
    this.error = null;
    this.selectedImage = null;
  }

  onImageChange(
    event: Event,
    type: 'question' | 'answer',
    index?: number,
  ): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.match('image/jpeg|image/png')) {
        this.error = 'Faqat JPEG yoki PNG rasmlar yuklanishi mumkin';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'Fayl hajmi 5MB dan kichik bo‘lishi kerak';
        return;
      }
      this.imageUploading = true;
      if (type === 'question') {
        this.questionForm.patchValue({ image: file });
        this.questionImagePreview = this.sanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(file),
        );
      } else if (type === 'answer' && index !== undefined) {
        this.answers.at(index).patchValue({ image: file, imageUrl: '' });
        this.answerImagePreviews[index] = this.sanitizer.bypassSecurityTrustUrl(
          URL.createObjectURL(file),
        );
      }
      this.imageUploading = false;
    }
  }

  openImage(image: string | SafeUrl | null): void {
    if (image) {
      this.selectedImage =
        typeof image === 'string'
          ? this.sanitizer.bypassSecurityTrustUrl(image)
          : image;
    }
  }

  closeImage(): void {
    this.selectedImage = null;
  }

  removeImage(type: 'question' | 'answer', index?: number): void {
    if (type === 'question') {
      this.questionForm.patchValue({ image: null });
      this.questionImagePreview = null;
    } else if (type === 'answer' && index !== undefined) {
      this.answers.at(index).patchValue({ image: null, imageUrl: '' });
      this.answerImagePreviews[index] = null;
    }
  }

  setCorrectAnswer(index: number): void {
    this.answers.controls.forEach((control, i) => {
      control.patchValue({ isCorrect: i === index });
      if (i !== index) {
        control.patchValue({ correctDescription: '' });
      }
    });
  }

  onSubmit(): void {
    if (this.questionForm.invalid) {
      this.error = this.getFormValidationErrors();
      return;
    }

    const formData = new FormData();
    formData.append('Text', this.questionForm.get('text')?.value || '');

    const questionImage = this.questionForm.get('image')?.value;
    if (questionImage) {
      formData.append('Image', questionImage);
    }

    const answers = this.questionForm.get('answers')?.value;
    answers.forEach((answer: any, index: number) => {
      formData.append(`Answers[${index}].Text`, answer.text || '');
      if (answer.image) {
        formData.append(`Answers[${index}].Image`, answer.image);
      } else if (answer.imageUrl) {
        formData.append(`Answers[${index}].ImageUrl`, answer.imageUrl);
      }
      formData.append(
        `Answers[${index}].IsCorrect`,
        answer.isCorrect.toString(),
      );
      if (answer.isCorrect && answer.correctDescription) {
        formData.append(
          `Answers[${index}].CorrectDescription`,
          answer.correctDescription,
        );
      }
    });

    this.loading = true;
    const request = this.editingQuestionId
      ? this.questionService.updateQuestion(this.editingQuestionId, formData)
      : this.questionService.createQuestion(formData);

    request.subscribe({
      next: () => {
        this.loading = false;
        this.cancelEdit();
        this.loadQuestions();
      },
      error: (err: any) => {
        this.loading = false;
        this.error = err.message;
      },
      complete: () => {
        // Ixtiyoriy complete callback
      },
    });
  }

  openDeleteDialog(id: string): void {
    this.questionToDelete = id;
    this.showDeleteDialog = true;
  }

  confirmDelete(): void {
    if (this.questionToDelete) {
      this.loading = true;
      this.questionService.deleteQuestion(this.questionToDelete).subscribe({
        next: () => {
          this.loading = false;
          this.showDeleteDialog = false;
          this.questionToDelete = null;
          this.loadQuestions();
        },
        error: (err: any) => {
          this.loading = false;
          this.error = err.message;
          this.showDeleteDialog = false;
          this.questionToDelete = null;
        },
        complete: () => {
          // Ixtiyoriy complete callback
        },
      });
    }
  }

  cancelDelete(): void {
    this.showDeleteDialog = false;
    this.questionToDelete = null;
  }

  getLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  private getFormValidationErrors(): string {
    if (this.questionForm.errors?.['textOrImage']) {
      return 'Savolda matn yoki rasm bo‘lishi shart';
    }
    if (this.answers.errors?.['minAnswers']) {
      return 'Kamida 2 ta javob bo‘lishi kerak';
    }
    if (this.answers.errors?.['oneCorrectAnswer']) {
      return 'Kamida bitta to‘g‘ri javob tanlanishi kerak';
    }
    if (
      this.answers.controls.some((control) => control.errors?.['textOrImage'])
    ) {
      return 'Har bir javobda matn yoki rasm bo‘lishi shart';
    }
    return 'Forma to‘ldirishda xatolik yuz berdi';
  }
}
