import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types';
import { 
  FileText, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  MessageSquare, 
  CheckCircle,
  Filter
} from 'lucide-react';

export const RMDashboard = () => {
  const { invoices, updateInvoice } = useInvoiceStore();
  const { toast } = useToast();
  const [selectedRM, setSelectedRM] = useState('1'); // Mock RM selection
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [remarkDialog, setRemarkDialog] = useState<{ open: boolean; invoiceId: string }>({ open: false, invoiceId: '' });
  const [newRemark, setNewRemark] = useState('');

  // Filter invoices for selected RM
  const rmInvoices = invoices.filter(invoice => invoice.assignedRM === selectedRM);
  
  const filteredInvoices = rmInvoices.filter(invoice => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') {
      return invoice.paymentStatus !== 'Paid' && new Date(invoice.dueDate) < new Date();
    }
    return invoice.paymentStatus === filterStatus;
  });

  // Calculate stats for RM
  const totalAssigned = rmInvoices.length;
  const totalAmount = rmInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidInvoices = rmInvoices.filter(inv => inv.paymentStatus === 'Paid').length;
  const overdueInvoices = rmInvoices.filter(inv => 
    inv.paymentStatus !== 'Paid' && new Date(inv.dueDate) < new Date()
  ).length;

  const handleFollowUpToggle = (invoiceId: string, followUpInitiated: boolean) => {
    updateInvoice(invoiceId, { followUpInitiated });
    toast({
      title: "Success",
      description: followUpInitiated ? "Follow-up marked as initiated" : "Follow-up status cleared",
    });
  };

  const handleStatusUpdate = (invoiceId: string, status: Invoice['paymentStatus']) => {
    updateInvoice(invoiceId, { paymentStatus: status });
    toast({
      title: "Success",
      description: "Payment status updated successfully",
    });
  };

  const handleAddRemark = () => {
    if (!newRemark.trim()) return;
    
    updateInvoice(remarkDialog.invoiceId, { remarks: newRemark });
    toast({
      title: "Success",
      description: "Remark added successfully",
    });
    
    setRemarkDialog({ open: false, invoiceId: '' });
    setNewRemark('');
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: Date) => 
    new Date(date).toLocaleDateString();

  const isOverdue = (invoice: Invoice) => 
    invoice.paymentStatus !== 'Paid' && new Date(invoice.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">RM Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your assigned invoices and track collections
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssigned}</div>
            <p className="text-xs text-muted-foreground">
              {paidInvoices} paid, {totalAssigned - paidInvoices} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Across all assigned invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {totalAssigned > 0 ? Math.round((paidInvoices / totalAssigned) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Payment success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter invoices" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="Unpaid">Unpaid</SelectItem>
                <SelectItem value="Partially Paid">Partially Paid</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Showing {filteredInvoices.length} of {totalAssigned} invoices
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>My Assigned Invoices</CardTitle>
          <CardDescription>
            Manage and track your assigned customer invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No invoices found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {filterStatus !== 'all' 
                  ? 'Try adjusting your filter criteria.'
                  : 'You have no assigned invoices yet.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className={`p-4 border rounded-lg space-y-3 ${
                    isOverdue(invoice) ? 'border-destructive/50 bg-destructive/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{invoice.customerName}</h4>
                        <Badge variant="outline">{invoice.id}</Badge>
                        {isOverdue(invoice) && (
                          <Badge variant="destructive">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overdue
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Invoice Date: {formatDate(invoice.invoiceDate)} • Due: {formatDate(invoice.dueDate)}
                      </p>
                      {invoice.project && (
                        <p className="text-xs text-muted-foreground">Project: {invoice.project}</p>
                      )}
                      {invoice.remarks && (
                        <p className="text-xs bg-muted p-2 rounded">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          {invoice.remarks}
                        </p>
                      )}
                    </div>
                    
                    <div className="text-right space-y-1">
                      <div className="bg-muted/50 p-3 rounded-md space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Unit Amount:</span>
                          <span className="font-medium">{formatCurrency(invoice.unitAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">GST ({invoice.gstPercent}%):</span>
                          <span className="font-medium">{formatCurrency(invoice.gstAmount)}</span>
                        </div>
                        <div className="border-t pt-1 flex justify-between items-center">
                          <span className="font-semibold">Total Amount:</span>
                          <span className="font-bold text-lg">{formatCurrency(invoice.totalAmount)}</span>
                        </div>
                        {invoice.amountPaid !== undefined && (
                          <>
                            <div className="flex justify-between items-center text-sm text-success">
                              <span>Paid:</span>
                              <span className="font-medium">{formatCurrency(invoice.amountPaid)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-destructive">
                              <span>Balance:</span>
                              <span className="font-medium">{formatCurrency(invoice.balanceAmount || 0)}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        invoice.paymentStatus === 'Paid' ? 'default' :
                        invoice.paymentStatus === 'Partially Paid' ? 'secondary' : 'destructive'
                      }>
                        {invoice.paymentStatus}
                      </Badge>
                      
                      {invoice.followUpInitiated && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Follow-up Initiated
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant={invoice.followUpInitiated ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleFollowUpToggle(invoice.id, !invoice.followUpInitiated)}
                      >
                        {invoice.followUpInitiated ? "Clear Follow-up" : "Mark Follow-up"}
                      </Button>

                      <Dialog
                        open={remarkDialog.open && remarkDialog.invoiceId === invoice.id}
                        onOpenChange={(open) => setRemarkDialog({ open, invoiceId: open ? invoice.id : '' })}
                      >
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Add Remark
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Add Remark</DialogTitle>
                            <DialogDescription>
                              Add a note or update for invoice {invoice.id}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="remark">Remark</Label>
                              <Textarea
                                id="remark"
                                value={newRemark}
                                onChange={(e) => setNewRemark(e.target.value)}
                                placeholder="Enter your remark here..."
                                rows={3}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end gap-3">
                            <Button 
                              variant="outline" 
                              onClick={() => setRemarkDialog({ open: false, invoiceId: '' })}
                            >
                              Cancel
                            </Button>
                            <Button onClick={handleAddRemark}>
                              Add Remark
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {invoice.paymentStatus !== 'Paid' && (
                        <Select 
                          value={invoice.paymentStatus} 
                          onValueChange={(value) => handleStatusUpdate(invoice.id, value as Invoice['paymentStatus'])}
                        >
                          <SelectTrigger className="w-36">
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