import React, { useState, useEffect, useMemo, FC } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Rma, Customer, RmaStatus, ServiceCycle } from './types';
import RmaList from './components/RmaList';
import RmaDetailView from './components/RmaDetailView';
import CustomerListView from './components/CustomerListView';
import CustomerDetailView from './components/CustomerDetailView';
import RmaFormModal from './components/RmaFormModal';
import NewCycleModal from './components/NewCycleModal';
import CustomerFormModal from './components/CustomerFormModal';
import LoginPage from './src/pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

import { API_BASE_URL } from './config';
import { SidebarLayout } from './components/SidebarLayout';
import { Breadcrumbs, BreadcrumbItem } from './components/Breadcrumbs';
import Dashboard from './components/Dashboard';
import { customersApi, rmasApi } from './src/api';
import { useCustomers, useRmas } from './src/hooks';


// Defines the possible main views the user can navigate to.
type View = 'dashboard' | 'rmaList' | 'rmaDetail' | 'customerList' | 'customerDetail';

// Defines the shape of the filters used for the RMA list.
export interface RmaFilters {
  searchTerm: string;
  statuses: RmaStatus[];
  customerId: string;
  dateFrom: string;
  dateTo: string;
}

/**
 * The main application component.
 * It serves as the root of the application, managing state, navigation, and data operations.
 */
