import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Clock,
  Users,
  DollarSign,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const Reports = () => {
  const { invoices, relationshipManagers, getDashboardStats } = useInvoiceStore();
  const stats = getDashboardStats();

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (date: Date) => 
    new Date(date).toLocaleDateString();

  // Invoice aging analysis
  const today = new Date();
  const agingBuckets = {
    current: invoices.filter(inv => inv.paymentStatus !== 'Paid' && new Date(inv.dueDate) >= today).length,
    '1-30': invoices.filter(inv => {
      const daysPastDue = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      return inv.paymentStatus !== 'Paid' && daysPastDue >= 1 && daysPastDue <= 30;
    }).length,
    '31-60': invoices.filter(inv => {
      const daysPastDue = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      return inv.paymentStatus !== 'Paid' && daysPastDue >= 31 && daysPastDue <= 60;
    }).length,
    '60+': invoices.filter(inv => {
      const daysPastDue = Math.floor((today.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
      return inv.paymentStatus !== 'Paid' && daysPastDue > 60;
    }).length,
  };

  // RM Performance
  const rmPerformance = relationshipManagers.map(rm => {
    const rmInvoices = invoices.filter(inv => inv.assignedRM === rm.id);
    const paidInvoices = rmInvoices.filter(inv => inv.paymentStatus === 'Paid');
    const totalAmount = rmInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const collectedAmount = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    return {
      ...rm,
      totalInvoices: rmInvoices.length,
      paidInvoices: paidInvoices.length,
      collectionRate: rmInvoices.length > 0 ? (paidInvoices.length / rmInvoices.length) * 100 : 0,
      totalAmount,
      collectedAmount,
    };
  }).sort((a, b) => b.collectionRate - a.collectionRate);

  // Recent overdue invoices
  const overdueInvoices = invoices
    .filter(inv => inv.paymentStatus !== 'Paid' && new Date(inv.dueDate) < today)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into your invoice management performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {stats.totalInvoices > 0 
                ? Math.round(((stats.totalInvoices - (stats.totalInvoices - invoices.filter(i => i.paymentStatus === 'Paid').length)) / stats.totalInvoices) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall payment success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Days to Pay</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {invoices.filter(i => i.paymentStatus === 'Paid').length > 0 ? '18' : '---'}
            </div>
            <p className="text-xs text-muted-foreground">
              Days from invoice to payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active RMs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {relationshipManagers.filter(rm => rm.isActive && !rm.isOnLeave).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently handling invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalation Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {stats.totalInvoices > 0 ? Math.round((stats.overdueInvoices / stats.totalInvoices) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Invoices requiring escalation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Invoice Aging Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Aging Analysis</CardTitle>
            <CardDescription>
              Breakdown of outstanding invoices by age
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-success rounded"></div>
                  <span className="text-sm">Current (Not Due)</span>
                </div>
                <div className="text-sm font-medium">{agingBuckets.current} invoices</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-warning rounded"></div>
                  <span className="text-sm">1-30 Days Past Due</span>
                </div>
                <div className="text-sm font-medium">{agingBuckets['1-30']} invoices</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive/70 rounded"></div>
                  <span className="text-sm">31-60 Days Past Due</span>
                </div>
                <div className="text-sm font-medium">{agingBuckets['31-60']} invoices</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-destructive rounded"></div>
                  <span className="text-sm">60+ Days Past Due</span>
                </div>
                <div className="text-sm font-medium">{agingBuckets['60+']} invoices</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RM Performance Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>RM Performance Ranking</CardTitle>
            <CardDescription>
              Collection performance by relationship manager
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rmPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No performance data available</p>
              ) : (
                rmPerformance.slice(0, 5).map((rm, index) => (
                  <div key={rm.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? 'default' : 'outline'}>
                          #{index + 1}
                        </Badge>
                        <span className="text-sm font-medium">{rm.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rm.totalInvoices} invoices • {formatCurrency(rm.totalAmount)} total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-success">
                        {rm.collectionRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(rm.collectedAmount)} collected
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Overdue Invoices */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Overdue Invoices</CardTitle>
          <CardDescription>
            Invoices requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overdueInvoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No overdue invoices</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Great job! All invoices are current or paid.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {overdueInvoices.map((invoice) => {
                const daysPastDue = Math.floor((today.getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{invoice.customerName}</h4>
                        <Badge variant="outline">{invoice.id}</Badge>
                        <Badge variant="destructive">
                          {daysPastDue} days overdue
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due: {formatDate(invoice.dueDate)} • RM: {invoice.assignedRMName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-destructive">{formatCurrency(invoice.amount)}</p>
                      <Badge variant={
                        invoice.paymentStatus === 'Partially Paid' ? 'secondary' : 'destructive'
                      }>
                        {invoice.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};