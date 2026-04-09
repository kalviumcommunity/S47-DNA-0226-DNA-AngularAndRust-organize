import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface PgDemoRecord {
  id: number;
  name: string;
  role: string;
  message?: string;
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

  getRecords(limit: number = 5, page: number = 1): Observable<PgDemoRecord[]> {
    return this.http.get<PgDemoRecord[]>(`${this.apiUrl}?limit=${limit}&page=${page}`)
      .pipe(catchError(this.handleCentralError));
  }

  createRecord(name: string, role?: string): Observable<PgDemoRecord> {
    const payload = { name, role: role || 'user' };
    return this.http.post<PgDemoRecord>(this.apiUrl, payload)
      .pipe(catchError(this.handleCentralError));
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
