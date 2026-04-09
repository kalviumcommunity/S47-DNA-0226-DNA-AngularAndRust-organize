import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  // 1. Unprotected GET natively querying backend list configurations mapping filters correctly.
  getRecords(limit: number = 5, page: number = 1): Observable<PgDemoRecord[]> {
    return this.http.get<PgDemoRecord[]>(`${this.apiUrl}?limit=${limit}&page=${page}`);
  }

  // 2. Unprotected POST executing parameterized insertions seamlessly upstream.
  createRecord(name: string, role?: string): Observable<PgDemoRecord> {
    const payload = { name, role: role || 'user' };
    return this.http.post<PgDemoRecord>(this.apiUrl, payload);
  }

  // 3. SECURED DELETE operation proving Middleware Authentication hooks natively block empty headers!
  // We simulate valid vs invalid connections dynamically triggering `Authorization` headers.
  deleteRecord(id: number, token?: string): Observable<any> {
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}
