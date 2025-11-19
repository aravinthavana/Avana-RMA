import React, { useState, useMemo, FC, useEffect } from 'react';
import { Rma, Customer, RmaStatus, ServiceCycle, Device } from './types';
import RmaList from './components/RmaList';
import RmaDetailView from './components/RmaDetailView';
import CustomerListView from './components/CustomerListView';
import CustomerDetailView from './components/CustomerDetailView';
import RmaFormModal from './components/RmaFormModal';
import NewCycleModal from './components/NewCycleModal';
import CustomerFormModal from './components/CustomerFormModal';
import { WrenchScrewdriverIcon, BuildingOffice2Icon } from './components/icons';

// Helper to construct backend URL dynamically based on the environment
const getApiBaseUrl = () => {
    const { protocol, hostname } = window.location;
    if (hostname.includes('cloudworkstations.dev')) {
        // In Cloud Workstations, the backend is on a similar URL, but with port 3001
        return `${protocol}//${hostname.replace('3000-', '3001-')}`;
    } else {
        // Default to localhost for local development
        return 'http://localhost:3001';
    }
};
const API_BASE_URL = getApiBaseUrl();


// Defines the possible main views the user can navigate to.
type View = 'rmaList' | 'rmaDetail' | 'customerList' | 'customerDetail';

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
  // State for managing RMAs and Customers.
  const [rmas, setRmas] = useState<Rma[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // State for controlling the current view and selected items.
  const [currentView, setCurrentView] = useState<View>('rmaList');
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
  const [lastCreatedCustomerId, setLastCreatedCustomerId] = useState<string | null>(null);

  // State for the filters applied to the RMA list.
  const [filters, setFilters] = useState<RmaFilters>({
    searchTerm: '',
    statuses: [],
    customerId: '',
    dateFrom: '',
    dateTo: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersResponse, rmasResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/customers`, { credentials: 'include' }),
          fetch(`${API_BASE_URL}/api/rmas`, { credentials: 'include' })
        ]);

        if (!customersResponse.ok || !rmasResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const customersData = await customersResponse.json();
        const rmasData = await rmasResponse.json();

        setCustomers(customersData);
        setRmas(rmasData);

      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSelectRma = (id: string) => {
    setSelectedRmaId(id);
    if(currentView !== 'customerDetail') {
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

  const handleSaveRma = async (rmaData: any, id?: string) => {
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
            const initialCycles: ServiceCycle[] = payload.serviceCycles.map((cycle: any) => ({
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
        
        if (id) {
            setRmas(rmas.map(r => r.id === id ? savedRma : r));
        } else {
             setRmas(prevRmas => [savedRma, ...prevRmas]);
        }

    } catch (error) {
        console.error('Error saving RMA:', error);
    }
    closeRmaModal();
  };
  
  const handleSaveCustomer = async (customerData: Omit<Customer, 'id'>, id?: string) => {
    try {
        let response;
        if (id) {
            response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData),
                credentials: 'include'
            });
        } else {
            response = await fetch(`${API_BASE_URL}/api/customers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerData),
                credentials: 'include'
            });
        }

        if (!response.ok) {
            throw new Error(`Failed to save customer.`);
        }

        const savedCustomer = await response.json();

        if (id) {
            setCustomers(customers.map(c => c.id === id ? savedCustomer : c));
            setRmas(rmas.map(r => r.customer.id === id ? { ...r, customer: savedCustomer } : r));
        } else {
            setCustomers([savedCustomer, ...customers]);
            setLastCreatedCustomerId(savedCustomer.id);
        }

    } catch (error) {
        console.error('Error saving customer:', error);
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
  
  const handleStatusUpdate = (rmaId: string, cycleCreationDate: string, deviceSerialNumber: string, newStatus: RmaStatus, notes: string) => {
    const rmaToUpdate = rmas.find(r => r.id === rmaId);
    if (!rmaToUpdate) return;

    const now = new Date().toISOString();
    const noteText = notes.trim() || 'Status updated.';
    const newHistoryEvent = { status: newStatus, date: now, notes: noteText };

    const updatedCycles = rmaToUpdate.serviceCycles.map(cycle => {
       if (cycle.deviceSerialNumber === deviceSerialNumber && cycle.creationDate === cycleCreationDate) {
          return {
            ...cycle,
            status: newStatus,
            statusDate: now,
            history: [...cycle.history, newHistoryEvent],
          };
       }
       return cycle;
    });
    
    const updatedRma = {
        ...rmaToUpdate,
        lastUpdateDate: now,
        serviceCycles: updatedCycles
    }

    handleSaveRma(updatedRma, rmaId);
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
        const response = await fetch(`${API_BASE_URL}/api/rmas/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete RMA');
        }

        setRmas(rmas.filter(r => r.id !== id));

    } catch (error) {
        console.error('Error deleting RMA:', error);
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

  const handleDeleteCustomer = async (id: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/customers/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to delete customer');
        }

        setCustomers(customers.filter(c => c.id !== id));
        setRmas(rmas.filter(r => r.customer.id !== id));
        
    } catch (error) {
        console.error('Error deleting customer:', error);
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
    if(selectedCustomerId) setCurrentView('customerDetail');
    else setCurrentView('rmaList');
  }

  const handleNavigate = (view: View) => {
    setSelectedRmaId(null);
    setSelectedCustomerId(null);
    setCurrentView(view);
  }

  const isRmaActive = currentView === 'rmaList' || (currentView === 'rmaDetail' && !selectedCustomerId);
  const isCustomerActive = currentView.startsWith('customer') || (currentView === 'rmaDetail' && selectedCustomerId);

  const renderView = () => {
    switch (currentView) {
      case 'rmaDetail':
        return selectedRma ? <RmaDetailView rma={selectedRma} onBack={handleBackFromRmaDetail} onStatusUpdate={handleStatusUpdate} onNewCycle={handleOpenNewCycleModal} /> : <div>RMA not found</div>;
      case 'customerList':
        return <CustomerListView customers={customers} onSelectCustomer={handleSelectCustomer} onAddCustomer={openNewCustomerModal} onEditCustomer={handleEditCustomer} onDeleteCustomer={handleDeleteCustomer} />;
      case 'customerDetail':
        if (selectedRmaId) {
             const rmaForDetail = rmas.find(r => r.id === selectedRmaId);
             return rmaForDetail ? <RmaDetailView rma={rmaForDetail} onBack={handleBackFromRmaDetail} onStatusUpdate={handleStatusUpdate} onNewCycle={handleOpenNewCycleModal} /> : <div>RMA not found</div>;
        }
        return selectedCustomer ? <CustomerDetailView customer={selectedCustomer} rmas={rmas.filter(r => r.customer.id === selectedCustomer.id)} onBack={() => setCurrentView('customerList')} onSelectRma={handleSelectRma} onNewRma={handleOpenNewRmaForCustomer} /> : <div>Customer not found</div>;
      case 'rmaList':
      default:
        return <RmaList rmas={filteredRmas} customers={customers} filters={filters} onFiltersChange={setFilters} onSelectRma={handleSelectRma} onNewRma={openNewRmaModal} onEditRma={handleEditRma} onDeleteRma={handleDeleteRma} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="shrink-0 flex items-center"><img src="https://avanamedical.com/wp-content/themes/avana/assets/images/logo.png" alt="Avana Medical" className="h-8 w-auto" /></div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Global">
                <button onClick={() => handleNavigate('rmaList')} className={`group inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isRmaActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}><WrenchScrewdriverIcon className={`mr-2 h-5 w-5 ${isRmaActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'}`} />RMAs</button>
                <button onClick={() => handleNavigate('customerList')} className={`group inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isCustomerActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}><BuildingOffice2Icon className={`mr-2 h-5 w-5 ${isCustomerActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'}`} />Customers</button>
              </nav>
            </div>
          </div>
        </div>
        <nav className="sm:hidden border-t border-slate-200" aria-label="Mobile">
            <div className="flex justify-around">
                <button onClick={() => handleNavigate('rmaList')} className={`flex-1 py-3 text-center inline-flex justify-center items-center gap-2 text-sm font-medium border-b-4 ${isRmaActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}><WrenchScrewdriverIcon className="w-5 h-5" />RMAs</button>
                <button onClick={() => handleNavigate('customerList')} className={`flex-1 py-3 text-center inline-flex justify-center items-center gap-2 text-sm font-medium border-b-4 ${isCustomerActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}><BuildingOffice2Icon className="w-5 h-5" />Customers</button>
            </div>
        </nav>
      </header>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {renderView()}
        </div>
      </main>

      {isRmaModalOpen && <RmaFormModal customers={customers} onSave={handleSaveRma} onClose={closeRmaModal} rma={rmaToEdit} preselectedCustomerId={preselectedCustomerIdForRma} onAddNewCustomer={() => setIsCustomerModalOpen(true)} lastCreatedCustomerId={lastCreatedCustomerId} />}
      {isNewCycleModalOpen && rmaForNewCycle && <NewCycleModal rma={rmaForNewCycle} onSave={handleSaveNewCycle} onClose={() => setIsNewCycleModalOpen(false)} />}
      {isCustomerModalOpen && <CustomerFormModal onSave={handleSaveCustomer} onClose={() => setIsCustomerModalOpen(false)} customer={customerToEdit} />}
    </div>
  );
};

export default App;
