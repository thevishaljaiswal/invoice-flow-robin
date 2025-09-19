import { useState, useCallback } from 'react';
import { Invoice, RelationshipManager, DashboardStats } from '@/types';

// Mock data for development
const mockRMs: RelationshipManager[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    phone: '+1-555-0123',
    isActive: true,
    assignedInvoices: 3,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0124',
    isActive: true,
    assignedInvoices: 2,
    createdAt: new Date('2024-01-20'),
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@company.com',
    phone: '+1-555-0125',
    isActive: true,
    assignedInvoices: 4,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma.wilson@company.com',
    phone: '+1-555-0126',
    isActive: false,
    assignedInvoices: 1,
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '5',
    name: 'David Lee',
    email: 'david.lee@company.com',
    phone: '+1-555-0127',
    isActive: true,
    isOnLeave: true,
    assignedInvoices: 0,
    createdAt: new Date('2024-01-25'),
  },
];

const mockInvoices: Invoice[] = [
  {
    id: 'INV-2024-001',
    customerId: 'CUST-001',
    customerName: 'Acme Corporation',
    invoiceDate: new Date('2024-01-15'),
    dueDate: new Date('2024-02-15'),
    unitAmount: 15000,
    gstPercent: 18,
    gstAmount: 2700,
    totalAmount: 17700,
    amount: 17700,
    project: 'Website Development',
    businessUnit: 'IT Services',
    paymentStatus: 'Unpaid',
    assignedRM: '1',
    assignedRMName: 'John Smith',
    assignmentTimestamp: new Date('2024-01-15T10:00:00Z'),
    assignmentStatus: 'Accepted',
    followUpInitiated: true,
    remarks: 'Initial follow-up completed',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: 'INV-2024-002',
    customerId: 'CUST-002',
    customerName: 'TechFlow Inc',
    invoiceDate: new Date('2024-01-20'),
    dueDate: new Date('2024-02-20'),
    unitAmount: 8500,
    gstPercent: 18,
    gstAmount: 1530,
    totalAmount: 10030,
    amount: 10030,
    project: 'Mobile App',
    businessUnit: 'Mobile Development',
    paymentStatus: 'Partially Paid',
    assignedRM: '2',
    assignedRMName: 'Sarah Johnson',
    assignmentTimestamp: new Date('2024-01-20T09:30:00Z'),
    assignmentStatus: 'Pending',
    amountPaid: 4000,
    balanceAmount: 6030,
    paymentDate: new Date('2024-02-01'),
    paymentMode: 'Bank Transfer',
    paymentReference: 'TXN-789456123',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'INV-2024-003',
    customerId: 'CUST-003',
    customerName: 'Global Systems Ltd',
    invoiceDate: new Date('2024-01-10'),
    dueDate: new Date('2024-01-25'),
    unitAmount: 22000,
    gstPercent: 18,
    gstAmount: 3960,
    totalAmount: 25960,
    amount: 25960,
    project: 'ERP Integration',
    businessUnit: 'Enterprise Solutions',
    paymentStatus: 'Paid',
    assignedRM: '3',
    assignedRMName: 'Michael Brown',
    assignmentTimestamp: new Date('2024-01-10T11:15:00Z'),
    assignmentStatus: 'Accepted',
    followUpInitiated: true,
    amountPaid: 25960,
    balanceAmount: 0,
    paymentDate: new Date('2024-01-22'),
    paymentMode: 'UPI',
    paymentReference: 'UPI-12345ABC',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: 'INV-2024-004',
    customerId: 'CUST-004',
    customerName: 'StartupHub Co',
    invoiceDate: new Date('2024-01-25'),
    dueDate: new Date('2024-01-10'), // Overdue
    unitAmount: 5500,
    gstPercent: 18,
    gstAmount: 990,
    totalAmount: 6490,
    amount: 6490,
    project: 'Brand Identity',
    businessUnit: 'Design Services',
    paymentStatus: 'Unpaid',
    assignedRM: '1',
    assignedRMName: 'John Smith',
    assignmentTimestamp: new Date('2024-01-25T14:20:00Z'),
    assignmentStatus: 'Accepted',
    followUpInitiated: false,
    remarks: 'Customer requested extension',
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: 'INV-2024-005',
    customerId: 'CUST-005',
    customerName: 'InnovateTech Solutions',
    invoiceDate: new Date('2024-02-01'),
    dueDate: new Date('2024-03-01'),
    unitAmount: 18000,
    gstPercent: 18,
    gstAmount: 3240,
    totalAmount: 21240,
    amount: 21240,
    project: 'Cloud Migration',
    businessUnit: 'Cloud Services',
    paymentStatus: 'Unpaid',
    assignedRM: '2',
    assignedRMName: 'Sarah Johnson',
    assignmentTimestamp: new Date('2024-02-01T16:45:00Z'),
    assignmentStatus: 'Pending',
    followUpInitiated: false,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

export const useInvoiceStore = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(mockInvoices);
  const [relationshipManagers, setRelationshipManagers] = useState<RelationshipManager[]>(mockRMs);
  const [lastAssignedRMIndex, setLastAssignedRMIndex] = useState(0);

  const getActiveRMs = useCallback(() => {
    return relationshipManagers.filter(rm => rm.isActive && !rm.isOnLeave);
  }, [relationshipManagers]);

  const assignInvoiceToRM = useCallback((invoice: Invoice) => {
    const activeRMs = getActiveRMs();
    if (activeRMs.length === 0) return invoice;

    const nextRM = activeRMs[lastAssignedRMIndex % activeRMs.length];
    setLastAssignedRMIndex(prev => prev + 1);

    // Update RM assigned count
    setRelationshipManagers(prev => 
      prev.map(rm => 
        rm.id === nextRM.id 
          ? { ...rm, assignedInvoices: rm.assignedInvoices + 1 }
          : rm
      )
    );

    return {
      ...invoice,
      assignedRM: nextRM.id,
      assignedRMName: nextRM.name,
      assignmentTimestamp: new Date(),
      assignmentStatus: 'Pending' as const,
    };
  }, [getActiveRMs, lastAssignedRMIndex]);

  const addInvoice = useCallback((invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `INV-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const assignedInvoice = assignInvoiceToRM(newInvoice);
    setInvoices(prev => [...prev, assignedInvoice]);
    return assignedInvoice;
  }, [assignInvoiceToRM]);

  const updateInvoice = useCallback((id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id 
          ? { ...invoice, ...updates, updatedAt: new Date() }
          : invoice
      )
    );
  }, []);

  const addRM = useCallback((rmData: Omit<RelationshipManager, 'id' | 'assignedInvoices' | 'createdAt'>) => {
    const newRM: RelationshipManager = {
      ...rmData,
      id: `RM-${Date.now()}`,
      assignedInvoices: 0,
      createdAt: new Date(),
    };
    setRelationshipManagers(prev => [...prev, newRM]);
  }, []);

  const updateRM = useCallback((id: string, updates: Partial<RelationshipManager>) => {
    setRelationshipManagers(prev => 
      prev.map(rm => 
        rm.id === id ? { ...rm, ...updates } : rm
      )
    );
  }, []);

  const reassignInvoice = useCallback((invoiceId: string, newRMId: string) => {
    const newRM = relationshipManagers.find(rm => rm.id === newRMId);
    if (!newRM) return;

    setInvoices(prev => 
      prev.map(invoice => {
        if (invoice.id === invoiceId) {
          // Update old RM count
          if (invoice.assignedRM) {
            setRelationshipManagers(rmPrev => 
              rmPrev.map(rm => 
                rm.id === invoice.assignedRM 
                  ? { ...rm, assignedInvoices: rm.assignedInvoices - 1 }
                  : rm
              )
            );
          }

          // Update new RM count
          setRelationshipManagers(rmPrev => 
            rmPrev.map(rm => 
              rm.id === newRMId 
                ? { ...rm, assignedInvoices: rm.assignedInvoices + 1 }
                : rm
            )
          );

          return {
            ...invoice,
            assignedRM: newRMId,
            assignedRMName: newRM.name,
            assignmentTimestamp: new Date(),
            assignmentStatus: 'Reassigned' as const,
            updatedAt: new Date(),
          };
        }
        return invoice;
      })
    );
  }, [relationshipManagers]);

  const getDashboardStats = useCallback((): DashboardStats => {
    const totalInvoices = invoices.length;
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const paidAmount = invoices
      .filter(inv => inv.paymentStatus === 'Paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    const pendingAmount = totalAmount - paidAmount;
    const overdueInvoices = invoices.filter(inv => 
      inv.paymentStatus !== 'Paid' && new Date(inv.dueDate) < new Date()
    ).length;
    const today = new Date();
    const assignedToday = invoices.filter(inv => 
      inv.assignmentTimestamp && 
      inv.assignmentTimestamp.toDateString() === today.toDateString()
    ).length;

    return {
      totalInvoices,
      totalAmount,
      paidAmount,
      pendingAmount,
      overdueInvoices,
      assignedToday,
    };
  }, [invoices]);

  return {
    invoices,
    relationshipManagers,
    addInvoice,
    updateInvoice,
    addRM,
    updateRM,
    reassignInvoice,
    getDashboardStats,
    getActiveRMs,
  };
};