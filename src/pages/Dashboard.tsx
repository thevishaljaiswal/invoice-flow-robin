import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { 
  FileText, 
  DollarSign, 
  Clock, 
  Users, 
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const Dashboard = () => {
  const { getDashboardStats, relationshipManagers, invoices } = useInvoiceStore();
  const stats = getDashboardStats();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const recentInvoices = invoices.slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your invoice management system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.assignedToday} assigned today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats.paidAmount)} collected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Outstanding payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.overdueInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
            <CardDescription>
              Latest invoices in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices created yet</p>
              ) : (
                recentInvoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{invoice.customerName}</p>
                      <p className="text-xs text-muted-foreground">{invoice.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(invoice.amount)}</p>
                      <Badge variant={
                        invoice.paymentStatus === 'Paid' ? 'default' :
                        invoice.paymentStatus === 'Partially Paid' ? 'secondary' : 'destructive'
                      }>
                        {invoice.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* RM Performance */}
        <Card>
          <CardHeader>
            <CardTitle>RM Assignment Status</CardTitle>
            <CardDescription>
              Current workload distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {relationshipManagers.map((rm) => (
                <div key={rm.id} className="flex items-center justify-between space-x-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{rm.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={rm.isActive ? 'default' : 'secondary'}>
                        {rm.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {rm.isOnLeave && (
                        <Badge variant="destructive">On Leave</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{rm.assignedInvoices} invoices</p>
                    <p className="text-xs text-muted-foreground">assigned</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to get you started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Add RM
            </Button>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};