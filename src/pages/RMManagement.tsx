import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useInvoiceStore } from '@/hooks/useInvoiceStore';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Mail, Phone, UserCheck, UserX } from 'lucide-react';

export const RMManagement = () => {
  const { relationshipManagers, addRM, updateRM } = useInvoiceStore();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [newRM, setNewRM] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
  });

  const handleCreateRM = () => {
    if (!newRM.name || !newRM.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    addRM(newRM);
    toast({
      title: "Success",
      description: `Relationship Manager ${newRM.name} has been added successfully`,
    });

    setNewRM({
      name: '',
      email: '',
      phone: '',
      isActive: true,
    });
    setIsCreateDialogOpen(false);
  };

  const handleToggleActive = (rmId: string, isActive: boolean) => {
    updateRM(rmId, { isActive });
    const rm = relationshipManagers.find(r => r.id === rmId);
    toast({
      title: "Success",
      description: `${rm?.name} has been ${isActive ? 'activated' : 'deactivated'}`,
    });
  };

  const handleToggleLeave = (rmId: string, isOnLeave: boolean) => {
    updateRM(rmId, { isOnLeave });
    const rm = relationshipManagers.find(r => r.id === rmId);
    toast({
      title: "Success",
      description: `${rm?.name} is now ${isOnLeave ? 'on leave' : 'available'}`,
    });
  };

  const activeRMs = relationshipManagers.filter(rm => rm.isActive);
  const inactiveRMs = relationshipManagers.filter(rm => !rm.isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relationship Managers</h1>
          <p className="text-muted-foreground">
            Manage your team of relationship managers
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add RM
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Relationship Manager</DialogTitle>
              <DialogDescription>
                Enter the details for the new relationship manager.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={newRM.name}
                  onChange={(e) => setNewRM(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newRM.email}
                  onChange={(e) => setNewRM(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newRM.phone}
                  onChange={(e) => setNewRM(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={newRM.isActive}
                  onCheckedChange={(checked) => setNewRM(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Active (can receive invoice assignments)</Label>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateRM}>
                Add RM
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total RMs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relationshipManagers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active RMs</CardTitle>
            <UserCheck className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{activeRMs.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <UserX className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {relationshipManagers.filter(rm => rm.isOnLeave).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active RMs */}
      <Card>
        <CardHeader>
          <CardTitle>Active Relationship Managers ({activeRMs.length})</CardTitle>
          <CardDescription>
            Currently active team members receiving invoice assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeRMs.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No active RMs</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Add relationship managers to start assigning invoices.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRMs.map((rm) => (
                <div key={rm.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rm.name}</h4>
                      <Badge variant="default">Active</Badge>
                      {rm.isOnLeave && <Badge variant="destructive">On Leave</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {rm.email}
                      </div>
                      {rm.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {rm.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{rm.assignedInvoices}</p>
                      <p className="text-xs text-muted-foreground">invoices assigned</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={!rm.isOnLeave}
                          onCheckedChange={(checked) => handleToggleLeave(rm.id, !checked)}
                        />
                        <Label className="text-xs">Available</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rm.isActive}
                          onCheckedChange={(checked) => handleToggleActive(rm.id, checked)}
                        />
                        <Label className="text-xs">Active</Label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inactive RMs */}
      {inactiveRMs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive Relationship Managers ({inactiveRMs.length})</CardTitle>
            <CardDescription>
              Team members currently not receiving invoice assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inactiveRMs.map((rm) => (
                <div key={rm.id} className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{rm.name}</h4>
                      <Badge variant="secondary">Inactive</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {rm.email}
                      </div>
                      {rm.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {rm.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{rm.assignedInvoices}</p>
                      <p className="text-xs text-muted-foreground">total assigned</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={rm.isActive}
                        onCheckedChange={(checked) => handleToggleActive(rm.id, checked)}
                      />
                      <Label className="text-xs">Active</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};