const App: FC = () => {
  // Use custom hooks for state management
  const {
    customers,
    page: customerPage,
    totalCustomers,
    isLoading: customersLoading,
    lastCreatedCustomerId,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    setPage: setCustomerPage,
    setCustomers,
    setLastCreatedCustomerId,
  } = useCustomers(1, 10);

  const {
    rmas,
    page,
    totalRmas,
    filters,
    isLoading: rmasLoading,
    createRma,
    updateRma,
    deleteRma,
    updateStatus,
    setPage,
    setFilters,
    setRmas,
  } = useRmas(1, 10);

  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Combined loading state
  const isLoading = customersLoading || rmasLoading;

  // Selected IDs derived from routing would be ideal, but for now managing state here 
  // is fine as we pass props.
  // Actually, for RmaDetailView to work on direct link, we need to extract ID from URL param
  // But our current components expect the full object passed in.
  // Refactor strategy: Keep state valid for now, but update URL.
  // Ideally components should fetch their own data by ID if missing.
  // For this Refactor: We will use the existing Rmas/Customers list to find Selected Item.

  const [selectedRmaId, setSelectedRmaId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Sync state with URL params (basic implementation)
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/rmas/') && path !== '/rmas') {
      setSelectedRmaId(path.split('/')[2]);
    } else if (path.startsWith('/customers/') && path !== '/customers') {
      setSelectedCustomerId(path.split('/')[2]);
    }
  }, [location.pathname]);

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

  // Constants
  const limit = 10;
  const customerLimit = 10;

  const handleSelectRma = (id: string) => {
    setSelectedRmaId(id);
    navigate(`/rmas/${id}`);
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    navigate(`/customers/${id}`);
  };

  const closeRmaModal = () => {
    setIsRmaModalOpen(false);
    setRmaToEdit(undefined);
    setPreselectedCustomerIdForRma(undefined);
    setLastCreatedCustomerId(null);
  };

  const handleSaveRma = async (rmaData: Omit<Rma, 'id' | 'creationDate' | 'lastUpdateDate'> & { customerId?: string }, id?: string) => {
    try {
      let response;
      let payload = { ...rmaData };
      const customer = customers.find(c => c.id === (payload.customer?.id || payload.customerId));

      if (customer) {
        payload.customer = customer;
        delete payload.customerId;
      }


      if (!id) {
        const now = new Date().toISOString();
        const initialCycles: ServiceCycle[] = payload.serviceCycles.map((cycle: Partial<ServiceCycle>) => ({
          deviceSerialNumber: '',
          issueDescription: '',
          accessoriesIncluded: '',
          ...cycle,
          status: RmaStatus.PENDING,
          statusDate: now,
          creationDate: now,
          history: [{
            status: RmaStatus.PENDING,
            date: now,
            notes: cycle.issueDescription || 'Initial registration.'
          }]
        }));
        payload = { ...payload, serviceCycles: initialCycles };
      }

      if (id) {
        response = await fetch(`${API_BASE_URL}/api/rmas/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
      } else {
        response = await fetch(`${API_BASE_URL}/api/rmas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        throw new Error(`Failed to save RMA: ${errorText}`);
      }

      let savedRma = await response.json();
      toast.success(id ? 'RMA updated successfully' : 'RMA created successfully');

      if (id) {
        setRmas(rmas.map(r => r.id === id ? savedRma : r));
      } else {
        setRmas(prevRmas => [savedRma, ...prevRmas]);
      }

    } catch (error) {
      console.error('Error saving RMA:', error);
      toast.error('Failed to save RMA');
    }
    closeRmaModal();
  };

  const handleSaveCustomer = async (customerData: Omit<Customer, 'id'>, id?: string) => {
    try {
      const response = id
        ? await customersApi.update(id, customerData)
        : await customersApi.create(customerData);

      const savedCustomer = response.data;

      if (!savedCustomer) {
        throw new Error('No customer data returned');
      }

      if (id) {
        setCustomers(customers.map(c => c.id === id ? savedCustomer : c));
        setRmas(rmas.map(r => r.customer?.id === id ? { ...r, customer: savedCustomer } : r));
      } else {
        setCustomers([savedCustomer, ...customers]);
        setLastCreatedCustomerId(savedCustomer.id);
      }
      toast.success(id ? 'Customer updated' : 'Customer created');

    } catch (error) {
      console.error('Error saving customer:', error);
      toast.error('Error saving customer');
    }

    setIsCustomerModalOpen(false);
    setCustomerToEdit(undefined);
  };

  const handleSaveNewCycle = (rmaId: string, deviceSerialNumber: string, issueDescription: string, accessoriesIncluded: string) => {
    const rmaToUpdate = rmas.find(r => r.id === rmaId);
    if (!rmaToUpdate) return;

    const now = new Date().toISOString();
    const newCycle: ServiceCycle = {
      deviceSerialNumber,
      status: RmaStatus.PENDING,
      statusDate: now,
      creationDate: now,
      issueDescription,
      accessoriesIncluded,
      history: [{
        status: RmaStatus.PENDING,
        date: now,
        notes: issueDescription || 'New service ticket created.'
      }]
    };

    const updatedRma = {
      ...rmaToUpdate,
      lastUpdateDate: now,
      serviceCycles: [...rmaToUpdate.serviceCycles, newCycle]
    };

    handleSaveRma(updatedRma, rmaId);
    setIsNewCycleModalOpen(false);
    setRmaForNewCycle(null);
  };

  const handleOpenNewCycleModal = (rma: Rma) => {
    setRmaForNewCycle(rma);
    setIsNewCycleModalOpen(true);
  };


  const handleStatusUpdate = async (rmaId: string, cycleCreationDate: string, deviceSerialNumber: string, newStatus: RmaStatus, notes: string) => {
    try {
      const response = await rmasApi.updateStatus(rmaId, {
        deviceSerialNumber,
        newStatus,
        notes
      });

      const { lastUpdateDate } = response.data;

      setRmas(prevRmas => prevRmas.map(rma => {
        if (rma.id !== rmaId) return rma;

        const updatedRma = { ...rma, lastUpdateDate };

        updatedRma.serviceCycles = rma.serviceCycles.map(cycle => {
          if (cycle.deviceSerialNumber !== deviceSerialNumber) return cycle;

          const updatedCycle = { ...cycle, status: newStatus, statusDate: new Date().toISOString() };
          updatedCycle.history = [...cycle.history, { status: newStatus, date: new Date().toISOString(), notes }];
          return updatedCycle;
        });

        return updatedRma;
      }));
      toast.success('RMA Status updated');

    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    }
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

  const handleDeleteRma = async (id: string) => {
    try {
      await rmasApi.delete(id);

      setRmas(rmas.filter(r => r.id !== id));
      toast.success('RMA deleted');
    } catch (error) {
      console.error('Error deleting RMA:', error);
      toast.error('Failed to delete RMA');
    }
  };

  const handleOpenNewRmaForCustomer = (customerId: string) => {
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

  const handleDeleteCustomer = async (id: string, deleteRmas: boolean = false) => {
    const success = await deleteCustomer(id, deleteRmas);

    if (success && deleteRmas) {
      setRmas(rmas.filter(r => r.customer?.id !== id));
    }
  };

  const filteredRmas = useMemo(() => {
    return rmas.filter(rma => {
      const searchLower = filters.searchTerm.toLowerCase();
      const matchesSearch =
        !searchLower ||
        rma.id.toLowerCase().includes(searchLower) ||
        rma.customer.name.toLowerCase().includes(searchLower) ||
        rma.customer.contactPerson.toLowerCase().includes(searchLower) ||
        rma.devices.some(d => d.serialNumber.toLowerCase().includes(searchLower));

      const matchesStatus =
        filters.statuses.length === 0 ||
        rma.serviceCycles.some(cycle => filters.statuses.includes(cycle.status));

      const matchesCustomer = !filters.customerId || rma.customer.id === filters.customerId;

      const creationDate = new Date(rma.creationDate);
      const matchesDateFrom = !filters.dateFrom || creationDate >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || creationDate <= new Date(new Date(filters.dateTo).setHours(23, 59, 59, 999));

      return matchesSearch && matchesStatus && matchesCustomer && matchesDateFrom && matchesDateTo;
    });
  }, [rmas, filters]);

  const selectedRma = rmas.find(r => r.id === selectedRmaId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleBackFromRmaDetail = () => {
    setSelectedRmaId(null);
    if (selectedCustomerId) navigate(`/customers/${selectedCustomerId}`);
    else navigate('/rmas');
  }

  const handleNavigate = (view: 'rma' | 'customer' | 'dashboard') => {
    setSelectedRmaId(null);
    setSelectedCustomerId(null);
    if (view === 'rma') navigate('/rmas');
    if (view === 'customer') navigate('/customers');
    if (view === 'dashboard') navigate('/');
  }



  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];
    const path = location.pathname;

    // Always show Home first, except on dashboard
    if (path !== '/' && path !== '/dashboard') {
      items.push({ label: 'Home', onClick: () => navigate('/'), active: false });
    }

    if (path === '/' || path === '/dashboard') {
      items.push({ label: 'Dashboard', active: true });
    } else if (path.startsWith('/rmas')) {
      items.push({ label: 'RMAs', onClick: () => navigate('/rmas'), active: path === '/rmas' });
      if (selectedRmaId) {
        items.push({ label: `RMA #${selectedRmaId}`, active: true });
      }
    } else if (path.startsWith('/customers')) {
      items.push({ label: 'Customers', onClick: () => navigate('/customers'), active: path === '/customers' });
      if (selectedCustomer) {
        items.push({
          label: selectedCustomer.name,
          onClick: () => navigate(`/customers/${selectedCustomer.id}`),
          active: path === `/customers/${selectedCustomer.id}`
        });
        // Handle nested RMA logic or simply rely on RMA route
      }
    }
    return items;
  }



  const getActiveView = (): 'dashboard' | 'rma' | 'customer' => {
    if (location.pathname === '/' || location.pathname === '/dashboard') return 'dashboard';
    if (location.pathname.includes('rmas')) return 'rma';
    if (location.pathname.includes('customers')) return 'customer';
    return 'dashboard';
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ className: 'glass !rounded-lg !border-slate-200 !text-slate-800 !shadow-lg', duration: 4000 }} />

      <Routes>
        <Route path="/login" element={<LoginPage />} />

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
                  <Dashboard
                    rmas={rmas}
                    customers={customers}
                    onNavigateToRmas={() => navigate('/rmas')}
                    onNavigateToCustomers={() => navigate('/customers')}
                    onNewRma={openNewRmaModal}
                  />
                } />
                <Route path="/rmas" element={
                  <RmaList
                    rmas={filteredRmas}
                    customers={customers}
                    filters={filters}
                    onFiltersChange={setFilters}
                    onSelectRma={handleSelectRma}
                    onNewRma={openNewRmaModal}
                    onEditRma={handleEditRma}
                    onDeleteRma={handleDeleteRma}
                    page={page}
                    totalPages={Math.ceil(totalRmas / limit)}
                    onPageChange={setPage}
                    isLoading={isLoading}
                  />
                } />
                <Route path="/rmas/:id" element={
                  selectedRma ? (
                    <RmaDetailView
                      rma={selectedRma}
                      onBack={handleBackFromRmaDetail}
                      onStatusUpdate={handleStatusUpdate}
                      onNewCycle={handleOpenNewCycleModal}
                    />
                  ) : (
                    <div>RMA not found</div>
                  )
                } />
                <Route path="/customers" element={
                  <CustomerListView
                    customers={customers}
                    rmas={rmas}
                    onSelectCustomer={handleSelectCustomer}
                    onAddCustomer={openNewCustomerModal}
                    onEditCustomer={handleEditCustomer}
                    onDeleteCustomer={handleDeleteCustomer}
                    page={customerPage}
                    totalPages={Math.ceil(totalCustomers / customerLimit)}
                    onPageChange={setCustomerPage}
                    isLoading={isLoading}
                  />
                } />
                <Route path="/customers/:id" element={
                  selectedCustomer ? (
                    <CustomerDetailView
                      customer={selectedCustomer}
                      rmas={rmas.filter(r => r.customer.id === selectedCustomer.id)}
                      onBack={() => navigate('/customers')}
                      onSelectRma={handleSelectRma}
                      onNewRma={handleOpenNewRmaForCustomer}
                    />
                  ) : (
                    <div>Customer not found</div>
                  )
                } />
              </Routes>

              {isRmaModalOpen && <RmaFormModal isOpen={isRmaModalOpen} initialData={rmaToEdit} customers={customers} onSave={handleSaveRma} onClose={closeRmaModal} preselectedCustomerId={preselectedCustomerIdForRma} onAddNewCustomer={() => setIsCustomerModalOpen(true)} lastCreatedCustomerId={lastCreatedCustomerId} />}
              {isNewCycleModalOpen && rmaForNewCycle && <NewCycleModal rma={rmaForNewCycle} onSave={handleSaveNewCycle} onClose={() => setIsNewCycleModalOpen(false)} />}
              {isCustomerModalOpen && <CustomerFormModal onSave={handleSaveCustomer} onClose={() => setIsCustomerModalOpen(false)} customer={customerToEdit} />}
            </SidebarLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

export default App;
