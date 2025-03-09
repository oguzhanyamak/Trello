import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-inline-form',
  standalone: false,
  templateUrl: './inline-form.component.html',
  styleUrl: './inline-form.component.scss'
})
// InlineFormComponent sınıfı, dinamik bir formu ve onun etkileşimli özelliklerini yönetir.
export class InlineFormComponent {

  // FormGroup, formun tüm kontrol bileşenlerini tutan Angular Reactive Form yapılandırmasıdır.
  form: FormGroup;

  // @Input özellikleri, dışarıdan bu bileşene veri aktarılmasını sağlar.
  @Input() title: string = ''; // Form başlığını temsil eder.
  @Input() defaultText: string = 'Not defined'; // Varsayılan metin, başlık olmadığı durumda kullanılacak.
  @Input() hasButton: boolean = false; // Formda bir buton olup olmadığını belirler.
  @Input() buttonText: string = 'Submit'; // Butonun metnini belirler.
  @Input() inputPlaceholder: string = ''; // Input alanının placeholder metnini belirler.
  @Input() inputType: string = 'input'; // Input tipi (örneğin 'text' veya 'number' olabilir).

  // @Output, bileşenin üst bileşenine veri göndermek için kullanılır. Bu durumda formun gönderilmesiyle tetiklenir.
  @Output() handleSubmit = new EventEmitter<string>();

  // isEditing, formun düzenleme modunda olup olmadığını takip eder.
  isEditing: boolean = false;

  // Constructor, FormBuilder servisini enjekte eder ve formu oluşturur.
  constructor(private fb: FormBuilder) {
    // FormGroup, formun kontrolünü ve doğrulamasını yönetmek için kullanılır.
    this.form = this.fb.group({ title: [''] });
  }

  // activeEditing, formu düzenleme moduna geçirir. 
  // Başlık varsa, formu başlıkla günceller.
  activeEditing(): void {
    if (this.title) {
      // title, Input'tan gelen başlık değeriyle formu günceller.
      this.form.patchValue({ title: this.title });
    }
    // Düzenleme modunu aktif hale getirir.
    this.isEditing = true;
  }

  // onSubmit, form gönderildiğinde çağrılır.
  // Eğer başlık değeri varsa, handleSubmit eventi tetiklenir ve formdaki başlık üst bileşene gönderilir.
  onSubmit(): void {
    if (this.form.value.title) {
      // handleSubmit eventi, formdaki başlık değerini üst bileşene iletir.
      this.handleSubmit.emit(this.form.value.title as string);
    }
    // Düzenleme modunu kapatır.
    this.isEditing = false;
    // Formu sıfırlar.
    this.form.reset();
  }
}

