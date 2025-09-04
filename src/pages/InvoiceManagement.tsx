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
import { FileText, Plus, Search, Filter } from 'lucide-react';

export const InvoiceManagement = () => {
  const { invoices, addInvoice, updateInvoice } = useInvoiceStore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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
                <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{invoice.customerName}</h4>
                      <Badge variant="outline">{invoice.id}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Due: {formatDate(invoice.dueDate)} • Assigned to: {invoice.assignedRMName || 'Unassigned'}
                    </p>
                    {invoice.project && (
                      <p className="text-xs text-muted-foreground">Project: {invoice.project}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(invoice.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.gstAmount && `+${formatCurrency(invoice.gstAmount)} GST`}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        invoice.paymentStatus === 'Paid' ? 'default' :
                        invoice.paymentStatus === 'Partially Paid' ? 'secondary' : 'destructive'
                      }>
                        {invoice.paymentStatus}
                      </Badge>
                      
                      {invoice.paymentStatus !== 'Paid' && (
                        <Select value={invoice.paymentStatus} onValueChange={(value) => handleStatusUpdate(invoice.id, value as Invoice['paymentStatus'])}>
                          <SelectTrigger className="w-32">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};