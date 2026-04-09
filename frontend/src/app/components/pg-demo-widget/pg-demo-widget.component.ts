import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PgDemoService } from '../../services/pg-demo.service';

@Component({
  selector: 'app-pg-demo-widget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <h4 class="font-bold text-blue-800 flex items-center justify-between">
        Database Metrics Widget
        <span *ngIf="isLoading" class="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full display-inline-block"></span>
      </h4>
      <div class="mt-2 text-blue-900">
        <p *ngIf="!isLoading && !errorMsg" class="text-lg">Total Records: <span class="font-black">{{ recordCount }}</span></p>
        <p *ngIf="errorMsg" class="text-red-600 text-sm italic">{{ errorMsg }}</p>
        <button (click)="refresh()" [disabled]="isLoading" class="mt-3 bg-white text-blue-700 font-semibold px-3 py-1 rounded shadow hover:bg-blue-100 text-xs transition disabled:opacity-50">
          Sync Metrics
        </button>
      </div>
    </div>
  `
})
export class PgDemoWidgetComponent implements OnInit {
  recordCount: number = 0;
  isLoading: boolean = false;
  errorMsg: string | null = null;

  constructor(private pgService: PgDemoService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.isLoading = true;
    this.errorMsg = null;
    
    // Abstracted Service eliminates all HTTP status mappings natively!
    this.pgService.getRecords().subscribe({
      next: (data) => {
        this.recordCount = data.length;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.errorMsg = err.message; // Inherits pure centralized format natively!
        this.isLoading = false;
      }
    });
  }
}
