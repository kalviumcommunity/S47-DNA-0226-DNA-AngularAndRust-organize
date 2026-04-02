import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {
  LoginRequest, RegisterTenantRequest, AuthResponse, UserInfo,
  CreateUserRequest, User, WorkflowDefinition, WorkflowRequest,
  ApprovalPayload, AuditLog, CreateWorkflowRequest
} from '../models/api.models';

const API = 'http://localhost:8080/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private tokenKey = 'wf_token';
  private userKey = 'wf_user';

  currentUser = signal<UserInfo | null>(this.loadUser());
  isAuthenticated = computed(() => !!this.currentUser());
  userRole = computed(() => this.currentUser()?.role ?? null);

  constructor(private http: HttpClient, private router: Router) {}

  // ── Auth ──

  registerTenant(data: RegisterTenantRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/register-tenant`, data).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API}/auth/login`, data).pipe(
      tap(res => this.saveAuth(res))
    );
  }

  createUser(data: CreateUserRequest): Observable<any> {
    return this.http.post(`${API}/auth/create-user`, data);
  }

  logout(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  // ── Users ──

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${API}/users`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${API}/users/${userId}/role`, { role });
  }

  // ── Workflows ──

  getWorkflows(): Observable<WorkflowDefinition[]> {
    return this.http.get<WorkflowDefinition[]>(`${API}/workflows`);
  }

  createWorkflow(data: CreateWorkflowRequest): Observable<any> {
    return this.http.post(`${API}/workflows`, data);
  }

  // ── Requests ──

  getRequests(): Observable<WorkflowRequest[]> {
    return this.http.get<WorkflowRequest[]>(`${API}/requests`);
  }

  getPendingApprovals(): Observable<WorkflowRequest[]> {
    return this.http.get<WorkflowRequest[]>(`${API}/requests/pending`);
  }

  submitRequest(data: { workflow_id: string; title: string; description?: string }): Observable<any> {
    return this.http.post(`${API}/requests`, data);
  }

  decideRequest(requestId: string, payload: ApprovalPayload): Observable<any> {
    return this.http.post(`${API}/requests/${requestId}/decide`, payload);
  }

  // ── Audit ──

  getAuditLogs(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${API}/audit-logs`);
  }

  // ── Helpers ──

  private saveAuth(res: AuthResponse): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, res.token);
      localStorage.setItem(this.userKey, JSON.stringify(res.user));
    }
    this.currentUser.set(res.user);
  }

  private loadUser(): UserInfo | null {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(this.userKey);
      if (raw) {
        try { return JSON.parse(raw); } catch { return null; }
      }
    }
    return null;
  }
}
