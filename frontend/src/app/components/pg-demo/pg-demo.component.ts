import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PgDemoService, PgDemoRecord } from '../../services/pg-demo.service';
import { HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { PgDemoWidgetComponent } from '../pg-demo-widget/pg-demo-widget.component';

@Component({
  selector: 'app-pg-demo',
  standalone: true,
  imports: [CommonModule, HttpClientModule, PgDemoWidgetComponent],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen grid gap-6">
      
      <div class="bg-white p-6 rounded shadow border-l-4 border-blue-500">
        <div class="flex justify-between items-start">
          <h2 class="text-2xl font-bold text-gray-800">Postgres Database Integrations</h2>
          <!-- SECOND COMPONENT RENDERED HERE NATIVELY EXECUTING IDENTICAL SERVICES SECURELY -->
          <div class="w-1/3 min-w-[250px]">
            <app-pg-demo-widget></app-pg-demo-widget>
          </div>
        </div>

        <div [ngClass]="{'border-red-500 border-l-4 bg-red-50': isError, 'bg-gray-100': !isError}" class="mt-4 p-3 rounded break-words transition-all duration-300 flex items-center gap-3">
          <div *ngIf="isLoading" class="animate-spin h-5 w-5 border-4 border-blue-500 border-t-transparent rounded-full display-inline-block"></div>
          <span [class.text-red-700]="isError" class="text-gray-700 font-medium">
            {{ lastResponseMessage }}
          </span>
        </div>
      </div>

      <div class="flex gap-4">
        <button (click)="fetchRecords()" [disabled]="isLoading" class="bg-blue-600 text-white px-4 py-2 rounded transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Loading...' : 'Refresh Arrays' }}
        </button>
        <button (click)="createDemoRecord()" [disabled]="isLoading" class="bg-green-600 text-white px-4 py-2 rounded transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          Create Random Entity
        </button>
      </div>

      <div class="grid gap-3 opacity-100 transition-opacity" [class.opacity-50]="isLoading">
        <div *ngFor="let record of records" class="p-4 bg-white border border-gray-200 shadow-sm flex justify-between items-center rounded">
          <div>
            <p class="font-bold text-gray-800">ID: {{ record.id }} | {{ record.name }}</p>
            <p class="text-sm text-gray-500 font-mono">Role: {{ record.role }}</p>
          </div>
          <div class="flex gap-2">
            <button (click)="deleteSecurely(record.id, '')" [disabled]="isLoading" class="bg-gray-400 text-white px-3 py-1 text-sm rounded hover:bg-red-500 disabled:opacity-50">Public Delete</button>
            <button (click)="deleteSecurely(record.id, 'simulated-valid-jwt')" [disabled]="isLoading" class="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-900 disabled:opacity-50">Secure Delete</button>
          </div>
        </div>

        <div *ngIf="records.length === 0 && !isLoading" class="text-gray-500 italic p-4 text-center border-dashed border-2 border-gray-300 rounded">
          No records found from Postgres.
        </div>
      </div>
    </div>
  `
})
export class PgDemoComponent implements OnInit {
  records: PgDemoRecord[] = [];
  lastResponseMessage: string = 'Waiting for interaction...';
  isError: boolean = false;
  isLoading: boolean = false;

  constructor(private pgService: PgDemoService) {}

  ngOnInit() {
    this.fetchRecords();
  }

  fetchRecords() {
    this.executeLoadingState('Fetching postgres arrays...');
    this.pgService.getRecords().pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        this.records = data;
        this.logMessage(`Successfully parsed ${data.length} records dynamically!`, false);
      },
      error: (err: Error) => this.logMessage(`Service Rejected: ${err.message}`, true) // Abstracted!
    });
  }

  createDemoRecord() {
    const randomName = 'User-' + Math.floor(Math.random() * 100);
    this.executeLoadingState('Creating user securely...');
    this.pgService.createRecord(randomName, 'guest').pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (req) => {
        this.logMessage(`Created record strictly: ID ${req.id}`, false);
        this.fetchRecords(); 
      },
      error: (err: Error) => this.logMessage(`Service Mapping Failed: ${err.message}`, true) // Abstracted!
    });
  }

  deleteSecurely(id: number, token: string) {
    this.executeLoadingState('Attempting deletion mapping securely...');
    this.pgService.deleteRecord(id, token).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.logMessage(`Successfully destructed Record ID ${id}!`, false);
        this.fetchRecords();
      },
      error: (err: Error) => this.logMessage(`Constraint Violation: ${err.message}`, true) // Abstracted!
    });
  }

  private executeLoadingState(message: string) {
    this.isLoading = true;
    this.isError = false;
    this.lastResponseMessage = message;
  }

  private logMessage(msg: string, isError: boolean) {
    this.isError = isError;
    this.lastResponseMessage = msg;
  }
}
