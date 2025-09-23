import {
  AbstractControl,
  ValidationErrors,
  FormArray,
  FormGroup,
} from '@angular/forms';

export function bulkEmailValidator(
  control: AbstractControl
): ValidationErrors | null {
  const formArray = control.get('users') as FormArray;
  if (!formArray) return null;

  const emails: string[] = formArray.controls.map(
    (c) => c.get('email')?.value?.toLowerCase() || ''
  );

  const duplicates = emails.filter(
    (email, index) => emails.indexOf(email) !== index && email
  );

  formArray.controls.forEach((group: AbstractControl) => {
    const emailControl = (group as FormGroup).get('email');
    if (!emailControl) return;

    const email = emailControl.value?.toLowerCase() || '';
    const errors: ValidationErrors = { ...emailControl.errors };

    if (errors['duplicateInBatch']) {
      delete errors['duplicateInBatch'];
    }

    if (duplicates.includes(email)) {
      errors['duplicateInBatch'] = true;
    }

    emailControl.setErrors(Object.keys(errors).length ? errors : null);
  });

  return null;
}
