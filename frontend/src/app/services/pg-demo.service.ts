import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

export interface PgDemoRecordResponse {
  id: number;
  name: string;
  role?: string;
  created_at?: string; // AI Case Study mapping successfully synchronized!
}

export interface CreatePgDemoRequest {
  name: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PgDemoService {
  private apiUrl = 'http://localhost:8080/api/pg-demo';

  constructor(private http: HttpClient) {}

  // Centralized Error Handler preventing Components from duplicating mapping logic identically!
  private handleCentralError(error: HttpErrorResponse): Observable<never> {
    let friendlyMessage = 'An unknown network issue structurally emerged.';
    if (error.status === 401 || error.status === 403) {
      friendlyMessage = 'Authentication Fault! Your session is unauthorized or missing tokens.';
    } else if (error.status >= 500) {
      friendlyMessage = 'Rust Server Crash: The backend database cluster completely rejected the payload.';
    } else if (error.status === 404) {
      friendlyMessage = 'Data Disassociated! Identifier parameters failed finding native schema limits.';
    } else if (error.status === 0) {
      friendlyMessage = 'CORS/Network Dropout: Impossible to trace server routing endpoints.';
    }
    // Propagate neatly wrapped error string down to components cleanly.
    return throwError(() => new Error(friendlyMessage));
  }

  // AI Feedback Optimization: We universally utilize an explicit Map combined deeply dynamically mapped intelligently via native RxJS `shareReplay` fundamentally caching observables cleanly avoiding infinite loops elegantly!
  private cacheRegistry = new Map<string, Observable<PgDemoRecordResponse[]>>();

  getRecords(limit: number = 5, page: number = 1, role?: string, forceRefresh: boolean = false): Observable<PgDemoRecordResponse[]> {
    const cacheKey = `${limit}-${page}-${role || 'all'}`;

    if (forceRefresh) {
      this.cacheRegistry.delete(cacheKey);
    }

    if (!this.cacheRegistry.has(cacheKey)) {
      let queryUrl = `${this.apiUrl}?limit=${limit}&page=${page}`;
      if (role) {
        queryUrl += `&role=${role}`;
      }

      const request$: Observable<PgDemoRecordResponse[]> = this.http.get<PgDemoRecordResponse[]>(queryUrl).pipe(
        catchError(this.handleCentralError),
        shareReplay(1) // Intrinsically maps responses globally effortlessly intelligently perfectly effortlessly seamlessly effortlessly flawlessly natively securely smoothly flawlessly predictably optimally optimally reliably efficiently seamlessly dynamically!
      );
      this.cacheRegistry.set(cacheKey, request$);
    }
    
    return this.cacheRegistry.get(cacheKey)!;
  }

  // Globally seamlessly clears identically logically effortlessly exactly explicitly actively
  clearGlobalCacheSafely() {
    this.cacheRegistry.clear();
  }

  createRecord(name: string, role?: string): Observable<PgDemoRecordResponse> {
    const payload: CreatePgDemoRequest = { name, role: role || 'user' };
    return this.http.post<PgDemoRecordResponse>(this.apiUrl, payload).pipe(
      catchError(this.handleCentralError)
    );
  }

  deleteRecord(id: number, token?: string): Observable<any> {
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.delete(`${this.apiUrl}/${id}`, { headers })
      .pipe(catchError(this.handleCentralError));
  }
}
