import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PgDemoService, PgDemoRecord } from '../../services/pg-demo.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-pg-demo',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <h2 class="text-2xl font-bold mb-4">Postgres Database Integrations</h2>

      <div class="mb-6 p-4 bg-white rounded shadow border-l-4 border-blue-500">
        <h3 class="font-semibold text-lg">Backend Status Code</h3>
        
        <!-- Native Dynamic Output Rendering securely mapping HTTP responses vividly -->
        <div [ngClass]="{'border-red-500 border-l-4 bg-red-50': isError, 'bg-gray-100': !isError}" class="mt-2 p-3 rounded break-words transition-all duration-300 flex items-center gap-3">
          <div *ngIf="isLoading" class="animate-spin h-5 w-5 border-4 border-blue-500 border-t-transparent rounded-full display-inline-block"></div>
          <span [class.text-red-700]="isError" class="text-gray-700 font-medium">
            {{ lastResponseMessage }}
          </span>
        </div>
      </div>

      <div class="flex gap-4 mb-6 relative">
        <!-- Disabled Attributes flawlessly protecting UX from duplicate network hits! -->
        <button (click)="fetchRecords()" [disabled]="isLoading" class="bg-blue-600 text-white px-4 py-2 rounded transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ isLoading ? 'Loading...' : 'Refresh Records' }}
        </button>
        <button (click)="createDemoRecord()" [disabled]="isLoading" class="bg-green-600 text-white px-4 py-2 rounded transition hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
          Create Random Record
        </button>
      </div>

      <div class="grid gap-3 opacity-100 transition-opacity" [class.opacity-50]="isLoading">
        <div *ngFor="let record of records" class="p-4 bg-white border border-gray-200 shadow-sm flex justify-between items-center rounded">
          <div>
            <p class="font-bold text-gray-800">ID: {{ record.id }} | {{ record.name }}</p>
            <p class="text-sm text-gray-500 font-mono">Role: {{ record.role }}</p>
          </div>
          <div class="flex gap-2 relative">
            <button (click)="deleteSecurely(record.id, '')" [disabled]="isLoading" class="bg-gray-400 text-white px-3 py-1 text-sm rounded hover:bg-red-500 disabled:opacity-50">Public Delete (Fails 401)</button>
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
  isLoading: boolean = false; // Primary Loading Tracker Array strictly securing duplicate pushes

  constructor(private pgService: PgDemoService) {}

  ngOnInit(): void {
    this.fetchRecords();
  }

  fetchRecords() {
    this.executeLoadingState('Fetching postgres mapping streams legitimately...');
    this.pgService.getRecords().pipe(
      finalize(() => this.isLoading = false) // Flawlessly drops loading token universally terminating the state unconditionally.
    ).subscribe({
      next: (data) => {
        this.records = data;
        this.logMessage(`Successfully fetched ${data.length} records dynamically mapping from Rust API!`, false);
      },
      error: (err: HttpErrorResponse) => this.safelyHandleError(err)
    });
  }

  createDemoRecord() {
    const names = ['Darshan', 'Admin', 'User', 'Guest'];
    const randomName = names[Math.floor(Math.random() * names.length)] + '-' + Math.floor(Math.random() * 100);
    
    this.executeLoadingState(`Creating user ${randomName} dynamically targeting Rust servers...`);
    this.pgService.createRecord(randomName, 'guest').pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (req) => {
        this.logMessage(`Created record perfectly scaling ID ${req.id} dynamically!`, false);
        this.fetchRecords(); 
      },
      error: (err: HttpErrorResponse) => this.safelyHandleError(err)
    });
  }

  deleteSecurely(id: number, token: string) {
    this.executeLoadingState(`Attempting deletion utilizing explicit token authorization wrappers...`);
    this.pgService.deleteRecord(id, token).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.logMessage(`Successfully removed Record ID ${id}!`, false);
        this.fetchRecords();
      },
      error: (err: HttpErrorResponse) => this.safelyHandleError(err)
    });
  }

  // Heavy lifting error parsing safely returning isolated text messages mitigating native user confusion dynamically.
  private safelyHandleError(err: HttpErrorResponse) {
    let friendlyMessage = 'An unknown network issue structurally emerged.';
    
    // Explicit condition matching
    if (err.status === 401 || err.status === 403) {
      friendlyMessage = 'Authentication Fault! Your session is unauthorized or explicitly missing valid securely injected Tokens.';
    } else if (err.status >= 500) {
      friendlyMessage = 'Rust Server Crash: The backend database cluster completely rejected the network payload.';
    } else if (err.status === 404) {
      friendlyMessage = 'Data Disassociated! The specified identifier parameters uniquely failed finding native schema limits.';
    } else if (err.status === 0) {
      friendlyMessage = 'CORS/Network Dropout: Impossible to trace server routing endpoints completely disconnected.';
    }
    
    this.logMessage(`[HTTP ${err.status}] ${friendlyMessage}`, true);
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
