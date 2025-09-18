import { AbstractControl, ValidationErrors } from '@angular/forms';
import { User } from '../types/user.interface';

export function emailExistValidator(
  control: AbstractControl
): ValidationErrors | null {
  const users = JSON.parse(localStorage.getItem('users') || '[]') as User[];
  const emails = users.map((u) => u.email.toLowerCase());

  const value = control.value?.toLowerCase();
  if (!value) return null;

  return emails.includes(value) ? { emailTaken: true } : null;
}
