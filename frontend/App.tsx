import React, { useState, useMemo, FC, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Rma, Customer, RmaStatus, ServiceCycle } from './types';
import RmaList from './components/RmaList';
import RmaDetailView from './components/RmaDetailView';
import CustomerListView from './components/CustomerListView';
import CustomerDetailView from './components/CustomerDetailView';
import RmaFormModal from './components/RmaFormModal';
import NewCycleModal from './components/NewCycleModal';
import CustomerFormModal from './components/CustomerFormModal';

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

  // Combined loading state
  const isLoading = customersLoading || rmasLoading;

  // State for controlling the current view and selected items.
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedRmaId, setSelectedRmaId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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

  // Sync app state with browser history
  useEffect(() => {
    // Push state to history when view changes
    const state = {
      view: currentView,
      rmaId: selectedRmaId,
      customerId: selectedCustomerId
    };

    // Build URL path
    let path = '/';
    if (currentView === 'dashboard') path = '/';
    else if (currentView === 'rmaList') path = '/rmas';
    else if (currentView === 'rmaDetail' && selectedRmaId) path = `/rmas/${selectedRmaId}`;
    else if (currentView === 'customerList') path = '/customers';
    else if (currentView === 'customerDetail' && selectedCustomerId) path = `/customers/${selectedCustomerId}`;

    // Push state to browser history
    window.history.pushState(state, '', path);
  }, [currentView, selectedRmaId, selectedCustomerId]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state) {
        setCurrentView(event.state.view || 'rmaList');
        setSelectedRmaId(event.state.rmaId || null);
        setSelectedCustomerId(event.state.customerId || null);
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Set initial state
    window.history.replaceState({
      view: currentView,
      rmaId: selectedRmaId,
      customerId: selectedCustomerId
    }, '', window.location.pathname);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSelectRma = (id: string) => {
    setSelectedRmaId(id);
    if (currentView !== 'customerDetail') {
      setCurrentView('rmaDetail');
    }
  };

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setCurrentView('customerDetail');
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
    if (selectedCustomerId) setCurrentView('customerDetail');
    else setCurrentView('rmaList');
  }

  const handleNavigate = (view: 'rma' | 'customer') => {
    setSelectedRmaId(null);
    setSelectedCustomerId(null);
    if (view === 'rma') setCurrentView('rmaList');
    if (view === 'customer') setCurrentView('customerList');
  }

  const isRmaActive = currentView === 'rmaList' || (currentView === 'rmaDetail' && !selectedCustomerId);
  // const isCustomerActive = currentView.startsWith('customer') || (currentView === 'rmaDetail' && selectedCustomerId);

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [];

    // Always show Home first, except on dashboard
    if (currentView !== 'dashboard') {
      items.push({ label: 'Home', onClick: () => setCurrentView('dashboard'), active: false });
    }

    if (currentView === 'dashboard') {
      items.push({ label: 'Dashboard', active: true });
    } else if (currentView === 'rmaList' || (currentView === 'rmaDetail' && !selectedCustomerId)) {
      items.push({ label: 'RMAs', onClick: () => handleNavigate('rma'), active: currentView === 'rmaList' });
      if (currentView === 'rmaDetail' && selectedRma) {
        items.push({ label: `RMA #${selectedRma.id}`, active: true });
      }
    } else if (currentView.startsWith('customer') || (currentView === 'rmaDetail' && selectedCustomerId)) {
      items.push({ label: 'Customers', onClick: () => handleNavigate('customer'), active: currentView === 'customerList' });
      if (selectedCustomer) {
        items.push({
          label: selectedCustomer.name,
          onClick: () => setCurrentView('customerDetail'),
          active: currentView === 'customerDetail' && !selectedRmaId
        });
        if (currentView === 'rmaDetail' && selectedRma) {
          items.push({ label: `RMA #${selectedRma.id}`, active: true });
        }
      }
    }
    return items;
  }

  const renderView = () => {
    switch (currentView) {
      case 'rmaDetail':
        return selectedRma ? <RmaDetailView rma={selectedRma} onBack={handleBackFromRmaDetail} onStatusUpdate={handleStatusUpdate} onNewCycle={handleOpenNewCycleModal} /> : <div>RMA not found</div>;
      case 'customerList':
        return <CustomerListView
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
        />;
      case 'customerDetail':
        if (selectedRmaId) {
          const rmaForDetail = rmas.find(r => r.id === selectedRmaId);
          return rmaForDetail ? <RmaDetailView rma={rmaForDetail} onBack={handleBackFromRmaDetail} onStatusUpdate={handleStatusUpdate} onNewCycle={handleOpenNewCycleModal} /> : <div>RMA not found</div>;
        }
        return selectedCustomer ? <CustomerDetailView customer={selectedCustomer} rmas={rmas.filter(r => r.customer.id === selectedCustomer.id)} onBack={() => setCurrentView('customerList')} onSelectRma={handleSelectRma} onNewRma={handleOpenNewRmaForCustomer} /> : <div>Customer not found</div>;
      case 'dashboard':
        return <Dashboard
          rmas={rmas}
          customers={customers}
          onNavigateToRmas={() => setCurrentView('rmaList')}
          onNavigateToCustomers={() => setCurrentView('customerList')}
          onNewRma={openNewRmaModal}
        />;
      case 'rmaList':
      default:
        return <RmaList
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
        />;
    }
  };

  const getActiveView = (): 'dashboard' | 'rma' | 'customer' => {
    if (currentView === 'dashboard') return 'dashboard';
    if (currentView === 'rmaList' || (currentView === 'rmaDetail' && !selectedCustomerId)) return 'rma';
    return 'customer';
  };

  return (
    <SidebarLayout
      activeView={getActiveView()}
      onNavigate={handleNavigate}
      onGoHome={() => setCurrentView('dashboard')}
    >
      <Toaster position="top-right" toastOptions={{ className: 'glass !rounded-lg !border-slate-200 !text-slate-800 !shadow-lg', duration: 4000 }} />

      {/* Breadcrumbs Section */}
      <div className="mb-6">
        <Breadcrumbs items={getBreadcrumbs()} />
      </div>

      {renderView()}

      {isRmaModalOpen && <RmaFormModal isOpen={isRmaModalOpen} initialData={rmaToEdit} customers={customers} onSave={handleSaveRma} onClose={closeRmaModal} preselectedCustomerId={preselectedCustomerIdForRma} onAddNewCustomer={() => setIsCustomerModalOpen(true)} lastCreatedCustomerId={lastCreatedCustomerId} />}
      {isNewCycleModalOpen && rmaForNewCycle && <NewCycleModal rma={rmaForNewCycle} onSave={handleSaveNewCycle} onClose={() => setIsNewCycleModalOpen(false)} />}
      {isCustomerModalOpen && <CustomerFormModal onSave={handleSaveCustomer} onClose={() => setIsCustomerModalOpen(false)} customer={customerToEdit} />}
    </SidebarLayout>
  );
};

export default App;
