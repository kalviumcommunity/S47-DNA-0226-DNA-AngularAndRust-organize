import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PgDemoService, PgDemoRecord } from '../../services/pg-demo.service';
import { HttpClientModule, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-pg-demo',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  template: `
    <div class="p-6 bg-gray-50 min-h-screen">
      <h2 class="text-2xl font-bold mb-4">Postgres Database Integrations</h2>

      <div class="mb-6 p-4 bg-white rounded shadow border-l-4 border-blue-500">
        <h3 class="font-semibold text-lg">Backend Status Code</h3>
        <p [class.text-red-500]="isError" class="text-gray-700 mt-2 p-2 bg-gray-100 rounded break-words">
          {{ lastResponseMessage }}
        </p>
      </div>

      <div class="flex gap-4 mb-6">
        <button (click)="fetchRecords()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Refresh Records</button>
        <button (click)="createDemoRecord()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Create Random Record</button>
      </div>

      <div class="grid gap-3">
        <div *ngFor="let record of records" class="p-4 bg-white border border-gray-200 shadow-sm flex justify-between items-center">
          <div>
            <p class="font-bold text-gray-800">ID: {{ record.id }} | {{ record.name }}</p>
            <p class="text-sm text-gray-500 font-mono">Role: {{ record.role }}</p>
          </div>
          <div class="flex gap-2">
            <!-- Unauthorized Deletion Attempt (No Token) -->
            <button (click)="deleteSecurely(record.id, '')" class="bg-gray-400 text-white px-3 py-1 text-sm rounded hover:bg-red-500">Public Delete (Fails 401)</button>
            <!-- Authorized Deletion Attempt (Simulated Token) -->
            <button (click)="deleteSecurely(record.id, 'simulated-valid-jwt')" class="bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-900">Secure Delete (Works)</button>
          </div>
        </div>

        <div *ngIf="records.length === 0" class="text-gray-500 italic p-4 text-center border-dashed border-2 border-gray-300">
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

  constructor(private pgService: PgDemoService) {}

  ngOnInit(): void {
    this.fetchRecords();
  }

  fetchRecords() {
    this.pgService.getRecords().subscribe({
      next: (data) => {
        this.records = data;
        this.logMessage(`Successfully fetched ${data.length} records mapping from Rust API!`, false);
      },
      error: (err: HttpErrorResponse) => {
        this.logMessage(`Failed GET mapping: ${err.status} - ${err.message}`, true);
      }
    });
  }

  createDemoRecord() {
    const names = ['Darshan', 'Admin', 'User', 'Guest'];
    const randomName = names[Math.floor(Math.random() * names.length)] + '-' + Math.floor(Math.random() * 100);
    
    this.pgService.createRecord(randomName, 'guest').subscribe({
      next: (req) => {
        this.logMessage(`Created record perfectly: ID ${req.id}`, false);
        this.fetchRecords(); // Refresh the native mappings securely
      },
      error: (err: HttpErrorResponse) => {
        this.logMessage(`Failed Creation block: ${err.status} - ${err.message}`, true);
      }
    });
  }

  deleteSecurely(id: number, token: string) {
    this.pgService.deleteRecord(id, token).subscribe({
      next: () => {
        this.logMessage(`Successfully removed Record ID ${id}!`, false);
        this.fetchRecords();
      },
      error: (err: HttpErrorResponse) => {
        // Natively catches the 401 Unauthorized securely reflecting Rust's protection algorithm cleanly!
        let msg = err.status === 401 ? '401 Unauthorized - Access Denied implicitly natively blocked by Axum Middleware!' : err.error?.error || err.message;
        this.logMessage(`[HTTP ${err.status}] Failure bounds: ${msg}`, true);
      }
    });
  }

  private logMessage(msg: string, error: boolean) {
    this.isError = error;
    this.lastResponseMessage = msg;
  }
}
