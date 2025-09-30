# Creating Reusable Components from Existing Material Components

This guide shows how to create custom, reusable components by wrapping existing Angular Material components like `mat-select`, `mat-input`, and `mat-autocomplete`. These wrapped components can be used with `formControlName`, maintain all Material Design features, and work seamlessly within `mat-form-field`.

## Basic Component Wrapping

### Wrapping mat-select with Predefined Options

A common use case is creating a select component with predefined options that can be reused throughout your application.

```typescript
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-permission-select',
  template: `
    <mat-select 
      [value]="value" 
      [placeholder]="placeholder"
      [disabled]="disabled"
      (selectionChange)="onSelectionChange($event)">
      <mat-option value="read">Read Only</mat-option>
      <mat-option value="write">Read & Write</mat-option>
      <mat-option value="admin">Administrator</mat-option>
    </mat-select>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PermissionSelectComponent),
      multi: true
    }
  ]
})
export class PermissionSelectComponent implements ControlValueAccessor {
  @Input() placeholder = 'Select permission';
  @Input() disabled = false;

  value: string | null = null;
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
```

**Usage:**
```html
<!-- Standalone usage -->
<app-permission-select formControlName="userPermissions"></app-permission-select>

<!-- Within mat-form-field -->
<mat-form-field>
  <mat-label>User Permissions</mat-label>
  <app-permission-select formControlName="userPermissions"></app-permission-select>
  <mat-hint>Choose the appropriate permission level</mat-hint>
</mat-form-field>
```

### Wrapping mat-input with Custom Validation

Create a reusable input component with built-in validation and formatting:

```typescript
@Component({
  selector: 'app-phone-input',
  template: `
    <mat-input-container>
      <input 
        matInput 
        [value]="value || ''" 
        [placeholder]="placeholder"
        [disabled]="disabled"
        (input)="onInput($event)"
        (blur)="onBlur()"
        type="tel">
    </mat-input-container>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhoneInputComponent),
      multi: true
    }
  ]
})
export class PhoneInputComponent implements ControlValueAccessor {
  @Input() placeholder = 'Enter phone number';
  @Input() disabled = false;

  value: string | null = null;
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: any): void {
    this.value = this.formatPhoneNumber(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: any): void {
    const rawValue = event.target.value;
    this.value = this.formatPhoneNumber(rawValue);
    this.onChange(this.value);
  }

  onBlur(): void {
    this.onTouched();
  }

  private formatPhoneNumber(value: string): string {
    if (!value) return '';
    
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format as (XXX) XXX-XXXX
    if (digits.length >= 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
    
    return digits;
  }
}
```

## Advanced Patterns

### Async Data Loading with mat-autocomplete

Create a user picker component that loads data asynchronously:

```typescript
import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

export interface User {
  id: number;
  name: string;
  email: string;
}

@Component({
  selector: 'app-user-picker',
  template: `
    <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayUser">
      <mat-option *ngFor="let user of filteredUsers$ | async" [value]="user">
        <div class="user-option">
          <span class="user-name">{{ user.name }}</span>
          <span class="user-email">{{ user.email }}</span>
        </div>
      </mat-option>
    </mat-autocomplete>
    
    <input 
      matInput 
      [matAutocomplete]="auto"
      [value]="displayValue"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (input)="onInput($event)"
      (blur)="onBlur()">
  `,
  styles: [`
    .user-option {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-weight: 500;
    }
    .user-email {
      font-size: 0.8em;
      color: rgba(0, 0, 0, 0.6);
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UserPickerComponent),
      multi: true
    }
  ]
})
export class UserPickerComponent implements ControlValueAccessor, OnInit {
  @Input() placeholder = 'Search users...';
  @Input() disabled = false;

  value: User | null = null;
  displayValue = '';
  
