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

import { UserInterface } from 'src/app/types/user.interface';
import { UserRoleEnum } from 'src/app/types/user-role.enum';
import {
  AdditionalFormDataInterFace,
  UserFromDataInterface,
} from 'src/app/types/form-data.interface';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { emailExistValidator } from 'src/app/validators/email-exist-validator';

@Component({
  selector: 'app-users-display-table',
  templateUrl: './users-display-table.component.html',
  styleUrls: ['./users-display-table.component.css'],
})
export class UsersDisplayTableComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() users: UserInterface[] = [];
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

  currentPage = 1;
  itemsPerPage = 10;
  arr: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  private queryParamsSub?: Subscription;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.setupUsersForm();

    this.queryParamsSub = this.route.queryParams.subscribe((params: Params) => {
      const page = Number(params['page']);
      const limit = Number(params['limit']);

      this.currentPage = !isNaN(page) && page > 0 ? page : 1;
      this.itemsPerPage =
        !isNaN(limit) && limit > 0 ? limit : this.itemsPerPage;
    });

    this.userFormArray.controls.forEach((crtl) => {
      crtl.controls.email.valueChanges.subscribe((email) => console.log(email));
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users'] && !changes['users'].firstChange)
      this.setupUsersForm();
  }

  //--------------- User Actions ------------------
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

  // ---------------- Inline Edit ----------------
  onEditRow(row: number) {
    this.editAll = false;
    this.editingRowIndex[row] = true;
    if (this.editingFields[row]) this.editingFields[row] = [];
  }

  onSaveRow(row: number) {
    const rowGroup = this.userFormArray.at(row);
    const updatedData = this.getUpdatedData(rowGroup);
    if (updatedData)
      this.userBulkFieldUpdate.emit({ id: updatedData.id!, updatedData });
    this.editingRowIndex[row] = false;
  }

  onCancelRow(row: number) {
    const rowGroup = this.userFormArray.at(row);
    Object.keys(rowGroup.controls).forEach((key) => {
      const control = rowGroup.get(key);
      if (control?.dirty) {
        control.setValue(this.users[row][key as keyof UserInterface]);
        control.markAsPristine();
      }
    });
    this.editingRowIndex[row] = false;
  }

  //------------------ Bulk Edit ------------------
  onEditAll() {
    this.editAll = true;
    this.editingRowIndex = [];
    this.editingFields = {};
  }

  onSaveAll() {
    this.userFormArray.controls.forEach(
      (formGroup: FormGroup<UserFromDataInterface>) => {
        const updatedData = this.getUpdatedData(formGroup);
        if (updatedData)
          this.userBulkFieldUpdate.emit({ id: updatedData.id!, updatedData });
      }
    );
    this.editAll = false;
  }

  onCancelAll() {
    this.userFormArray.controls.forEach(
      (formGroup: FormGroup<UserFromDataInterface>, i) => {
        Object.keys(formGroup.controls).forEach((key) => {
          const control = formGroup.get(key);
          if (control?.dirty) {
            control.setValue(this.users[i][key as keyof UserInterface]);
            control.markAsPristine();
          }
        });
      }
    );
    this.editAll = false;
  }

  // ---------------- Field Edit ----------------
  onEditField(row: number, field: keyof UserInterface) {
    if (!this.editingFields[row]) this.editingFields[row] = [];
    if (!this.editingFields[row].includes(field))
      this.editingFields[row].push(field);
  }

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

  onCancelField(row: number, field: keyof UserInterface) {
    if (this.editingFields[row]) {
      const index = this.editingFields[row].indexOf(field);
      if (index >= 0) this.editingFields[row].splice(index, 1);
    }
    const formGroup = this.userFormArray.at(row);
    const control = formGroup.get(field);
    if (field === 'additional') {
    } else {
      if (control?.dirty) {
        control.setValue(this.users[row][field]);
        control.markAsPristine();
      }
    }
  }

  //-------------- Add new column --------------
  onAddColumn(row: number) {
    this.addColumn[row] = true;
    this.addColumnForm[row] = new FormGroup({
      key: new FormControl('', { nonNullable: true }),
      value: new FormControl('', { nonNullable: true }),
    });
  }

  onSaveColumn(row: number) {
    const tempForm = this.addColumnForm[row];
    if (!tempForm.valid) return;
    const newField = tempForm.value;
    const additionalFields = this.userFormArray
      .at(row)
      .get('additional') as FormArray;

    additionalFields.push(
      new FormGroup({
        key: new FormControl(newField.key, { nonNullable: true }),
        value: new FormControl(newField.value, { nonNullable: true }),
      })
    );
    const userId = this.userFormArray.at(row).value.id!;
    this.userBulkFieldUpdate.emit({
      id: userId,
      updatedData: { additional: additionalFields.value },
    });
    this.addColumn[row] = false;
  }

  onCancelColumn(row: number) {
    this.addColumn[row] = false;
  }

  //------------- Remove additional data ------------
  removeAdditional(row: number, itemIndex: number) {
    console.log(row, itemIndex);
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

  //--------------- Chunk Array Data ----------------
  chunkArray(
    arr: FormGroup<AdditionalFormDataInterFace>[] | undefined,
    chunckSize: number
  ): FormGroup<AdditionalFormDataInterFace>[][] | [] {
    if (!arr) return [];
    const newArr: FormGroup<AdditionalFormDataInterFace>[][] = [];
    for (let i = 0; i < arr.length; i += chunckSize) {
      newArr.push(arr.slice(i, i + chunckSize));
    }
    return newArr;
  }

  private getUpdatedData(
    formGroup: FormGroup<UserFromDataInterface>
  ): Partial<UserInterface> | null {
    const formValue = formGroup.value;
    console.log(formValue);
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
                  key: new FormControl(item.key, { nonNullable: true }),
                  value: new FormControl(item.value, { nonNullable: true }),
                })
            ) || []
          ),
        })
    );
  }

  getControl(item: FormGroup, field: string): FormControl {
    return item.get(field) as FormControl;
  }

  get userFormArray(): FormArray<FormGroup<UserFromDataInterface>> {
    return this.usersForm.get('users') as FormArray<
      FormGroup<UserFromDataInterface>
    >;
  }

  ngOnDestroy() {
    this.queryParamsSub?.unsubscribe();
  }
}
