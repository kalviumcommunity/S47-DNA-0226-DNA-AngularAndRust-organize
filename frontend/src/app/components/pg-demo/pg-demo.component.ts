import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PgDemoService, PgDemoRecordResponse } from '../../services/pg-demo.service';
import { HttpClientModule } from '@angular/common/http';
import { finalize, debounceTime, throttleTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
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
        
        <!-- Live Search Field (Debounce Demonstration) -->
        <div class="mt-4">
          <label class="block text-sm font-medium text-gray-700">Live Role Filter (Debounced 500ms)</label>
          <input type="text" (input)="onSearchInput($event)" placeholder="Type a role (e.g., admin, user)..."
                 class="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
        </div>

        <div [ngClass]="{'border-red-500 border-l-4 bg-red-50': isError, 'bg-gray-100': !isError}" class="mt-4 p-3 rounded break-words transition-all duration-300 flex items-center gap-3">
          <div *ngIf="isLoading" class="animate-spin h-5 w-5 border-4 border-blue-500 border-t-transparent rounded-full display-inline-block"></div>
          <span [class.text-red-700]="isError" class="text-gray-700 font-medium">
            {{ lastResponseMessage }}
          </span>
        </div>
      </div>

      <div class="flex gap-4">
        <button (click)="fetchRecords(true)" [disabled]="isLoading" class="bg-blue-600 text-white px-4 py-2 rounded transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Loading...' : 'Refresh Arrays (Bypass Cache)' }}
        </button>
        <button (click)="throttleCreate()" [disabled]="isLoading" class="bg-green-600 text-white px-4 py-2 rounded transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          Spam-Proof Create (Throttled 2s)
        </button>
      </div>

      <div class="grid gap-3 opacity-100 transition-opacity" [class.opacity-50]="isLoading">
        <div *ngFor="let record of records" class="p-4 bg-white border border-gray-200 shadow-sm flex justify-between items-center rounded">
          <div>
            <p class="font-bold text-gray-800">ID: {{ record.id }} | {{ record.name }}</p>
            <p class="text-sm text-gray-500 font-mono">Role: {{ record.role }}</p>
            <p *ngIf="record.created_at" class="text-xs text-blue-400 mt-1">Created At: {{ record.created_at }}</p>
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
export class PgDemoComponent implements OnInit, OnDestroy {
  records: PgDemoRecordResponse[] = [];
  lastResponseMessage: string = 'Waiting for interaction...';
  isError: boolean = false;
  isLoading: boolean = false;

  // RxJS Subjects
  private searchSubject = new Subject<string>();
  private createSubject = new Subject<void>();
  private sub = new Subscription();
  private currentRole: string | undefined = undefined;

  constructor(private pgService: PgDemoService) {}

  ngOnInit() {
    // 1. Debounce logic!
    this.sub.add(
      this.searchSubject.pipe(
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe(searchTerm => {
        this.currentRole = searchTerm.trim() || undefined;
        this.fetchRecords(false);
      })
    );

    // 2. Throttle logic!
    this.sub.add(
      this.createSubject.pipe(
        throttleTime(2000)
      ).subscribe(() => {
        this.createDemoRecord();
      })
    );

    this.fetchRecords(false);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  onSearchInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.searchSubject.next(val);
  }

  throttleCreate() {
    this.createSubject.next();
  }

  fetchRecords(forceRefresh: boolean = false) {
    this.executeLoadingState(forceRefresh ? 'Bypassing cache natively to fetch fresh arrays...' : 'Attempting to map local cache securely...');
    this.pgService.getRecords(10, 1, this.currentRole, forceRefresh).pipe(
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
    const randomName = 'ThrottledUser-' + Math.floor(Math.random() * 100);
    this.executeLoadingState('Creating user securely...');
    this.pgService.createRecord(randomName, this.currentRole).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (req) => {
        this.logMessage(`Created record strictly: ID ${req.id}`, false);
        this.pgService.clearGlobalCacheSafely();
        this.fetchRecords(true); 
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
        this.pgService.clearGlobalCacheSafely();
        this.fetchRecords(true);
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