  private searchTerms = new Subject<string>();
  filteredUsers$: Observable<User[]>;
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.filteredUsers$ = this.searchTerms.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => this.searchUsers(term))
    );
  }

  writeValue(value: User | null): void {
    this.value = value;
    this.displayValue = this.displayUser(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInput(event: any): void {
    const inputValue = event.target.value;
    this.displayValue = inputValue;
    this.searchTerms.next(inputValue);
    
    // If user is typing, clear the selected value
    if (this.value && inputValue !== this.displayUser(this.value)) {
      this.value = null;
      this.onChange(null);
    }
  }

  onBlur(): void {
    this.onTouched();
  }

  onOptionSelected(user: User): void {
    this.value = user;
    this.displayValue = this.displayUser(user);
    this.onChange(user);
  }

  displayUser(user: User | null): string {
    return user ? user.name : '';
  }

  private searchUsers(term: string): Observable<User[]> {
    if (!term.trim()) {
      return of([]);
    }
    return this.userService.searchUsers(term);
  }
}
```

**Usage:**
```html
<mat-form-field>
  <mat-label>Project Manager</mat-label>
  <app-user-picker formControlName="projectManager"></app-user-picker>
  <mat-error *ngIf="form.get('projectManager')?.hasError('required')">
    Project manager is required
  </mat-error>
</mat-form-field>
```

### Multi-Select with Custom Options

Create a multi-select component with custom styling and behavior:

```typescript
@Component({
  selector: 'app-tag-select',
  template: `
    <mat-select 
      multiple
      [value]="value || []"
      [placeholder]="placeholder"
      [disabled]="disabled"
      (selectionChange)="onSelectionChange($event)">
      <mat-option *ngFor="let tag of availableTags" [value]="tag.id">
        <mat-chip [style.background-color]="tag.color" class="tag-chip">
          {{ tag.name }}
        </mat-chip>
      </mat-option>
    </mat-select>
    
    <!-- Display selected tags -->
    <div class="selected-tags" *ngIf="value?.length">
      <mat-chip 
        *ngFor="let tagId of value" 
        [removable]="!disabled"
        (removed)="removeTag(tagId)"
        [style.background-color]="getTagColor(tagId)">
        {{ getTagName(tagId) }}
        <mat-icon matChipRemove *ngIf="!disabled">cancel</mat-icon>
      </mat-chip>
    </div>
  `,
  styles: [`
    .tag-chip {
      color: white;
      font-size: 0.8em;
    }
    .selected-tags {
      margin-top: 8px;
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagSelectComponent),
      multi: true
    }
  ]
})
export class TagSelectComponent implements ControlValueAccessor {
  @Input() placeholder = 'Select tags';
  @Input() disabled = false;
  @Input() availableTags: Tag[] = [];

  value: number[] | null = null;
  
  private onChange = (value: any) => {};
  private onTouched = () => {};

  writeValue(value: number[]): void {
    this.value = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onSelectionChange(event: any): void {
    this.value = event.value;
    this.onChange(this.value);
    this.onTouched();
  }

  removeTag(tagId: number): void {
    if (this.value) {
      this.value = this.value.filter(id => id !== tagId);
      this.onChange(this.value);
    }
  }

  getTagName(tagId: number): string {
    const tag = this.availableTags.find(t => t.id === tagId);
    return tag ? tag.name : '';
  }

  getTagColor(tagId: number): string {
    const tag = this.availableTags.find(t => t.id === tagId);
    return tag ? tag.color : '#ccc';
  }
}
```

## Best Practices

### 1. Always Implement ControlValueAccessor

For components to work with Angular forms, implement the `ControlValueAccessor` interface:

- `writeValue()`: Update component when form value changes
- `registerOnChange()`: Register callback for value changes
- `registerOnTouched()`: Register callback for touch events
- `setDisabledState()`: Handle disabled state

### 2. Handle Validation Properly

```typescript
// In your component
@Component({
  // ...
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => YourComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => YourComponent),
      multi: true
    }
  ]
})
export class YourComponent implements ControlValueAccessor, Validator {
  
  validate(control: AbstractControl): ValidationErrors | null {
    if (!this.value) {
      return { required: true };
    }
    
    // Custom validation logic
    if (this.value.length < 3) {
      return { minLength: { requiredLength: 3, actualLength: this.value.length } };
    }
    
    return null;
  }
}
```

### 3. Support All Material Form Field Features

Ensure your wrapped components work with:
- `mat-label`
- `mat-hint`
- `mat-error`
- `matPrefix` and `matSuffix`
- Floating labels
- Required indicators

### 4. Accessibility Considerations

```typescript
// Add proper ARIA attributes
@Component({
  template: `
    <mat-select 
      [attr.aria-label]="ariaLabel"
      [attr.aria-describedby]="ariaDescribedBy"
      [attr.aria-required]="required">
      <!-- options -->
    </mat-select>
  `
})
export class AccessibleSelectComponent {
  @Input() ariaLabel: string;
  @Input() ariaDescribedBy: string;
  @Input() required = false;
}
```

### 5. Testing Your Components

```typescript
describe('PermissionSelectComponent', () => {
  let component: PermissionSelectComponent;
  let fixture: ComponentFixture<PermissionSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PermissionSelectComponent],
      imports: [MatSelectModule, ReactiveFormsModule]
    });
    
    fixture = TestBed.createComponent(PermissionSelectComponent);
    component = fixture.componentInstance;
  });

  it('should work with reactive forms', () => {
    const form = new FormGroup({
      permission: new FormControl('read')
    });
    
    // Test form integration
    expect(component.value).toBe('read');
  });

  it('should emit changes', () => {
    spyOn(component, 'onChange');
    
    component.onSelectionChange({ value: 'admin' });
    
    expect(component.onChange).toHaveBeenCalledWith('admin');
  });
});
```

## Common Patterns Summary

| Pattern | Use Case | Key Implementation |
|---------|----------|-------------------|
| **Simple Wrapper** | Predefined options | Basic ControlValueAccessor |
| **Formatted Input** | Phone, currency, etc. | Custom formatting logic |
| **Async Data** | User pickers, search | Observable data streams |
| **Multi-Select** | Tags, categories | Array value handling |
| **Validation** | Custom rules | Validator interface |

## Working Examples

For complete working examples of these patterns, see:
- [Simple Permission Select](https://stackblitz.com/edit/angular-permission-select)
- [Async User Picker](https://stackblitz.com/edit/angular-user-picker)
- [Multi-Tag Select](https://stackblitz.com/edit/angular-tag-select)

These patterns allow you to create powerful, reusable components that maintain all the benefits of Angular Material while adding your custom business logic and styling.