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
    assignedInvoices: 0,
    createdAt: new Date(),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@company.com',
    phone: '+1-555-0124',
    isActive: true,
    assignedInvoices: 0,
    createdAt: new Date(),
  },
  {
    id: '3',
    name: 'Michael Brown',
    email: 'michael.brown@company.com',
    phone: '+1-555-0125',
    isActive: true,
    assignedInvoices: 0,
    createdAt: new Date(),
  },
];

export const useInvoiceStore = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
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
    getDashboardStats,
    getActiveRMs,
  };
};