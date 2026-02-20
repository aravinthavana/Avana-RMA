import React, { useState, FC } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Rma, Customer, RmaStatus, ServiceCycle } from './types';
import RmaList from './components/RmaList';
import RmaDetailView from './components/RmaDetailView';
import CustomerListView from './components/CustomerListView';
import CustomerDetailView from './components/CustomerDetailView';
import RmaFormModal from './components/RmaFormModal';
import CustomerFormModal from './components/CustomerFormModal';
import LoginPage from './src/pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

import { SidebarLayout } from './components/SidebarLayout';
import { Breadcrumbs, BreadcrumbItem } from './components/Breadcrumbs';
import Dashboard from './components/Dashboard';
import UserManagement from './src/pages/UserManagement';
import AuditLogsPage from './src/pages/AuditLogsPage';
import ForgotPassword from './src/pages/ForgotPassword';
import ResetPassword from './src/pages/ResetPassword';
import ProfilePage from './src/pages/ProfilePage';

// Context Providers
import { CustomerProvider, useCustomerContext } from './src/context/CustomerContext';
import { RmaProvider, useRmaContext } from './src/context/RmaContext';

/**
 * The inner application content that has access to Contexts.
 */
const AppContent: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { customers, createCustomer, updateCustomer, lastCreatedCustomerId, setLastCreatedCustomerId } = useCustomerContext();
  const { rmas, createRma, updateRma, updateStatus } = useRmaContext();

  // State for managing the visibility of various modals.
  const [isRmaModalOpen, setIsRmaModalOpen] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // State for holding data for editing or creating new entities.
  const [rmaToEdit, setRmaToEdit] = useState<Rma | undefined>(undefined);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | undefined>(undefined);
  const [rmaForNewCycle, setRmaForNewCycle] = useState<Rma | null>(null);

  // State for managing the context between modals.
  const [preselectedCustomerIdForRma, setPreselectedCustomerIdForRma] = useState<string | undefined>(undefined);

  // -- Modal Handlers --

  const closeRmaModal = () => {
    setIsRmaModalOpen(false);
    setRmaToEdit(undefined);
    setPreselectedCustomerIdForRma(undefined);
    setLastCreatedCustomerId(null);
  };

  const openNewRmaModal = () => {
    setRmaToEdit(undefined);
    setPreselectedCustomerIdForRma(undefined);
    setIsRmaModalOpen(true);
  };

  const handleEditRma = (rma: Rma) => {
    setRmaToEdit(rma);
    setIsRmaModalOpen(true);
  };

  const handleOpenNewRmaForCustomer = (customerId: string) => {
    // Not typically called from AppContent directly anymore, but kept for compatibility or drilled props if needed?
    // Actually, CustomerDetailView needs to open "New RMA" for *that* customer.
    // CustomerDetailView still receives `onNewRma` prop?
    // Let's check CustomerDetailView props.
    // I removed onNewRma from CustomerDetailView props in favor of navigation?
    // No, onNewRma was retained in my plan because modals are still here.
    // Wait, let's checking CustomerDetailView current state.
    // `const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({ onNewRma }) => { ... }`
    // Yes, onNewRma is still a prop.
    // So we need to pass a handler to CustomerDetailView that opens the modal with preselected customer.
    setRmaToEdit(undefined);
    setPreselectedCustomerIdForRma(customerId);
    setIsRmaModalOpen(true);
  };

  const openNewCustomerModal = () => {
    setCustomerToEdit(undefined);
    setIsCustomerModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  const handleOpenNewCycleModal = (rma: Rma) => {
    // RmaDetailView calls this. RmaDetailView refactored to handle its own state?
    // Let's check RmaDetailView.
    // `const RmaDetailView = () => { ... }` No props.
    // It uses Local State for NewCycleModal?
    // Yes: `const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);` inside RmaDetailView.tsx.
    // So `AppContent` does NOT need `isNewCycleModalOpen` for RmaDetailView usage.
    // However, `isNewCycleModalOpen` might be used elsewhere? No, typically only detail view.
    // BUT, `App.tsx` has `NewCycleModal` import.
    // If `RmaDetailView` handles it internally, we can remove it from here for *that* path.
    // Wait, let's verify RmaDetailView again.
  };

  // RmaDetailView handles its own New Cycle Modal internally now (from previous step 1937 summary).
  // So we don't need `handleOpenNewCycleModal` passed to it.
  // We CAN remove `NewCycleModal` from AppContent if it's only used in RmaDetailView.
  // BUT: check if other components use it. Likely not.
  // I will leave the `NewCycleModal` code in AppContent only if needed by other paths, but it seems RmaDetailView is the only place.
  // Actually, RmaDetailView imports `NewCycleModal`.
  // So I can remove `isNewCycleModalOpen` from AppContent!

  // -- Data Saving Handlers (using Context) --

  const handleSaveRma = async (rmaData: any, id?: string) => {
    if (id) {
      await updateRma(id, rmaData);
    } else {
      await createRma(rmaData);
    }
    closeRmaModal();
  };

  const handleSaveCustomer = async (customerData: any, id?: string) => {
    if (id) {
      await updateCustomer(id, customerData);
    } else {
      await createCustomer(customerData);
    }
    setIsCustomerModalOpen(false);
    setCustomerToEdit(undefined);
  };


  // -- Navigation Helpers --

  const handleNavigate = (view: 'rma' | 'customer' | 'dashboard' | 'users' | 'logs' | 'profile') => {
    if (view === 'rma') navigate('/rmas');
    if (view === 'customer') navigate('/customers');
    if (view === 'dashboard') navigate('/');
    if (view === 'users') navigate('/users');
    if (view === 'logs') navigate('/system-logs');
    if (view === 'profile') navigate('/profile');
  }

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    const path = location.pathname;

    if (path !== '/' && path !== '/dashboard') {
      items.push({ label: 'Home', onClick: () => navigate('/'), active: false });
    }

    if (path === '/' || path === '/dashboard') {
      items.push({ label: 'Dashboard', active: true });
    } else if (path.startsWith('/rmas')) {
      items.push({ label: 'RMAs', onClick: () => navigate('/rmas'), active: path === '/rmas' });
      const rmaId = path.split('/')[2];
      if (rmaId) {
        items.push({ label: `RMA #${rmaId}`, active: true });
      }
    } else if (path.startsWith('/customers')) {
      items.push({ label: 'Customers', onClick: () => navigate('/customers'), active: path === '/customers' });
      const custId = path.split('/')[2];
      const customer = customers.find(c => c.id === custId);
      if (customer) {
        items.push({
          label: customer.name,
          onClick: () => navigate(`/customers/${customer.id}`),
          active: path === `/customers/${customer.id}`
        });
      } else if (custId) {
        items.push({ label: 'Details', active: true });
      }
    }
    return items;
  }

  const getActiveView = (): 'dashboard' | 'rma' | 'customer' | 'users' | 'logs' | 'profile' => {
    if (location.pathname === '/' || location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname.includes('rmas')) return 'rma';
    if (location.pathname.includes('customers')) return 'customer';
    if (location.pathname.includes('users')) return 'users';
    if (location.pathname.includes('system-logs')) return 'logs';
    if (location.pathname.includes('profile')) return 'profile';
    return 'dashboard';
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'glass !rounded-lg !border-slate-200 !text-slate-800 !shadow-lg', duration: 4000 }} />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route path="/*" element={
          <ProtectedRoute>
            <SidebarLayout
              activeView={getActiveView()}
              onNavigate={handleNavigate}
              onGoHome={() => navigate('/')}
            >
              {/* Breadcrumbs Section */}
              <div className="mb-6">
                <Breadcrumbs items={getBreadcrumbs()} />
              </div>

              <Routes>
                <Route path="/" element={
                  <Dashboard onNewRma={openNewRmaModal} />
                } />
                <Route path="/rmas" element={
                  <RmaList
                    onNewRma={openNewRmaModal}
                    onEditRma={handleEditRma}
                  />
                } />
                <Route path="/rmas/:id" element={
                  <RmaDetailView />
                } />
                <Route path="/customers" element={
                  <CustomerListView
                    onAddCustomer={openNewCustomerModal}
                    onEditCustomer={handleEditCustomer}
                  />
                } />
                <Route path="/customers/:id" element={
                  <CustomerDetailView onNewRma={(id) => handleOpenNewRmaForCustomer(id)} />
                } />
                <Route path="/users" element={
                  <UserManagement />
                } />
                <Route path="/system-logs" element={
                  <AuditLogsPage />
                } />
                <Route path="/profile" element={
                  <ProfilePage />
                } />
              </Routes>

              {/* Public Routes inside layout? No, public routes usually outside protected layout if they are public. 
                  But Forgot/Reset password pages are full page. 
                  They should be outside SidebarLayout.
                  Let's check where Login is. Route path="/login" is outside SidebarLayout.
                  So I should add them there.
              */}

              {/* Global Modals */}
              {isRmaModalOpen && (
                <RmaFormModal
                  isOpen={isRmaModalOpen}
                  initialData={rmaToEdit}
                  customers={customers}
                  onSave={handleSaveRma}
                  onClose={closeRmaModal}
                  preselectedCustomerId={preselectedCustomerIdForRma}
                  onAddNewCustomer={() => setIsCustomerModalOpen(true)}
                  lastCreatedCustomerId={lastCreatedCustomerId || undefined}
                />
              )}

              {isCustomerModalOpen && (
                <CustomerFormModal
                  onSave={handleSaveCustomer}
                  onClose={() => setIsCustomerModalOpen(false)}
                  customer={customerToEdit}
                />
              )}

            </SidebarLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

/**
 * The main application component.
 * It serves as the root of the application, wrapping providers.
 */
const App: FC = () => {
  return (
    <CustomerProvider>
      <RmaProvider>
        <AppContent />
      </RmaProvider>
    </CustomerProvider>
  );
};

export default App;
