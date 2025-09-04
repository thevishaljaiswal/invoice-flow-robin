import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { Dashboard } from '@/pages/Dashboard';
import { InvoiceManagement } from '@/pages/InvoiceManagement';
import { RMManagement } from '@/pages/RMManagement';
import { RMDashboard } from '@/pages/RMDashboard';
import { Reports } from '@/pages/Reports';

export const Layout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/invoices" element={<InvoiceManagement />} />
              <Route path="/relationship-managers" element={<RMManagement />} />
              <Route path="/rm-dashboard" element={<RMDashboard />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};