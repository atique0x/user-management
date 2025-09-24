import {
  AbstractControl,
  ValidationErrors,
  FormArray,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';

export function bulkEmailValidator(currentEmails: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formArray = control.get('users') as FormArray;
    if (!formArray) return null;

    const pageEmails = currentEmails
      .map((email) => email.toLowerCase())
      .filter((email) => email);

    const emails: string[] = formArray.controls.map(
      (c) => c.get('email')?.value?.toLowerCase() || ''
    );

    const users = JSON.parse(localStorage.getItem('users') || '[]') as {
      email: string;
    }[];

    const storedEmails = users
      .map((user) => user.email.toLowerCase())
      .filter((e) => !pageEmails.includes(e));

    const duplicatesInForm = emails.filter(
      (email, index) => emails.indexOf(email) !== index && email
    );

    formArray.controls.forEach((group: AbstractControl) => {
      const emailControl = (group as FormGroup).get('email');
      if (!emailControl) return;

      const email = emailControl.value?.toLowerCase() || '';
      const errors: ValidationErrors = { ...emailControl.errors };

      delete errors['duplicateInBatch'];

      if (duplicatesInForm.includes(email) || storedEmails.includes(email)) {
        errors['duplicateInBatch'] = true;
      }

      emailControl.setErrors(Object.keys(errors).length ? errors : null);
    });

    return null;
  };
}
