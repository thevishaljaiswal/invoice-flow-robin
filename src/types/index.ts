export interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  invoiceDate: Date;
  dueDate: Date;
  unitAmount: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  amount: number; // Legacy field for backward compatibility
  taxDetails?: string;
  project?: string;
  businessUnit?: string;
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  assignedRM?: string;
  assignedRMName?: string;
  assignmentTimestamp?: Date;
  assignmentStatus?: 'Pending' | 'Accepted' | 'Reassigned';
  followUpInitiated?: boolean;
  remarks?: string;
  uploadedFile?: string;
  paymentReference?: string;
  amountPaid?: number;
  paymentDate?: Date;
  balanceAmount?: number;
  paymentMode?: 'Bank Transfer' | 'Cheque' | 'UPI' | 'Gateway';
  createdAt: Date;
  updatedAt: Date;
}

export interface RelationshipManager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  isOnLeave?: boolean;
  assignedInvoices: number;
  createdAt: Date;
}

export interface PaymentUpdate {
  id: string;
  invoiceId: string;
  paymentReference: string;
  amountPaid: number;
  paymentDate: Date;
  balanceAmount: number;
  paymentMode: 'Bank Transfer' | 'Cheque' | 'UPI' | 'Gateway';
  updatedBy: string;
  createdAt: Date;
}

export interface DashboardStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueInvoices: number;
  assignedToday: number;
}