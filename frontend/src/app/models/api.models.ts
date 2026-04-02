export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterTenantRequest {
  tenant_name: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'employee';
}

export interface AuthResponse {
  token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  tenantId: string;
  tenantName: string;
}

export interface User {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface WorkflowDefinition {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  created_at: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  workflow_id: string;
  step_order: number;
  role_required: string;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  steps: { step_order: number; role_required: string }[];
}

export interface WorkflowRequest {
  id: string;
  tenantId: string;
  workflowId: string;
  workflowName: string;
  createdBy: string;
  creatorName: string;
  title: string;
  description?: string;
  currentStep: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalPayload {
  decision: 'approved' | 'rejected';
  comment?: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_status?: string;
  new_status?: string;
  details?: string;
  created_at: string;
}
