import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  EventEmitter,
  Output,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';

import { UserInterface } from 'src/app/types/user.interface';
import { UserRoleEnum } from 'src/app/types/user-role.enum';
import {
  AdditionalFormDataInterFace,
  UserFromDataInterface,
} from 'src/app/types/form-data.interface';
import { emailExistValidator } from 'src/app/validators/email-exist-validator';
import { bulkEmailValidator } from 'src/app/validators/bulk-email-validator';

@Component({
  selector: 'app-users-display-table',
  templateUrl: './users-display-table.component.html',
  styleUrls: ['./users-display-table.component.css'],
})
export class UsersDisplayTableComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() users: UserInterface[] = [];
  @Input() currentPage: number = 1;
  @Input() itemsPerPage: number = 10;

  @Output() userDeleted = new EventEmitter<string>();
  @Output() userToggleStatus = new EventEmitter<string>();
  @Output() userUpdated = new EventEmitter<string>();
  @Output() userBulkFieldUpdate = new EventEmitter<{
    id: string;
    updatedData: Partial<UserInterface>;
  }>();

  editAll = false;
  editingRowIndex: boolean[] = [];
  editingFields: { [row: number]: (keyof UserInterface)[] } = {};

  usersForm!: FormGroup<{ users: FormArray<FormGroup<UserFromDataInterface>> }>;
  roles = Object.values(UserRoleEnum);

  addColumn: boolean[] = [];
  addColumnForm: FormGroup<AdditionalFormDataInterFace>[] = [];

  private destroy$ = new Subject<void>();

  constructor() {}

  ngOnInit(): void {
    this.setupUsersForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users'] && !changes['users'].firstChange) {
      this.setupUsersForm();
      this.editingRowIndex = [];
      this.editingFields = {};
    }
  }

  //----------- User Actions ------------
  onUpdateUser(id?: string) {
    if (!id) return;
    this.userUpdated.emit(id);
  }

  onToggleStatus(id?: string) {
    if (!id) return;
    this.userToggleStatus.emit(id);
  }

  onDeleteUser(id?: string) {
    if (!id) return;
    this.userDeleted.emit(id);
  }

  /**
   * Enables inline editing mode for a specific table row
   */
  onEditRow(row: number) {
    this.editAll = false;
    this.editingRowIndex[row] = true;
    this.editingFields[row] = [];
  }

  /**
   * Saves changes made to a specific row and updates the backend
   * 1. Retrieves the FormGroup for the specified row
   * 2. Gets updated data by comparing against original values, emits update event with modified fields
   */
  onSaveRow(row: number) {
    const rowGroup = this.userFormArray.at(row);
    const updatedData = this.getUpdatedData(rowGroup);
    if (updatedData)
      this.userBulkFieldUpdate.emit({ id: updatedData.id!, updatedData });
    this.editingRowIndex[row] = false;
  }

  /**
   * Cancels editing and reverts any changes made to a row
   * 1. Retrieves the FormGroup for the specified row
   * 2. Reverts any dirty form controls to their original values
   */
  onCancelRow(row: number) {
    const rowGroup = this.userFormArray.at(row);
    this.dirtyCancel(rowGroup, row);
    this.editingRowIndex[row] = false;
  }

  /**
   * Enables bulk editing mode for all table rows
   * Sets up bulk email validation for all rows
   */
  onEditAll() {
    this.editAll = true;
    this.editingRowIndex = [];
    this.editingFields = {};
    this.setValidatorForBulkUpdate();
  }

  /**
   * Saves all modified rows in bulk edit mode
   * 1. Iterates through all form groups in the form array
   * 2. For each modified row:
   *    - Collects updated field values
   *    - Emits update event with changes
   *    - Restores original validators
   * 3. Clears bulk validation rules
   */
  onSaveAll() {
    this.userFormArray.controls.forEach(
      (formGroup: FormGroup<UserFromDataInterface>, i) => {
        const updatedData = this.getUpdatedData(formGroup);
        if (updatedData)
          this.userBulkFieldUpdate.emit({ id: updatedData.id!, updatedData });
        this.setExisitngValidator(formGroup, i);
      }
    );
    this.editAll = false;
    this.usersForm.setValidators([]);
    this.usersForm.updateValueAndValidity();
  }

  /**
   * Cancels bulk edit mode and reverts all changes
   * 1. Iterates through all form groups
   * 2. For each row:
   *    - Reverts any modified fields to original values
   *    - Restores original validators
   * 3. Clears bulk validation rules
   */
  onCancelAll() {
    this.userFormArray.controls.forEach(
      (formGroup: FormGroup<UserFromDataInterface>, i) => {
        this.dirtyCancel(formGroup, i);
        this.setExisitngValidator(formGroup, i);
      }
    );
    this.editAll = false;
    this.usersForm.setValidators([]);
    this.usersForm.updateValueAndValidity();
  }

  /**
   * Enables edit mode for a specific field within a given row
   */
  onEditField(row: number, field: keyof UserInterface) {
    if (!this.editingFields[row]) this.editingFields[row] = [];
    if (!this.editingFields[row].includes(field))
      this.editingFields[row].push(field);
  }

  /**
   * Saves the updated value for a specific field in a given row
   * 1. Retrieves the FormGroup for the specified row
   * 2. Checks if the target field’s control is dirty (modified)
   *    - If yes, emits the updated data (id + changed field) to the parent component
   * 3. Removes the field from the editingFields list to exit edit mode
   */
  onSaveField(row: number, field: keyof UserInterface) {
    const formGroup = this.userFormArray.at(row);
    const fieldControl = formGroup.get(field);
    if (fieldControl?.dirty) {
      this.userBulkFieldUpdate.emit({
        id: formGroup.value.id!,
        updatedData: { [field]: fieldControl.value },
      });
    }
    const index = this.editingFields[row].indexOf(field);
    this.editingFields[row].splice(index, 1);
  }

  /**
   * Cancel editing for a specific field in a given row
   * 1. Removes the target field from the editingFields list (disables edit mode)
   * 2. Handles 'additional' field as a special case (skips restoration logic)
   * 3. Retrieves the corresponding FormControl for the field
   * 4. If the field was modified (dirty):
   *    - Restores the original value from the users array
   *    - Marks the control as pristine (unmodified)
   */
  onCancelField(row: number, field: keyof UserInterface) {
    if (this.editingFields[row]) {
      const index = this.editingFields[row].indexOf(field);
      if (index >= 0) this.editingFields[row].splice(index, 1);
    }

    if (field === 'additional') return;

    const formGroup = this.userFormArray.at(row);
    const control = formGroup.get(field);
    if (control?.dirty) {
      control.setValue(this.users[row][field]);
      control.markAsPristine();
    }
  }

  /**
   * Enable adding a new key-value column for a specific row
   * 1. Marks the row as currently adding a column (addColumn[row] = true)
   * 2. Initializes a new FormGroup for the key and value inputs with required validators
   * 3. Stores the form in addColumnForm at the specified row index
   */
  onAddColumn(row: number) {
    this.addColumn[row] = true;
    this.addColumnForm[row] = new FormGroup({
      key: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      value: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  /**
   * Save the new key-value column for a specific row
   * 1. Retrieves the temporary form for the row
   * 2. Retrieves the 'additional' FormArray for the user row
   * 3. Pushes a new FormGroup with the key-value into the FormArray
   * 4. Emits userBulkFieldUpdate with the updated additional fields, Resets addColumn[row] to false
   */
  onSaveColumn(row: number) {
    const tempForm = this.addColumnForm[row];
    if (tempForm.invalid) return;

    const newField = tempForm.value;
    const additionalFields = this.userFormArray
      .at(row)
      .get('additional') as FormArray;

    additionalFields.push(
      new FormGroup({
        key: new FormControl(newField.key, {
          nonNullable: true,
          validators: [Validators.required],
        }),
        value: new FormControl(newField.value, {
          nonNullable: true,
          validators: [Validators.required],
        }),
      })
    );

    this.userBulkFieldUpdate.emit({
      id: this.userFormArray.at(row).value.id!,
      updatedData: { additional: additionalFields.value },
    });
    this.addColumn[row] = false;
  }

  onCancelColumn(row: number) {
    this.addColumn[row] = false;
  }

  //------------- Remove additional data ------------
  removeAdditional(row: number, itemIndex: number) {
    const additionalFields = this.userFormArray
      .at(row)
      .get('additional') as FormArray;
    const userId = this.userFormArray.at(row).value.id!;

    if (itemIndex >= 0 && itemIndex < additionalFields.length) {
      additionalFields.removeAt(itemIndex);
      const updatedAdditional = additionalFields.value;
      this.userBulkFieldUpdate.emit({
        id: userId,
        updatedData: { additional: updatedAdditional },
      });
    }
  }

  private getUpdatedData(
    formGroup: FormGroup<UserFromDataInterface>
  ): Partial<UserInterface> | null {
    const formValue = formGroup.value;
    const updatedData: Partial<UserInterface> = { id: formValue.id! };
    Object.entries(formGroup.controls).forEach(([key, control]) => {
      if (control.dirty) {
        updatedData[key as keyof UserInterface] = control.value;
      }
    });
    return Object.keys(updatedData).length > 1 ? updatedData : null;
  }

  private setupUsersForm(): void {
    const userForms = this.createUserFormGroups();
    this.usersForm = new FormGroup({
      users: new FormArray(userForms),
    });
  }

  private createUserFormGroups(): FormGroup<UserFromDataInterface>[] {
    return this.users.map(
      (user) =>
        new FormGroup<UserFromDataInterface>({
          id: new FormControl(user.id, {
            nonNullable: true,
          }),
          name: new FormControl(user.name, {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(3)],
          }),
          email: new FormControl(user.email, {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.email,
              emailExistValidator(user.email),
            ],
          }),
          phone: new FormControl(user.phone, {
            nonNullable: true,
            validators: [
              Validators.required,
              Validators.pattern('^01[346789][0-9]{8}$'),
            ],
          }),
          dob: new FormControl(user.dob, {
            nonNullable: true,
            validators: [Validators.required],
          }),
          address: new FormControl(user.address, {
            nonNullable: true,
            validators: [Validators.required],
          }),
          role: new FormControl(user.role, {
            nonNullable: true,
            validators: [Validators.required],
          }),
          status: new FormControl(user.status, {
            nonNullable: true,
            validators: [Validators.required],
          }),
          additional: new FormArray(
            user.additional?.map(
              (item) =>
                new FormGroup({
                  key: new FormControl(item.key, {
                    nonNullable: true,
                    validators: [Validators.required],
                  }),
                  value: new FormControl(item.value, {
                    nonNullable: true,
                    validators: [Validators.required],
                  }),
                })
            ) || []
          ),
        })
    );
  }

  private dirtyCancel(
    formGroup: FormGroup<UserFromDataInterface>,
    index: number
  ) {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      if (control?.dirty) {
        control.setValue(this.users[index][key as keyof UserInterface]);
        control.markAsPristine();
      }
    });
  }

  private setValidatorForBulkUpdate() {
    this.userFormArray.controls.forEach(
      (formGroup: FormGroup<UserFromDataInterface>) => {
        const emailControl = formGroup.get('email');
        emailControl?.setValidators([Validators.required, Validators.email]);
        emailControl?.updateValueAndValidity();
      }
    );
    this.usersForm.setValidators(bulkEmailValidator(this.userEmail));
    this.usersForm.updateValueAndValidity();
  }

  private setExisitngValidator(formGroup: FormGroup, index: number) {
    const emailControl = formGroup.get('email');
    emailControl?.setValidators([
      Validators.required,
      Validators.email,
      emailExistValidator(this.users[index].email),
    ]);
    emailControl?.updateValueAndValidity();
  }

  get userFormArray(): FormArray<FormGroup<UserFromDataInterface>> {
    return this.usersForm.get('users') as FormArray<
      FormGroup<UserFromDataInterface>
    >;
  }

  get userEmail() {
    return this.users.map((user) => user.email);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
