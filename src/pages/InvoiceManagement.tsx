import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types';
import { FileText, Plus, Search, Filter, UserCheck, RotateCcw, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export const InvoiceManagement = () => {
  const { invoices, relationshipManagers, addInvoice, updateInvoice, reassignInvoice, getActiveRMs } = useInvoiceStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState<string | null>(null);

  const [newInvoice, setNewInvoice] = useState({
    customerId: '',
    customerName: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: 0,
    gstAmount: 0,
    project: '',
    businessUnit: '',
    paymentStatus: 'Unpaid' as const,
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.paymentStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreateInvoice = () => {
    if (!newInvoice.customerName || !newInvoice.dueDate || newInvoice.amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const invoice = addInvoice({
      ...newInvoice,
      customerId: newInvoice.customerId || `CUST-${Date.now()}`,
      invoiceDate: new Date(newInvoice.invoiceDate),
      dueDate: new Date(newInvoice.dueDate),
    });

    toast({
      title: "Success",
      description: `Invoice ${invoice.id} created and assigned to ${invoice.assignedRMName}`,
    });

    setNewInvoice({
      customerId: '',
      customerName: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      amount: 0,
      gstAmount: 0,
      project: '',
      businessUnit: '',
      paymentStatus: 'Unpaid',
    });
    setIsCreateDialogOpen(false);
  };

  const handleStatusUpdate = (invoiceId: string, status: Invoice['paymentStatus']) => {
    updateInvoice(invoiceId, { paymentStatus: status });
    toast({
      title: "Success",
      description: "Invoice status updated successfully",
    });
  };

  const handleReassignInvoice = (invoiceId: string, newRMId: string) => {
    const newRM = relationshipManagers.find(rm => rm.id === newRMId);
    reassignInvoice(invoiceId, newRMId);
    toast({
      title: "Success",
      description: `Invoice reassigned to ${newRM?.name}`,
    });
    setReassignDialogOpen(null);
  };

  const getAssignmentStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return <Clock className="h-3 w-3 text-orange-500" />;
      case 'Accepted': return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'Reassigned': return <RotateCcw className="h-3 w-3 text-blue-500" />;
      default: return <AlertCircle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getAssignmentStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'secondary';
      case 'Accepted': return 'default';
      case 'Reassigned': return 'outline';
      default: return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: Date) => 
    new Date(date).toLocaleDateString();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoice Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and track customer invoices
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
              <DialogDescription>
                Enter the invoice details. It will be automatically assigned to an RM.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Input
                    id="customerName"
                    value={newInvoice.customerName}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Enter customer name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input
                    id="customerId"
                    value={newInvoice.customerId}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, customerId: e.target.value }))}
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceDate">Invoice Date</Label>
                  <Input
                    id="invoiceDate"
                    type="date"
                    value={newInvoice.invoiceDate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, invoiceDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Invoice Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstAmount">GST Amount</Label>
                  <Input
                    id="gstAmount"
                    type="number"
                    value={newInvoice.gstAmount}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, gstAmount: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Input
                    id="project"
                    value={newInvoice.project}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="Project name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessUnit">Business Unit</Label>
                  <Input
                    id="businessUnit"
                    value={newInvoice.businessUnit}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, businessUnit: e.target.value }))}
                    placeholder="Business unit"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvoice}>
                Create Invoice
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices ({filteredInvoices.length})</CardTitle>
          <CardDescription>
            Manage and track all invoices in your system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No invoices found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first invoice.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{invoice.customerName}</h4>
                        <Badge variant="outline">{invoice.id}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(invoice.dueDate)} • 
                        Created: {formatDate(invoice.invoiceDate)}
                      </p>
                      {invoice.project && (
                        <p className="text-xs text-muted-foreground">
                          Project: {invoice.project} | Unit: {invoice.businessUnit}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right space-y-1">
                      <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                      {invoice.gstAmount && (
                        <p className="text-xs text-muted-foreground">
                          +{formatCurrency(invoice.gstAmount)} GST
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Assignment Info */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md">
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-primary" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">
                            Assigned to: {invoice.assignedRMName || 'Unassigned'}
                          </p>
                          <Badge variant={getAssignmentStatusColor(invoice.assignmentStatus || '')}>
                            <div className="flex items-center gap-1">
                              {getAssignmentStatusIcon(invoice.assignmentStatus || '')}
                              {invoice.assignmentStatus}
                            </div>
                          </Badge>
                        </div>
                        {invoice.assignmentTimestamp && (
                          <p className="text-xs text-muted-foreground">
                            Assigned: {new Date(invoice.assignmentTimestamp).toLocaleDateString()} at {new Date(invoice.assignmentTimestamp).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setReassignDialogOpen(invoice.id)}
                      disabled={!invoice.assignedRM}
                    >
                      <RotateCcw className="mr-1 h-3 w-3" />
                      Reassign
                    </Button>
                  </div>

                  {/* Payment Status & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        invoice.paymentStatus === 'Paid' ? 'default' :
                        invoice.paymentStatus === 'Partially Paid' ? 'secondary' : 'destructive'
                      }>
                        {invoice.paymentStatus}
                      </Badge>
                      
                      {invoice.followUpInitiated && (
                        <Badge variant="outline">Follow-up Initiated</Badge>
                      )}
                    </div>
                    
                    {invoice.paymentStatus !== 'Paid' && (
                      <Select 
                        value={invoice.paymentStatus} 
                        onValueChange={(value) => handleStatusUpdate(invoice.id, value as Invoice['paymentStatus'])}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Unpaid">Unpaid</SelectItem>
                          <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                          <SelectItem value="Paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Payment Details */}
                  {invoice.amountPaid && invoice.amountPaid > 0 && (
                    <div className="text-sm text-muted-foreground p-2 bg-green-50 rounded border">
                      <p>Paid: {formatCurrency(invoice.amountPaid)} • Balance: {formatCurrency(invoice.balanceAmount || 0)}</p>
                      {invoice.paymentReference && (
                        <p className="text-xs">Ref: {invoice.paymentReference} | Mode: {invoice.paymentMode}</p>
                      )}
                    </div>
                  )}

                  {invoice.remarks && (
                    <div className="text-sm p-2 bg-blue-50 rounded border">
                      <p className="font-medium text-blue-900">Remarks:</p>
                      <p className="text-blue-700">{invoice.remarks}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reassign Dialog */}
      <Dialog open={!!reassignDialogOpen} onOpenChange={() => setReassignDialogOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign Invoice</DialogTitle>
            <DialogDescription>
              Select a new Relationship Manager for this invoice
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {reassignDialogOpen && (() => {
              const invoice = invoices.find(inv => inv.id === reassignDialogOpen);
              const activeRMs = getActiveRMs();
              
              return (
                <>
                  <div className="p-4 border rounded-lg bg-muted/30">
                    <h4 className="font-medium">Invoice Details</h4>
                    <p className="text-sm text-muted-foreground">
                      {invoice?.customerName} - {formatCurrency(invoice?.amount || 0)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Currently assigned to: {invoice?.assignedRMName}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <Label>Select New RM</Label>
                    <div className="space-y-2">
                      {activeRMs.map((rm) => (
                        <div key={rm.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50">
                          <div>
                            <p className="font-medium">{rm.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {rm.assignedInvoices} invoices assigned
                            </p>
                          </div>
                          <Button 
                            onClick={() => handleReassignInvoice(reassignDialogOpen, rm.id)}
                            disabled={rm.id === invoice?.assignedRM}
                            variant={rm.id === invoice?.assignedRM ? "secondary" : "default"}
                          >
                            {rm.id === invoice?.assignedRM ? "Current" : "Assign"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};