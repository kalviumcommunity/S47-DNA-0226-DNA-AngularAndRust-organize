/**
 * WorkflowRequest Interface
 *
 * Defines the shape of a WorkflowRequest entity used across the application.
 * This represents a request submitted by an employee within a department
 * (HR, Academics, Finance, Admin) for approval in the workflow system.
 *
 * TypeScript Features Demonstrated:
 * - Basic types: number, string, boolean
 * - Optional fields: approvedBy?, remarks?
 * - Union types for status (string literal union could be used)
 * - Interface as a contract for data shape
 */
export interface WorkflowRequest {
  id: number;
  title: string;
  department: string;           // e.g., "HR", "Academics", "Finance", "Admin"
  requestedBy: string;          // Name of the employee who submitted
  status: string;               // "Pending" | "Approved" | "Rejected"
  priority: string;             // "Low" | "Medium" | "High"
  createdAt: string;            // ISO date string
  approvedBy?: string;          // Optional — only filled after approval
  remarks?: string;             // Optional — additional notes
}
