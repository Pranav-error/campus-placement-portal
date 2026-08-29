import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface RecordPlacementDialogData {
  studentName: string;
  jobTitle: string;
}

export interface RecordPlacementResult {
  packageLpa?: number;
  offerDate: string;
}

@Component({
  selector: 'app-record-placement-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>Record Placement</h2>
    <mat-dialog-content [formGroup]="form" class="dialog-content">
      <p class="subtitle">{{ data.studentName }} — {{ data.jobTitle }}</p>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Package (LPA)</mat-label>
        <input matInput type="number" step="0.1" formControlName="packageLpa" />
      </mat-form-field>
      <mat-form-field appearance="outline" class="full-width">
        <mat-label>Offer Date</mat-label>
        <input matInput type="date" formControlName="offerDate" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close(null)">Cancel</button>
      <button mat-flat-button color="primary" (click)="submit()">Record</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content { display: flex; flex-direction: column; gap: 0.25rem; min-width: 320px; }
    .full-width { width: 100%; }
    .subtitle { color: rgba(0,0,0,0.6); margin: 0 0 0.5rem; font-size: 0.9rem; }
  `],
})
export class RecordPlacementDialogComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    packageLpa: [null as number | null],
    offerDate: [new Date().toISOString().slice(0, 10)],
  });

  constructor(
    public dialogRef: MatDialogRef<RecordPlacementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RecordPlacementDialogData
  ) {}

  submit(): void {
    const raw = this.form.getRawValue();
    const result: RecordPlacementResult = {
      packageLpa: raw.packageLpa ?? undefined,
      offerDate: raw.offerDate,
    };
    this.dialogRef.close(result);
  }
}
