import { AbstractControl, ValidationErrors } from '@angular/forms';
import { UserInterface } from '../types/user.interface';

export function emailExistValidator(originalEmail: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value?.toLowerCase();
    if (!value || value === originalEmail.toLowerCase()) return null;

    const users = JSON.parse(
      localStorage.getItem('users') || '[]'
    ) as UserInterface[];
    const emails = users.map((u) => u.email.toLowerCase());

    return emails.includes(value) ? { emailTaken: true } : null;
  };
}
