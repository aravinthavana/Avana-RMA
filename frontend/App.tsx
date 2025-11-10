import React, { useState, useMemo, FC } from 'react';
import { Rma, Customer, RmaStatus, ServiceCycle, Device } from './types';
import { MOCK_RMAS, MOCK_CUSTOMERS } from './constants';
import RmaList from './components/RmaList';
import RmaDetailView from './components/RmaDetailView';
import CustomerListView from './components/CustomerListView';
import CustomerDetailView from './components/CustomerDetailView';
import RmaFormModal from './components/RmaFormModal';
import NewCycleModal from './components/NewCycleModal';
import CustomerFormModal from './components/CustomerFormModal';
import { WrenchScrewdriverIcon, BuildingOffice2Icon } from './components/icons';

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
  // State for managing RMAs and Customers. Initialized with mock data.
  const [rmas, setRmas] = useState<Rma[]>(MOCK_RMAS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  
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

  // State for managing the context between modals, e.g., pre-selecting a customer.
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

  /**
   * Handles selecting an RMA.
   * Switches the view to the RMA detail view.
   * @param id The ID of the RMA to select.
   */
  const handleSelectRma = (id: string) => {
    setSelectedRmaId(id);
    // If we are already in the customer detail view, we stay there to show the RMA within that context.
    if(currentView !== 'customerDetail') {
       setCurrentView('rmaDetail');
    }
  };

  /**
   * Handles selecting a customer.
   * Switches the view to the customer detail view.
   * @param id The ID of the customer to select.
   */
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setCurrentView('customerDetail');
  };
  
  /**
   * Closes the RMA form modal and resets related state.
   */
  const closeRmaModal = () => {
    setIsRmaModalOpen(false);
    setRmaToEdit(undefined);
    setPreselectedCustomerIdForRma(undefined);
    setLastCreatedCustomerId(null);
  };

  /**
   * Saves an RMA (creates a new one or updates an existing one).
   * @param rmaData The data for the RMA to save.
   * @param id The ID of the RMA to update (if editing).
   */
  const handleSaveRma = (rmaData: Omit<Rma, 'id' | 'creationDate' | 'lastUpdateDate'>, id?: string) => {
    if (id) {
      // Update existing RMA
      setRmas(rmas.map(r => r.id === id ? { ...r, ...rmaData, lastUpdateDate: new Date().toISOString() } : r));
    } else {
      // Create new RMA
      const now = new Date();
      const newRma: Rma = {
        ...rmaData,
        id: `RMA-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
        creationDate: now.toISOString(),
        lastUpdateDate: now.toISOString(),
        serviceCycles: rmaData.devices.map((device: Device) => ({
          deviceSerialNumber: device.serialNumber,
          status: RmaStatus.PENDING,
          statusDate: now.toISOString(),
          creationDate: now.toISOString(),
          issueDescription: 'Initial registration',
          accessoriesIncluded: '',
          history: [{
            status: RmaStatus.PENDING,
            date: now.toISOString(),
            notes: 'RMA created and device registered.'
          }]
        })),
      };
      setRmas([newRma, ...rmas]);
    }
    closeRmaModal();
  };
  
  /**
   * Saves a customer (creates a new one or updates an existing one).
   * @param customerData The data for the customer to save.
   * @param id The ID of the customer to update (if editing).
   */
  const handleSaveCustomer = (customerData: Omit<Customer, 'id'>, id?: string) => {
    if (id) {
        // Update existing customer
        setCustomers(customers.map(c => c.id === id ? { ...c, ...customerData } : c));
    } else {
        // Create new customer
        const newCustomer: Customer = {
            ...customerData,
            id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        };
        setCustomers([newCustomer, ...customers]);
        setLastCreatedCustomerId(newCustomer.id); // Used to auto-select the new customer in the RMA form
    }
    setIsCustomerModalOpen(false);
    setCustomerToEdit(undefined);
  };

  /**
   * Adds a new service cycle to an existing RMA.
   * @param rmaId The ID of the RMA to add the cycle to.
   * @param deviceSerialNumber The serial number of the device for the new cycle.
   * @param issueDescription The description of the issue for the new cycle.
   * @param accessoriesIncluded A list of accessories included.
   */
  const handleSaveNewCycle = (rmaId: string, deviceSerialNumber: string, issueDescription: string, accessoriesIncluded: string) => {
    setRmas(rmas.map(r => {
      if (r.id === rmaId) {
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
        return { ...r, lastUpdateDate: now, serviceCycles: [...r.serviceCycles, newCycle] };
      }
      return r;
    }));
    setIsNewCycleModalOpen(false);
    setRmaForNewCycle(null);
  };
  
  /**
   * Updates the status of a specific service cycle within an RMA.
   * @param rmaId The ID of the RMA.
   * @param cycleCreationDate The creation date of the cycle to identify it.
   * @param deviceSerialNumber The serial number of the device in the cycle.
   * @param newStatus The new status to set.
   * @param notes Notes associated with the status update, which are logged in `resolutionNotes`.
   */
  const handleStatusUpdate = (rmaId: string, cycleCreationDate: string, deviceSerialNumber: string, newStatus: RmaStatus, notes: string) => {
    setRmas(rmas.map(r => {
      if (r.id === rmaId) {
        const newCycles = r.serviceCycles.map(cycle => {
           if (cycle.deviceSerialNumber === deviceSerialNumber && cycle.creationDate === cycleCreationDate) {
              const noteText = notes.trim() || 'Status updated.';
              const newHistoryEvent = { status: newStatus, date: new Date().toISOString(), notes: noteText };
              return {
                ...cycle,
                status: newStatus,
                statusDate: newHistoryEvent.date,
                history: [...cycle.history, newHistoryEvent],
              };
           }
           return cycle;
        });
        return { ...r, lastUpdateDate: new Date().toISOString(), serviceCycles: newCycles };
      }
      return r;
    }));
  };

  /** Opens the modal to create a new RMA. */
  const openNewRmaModal = () => {
    setRmaToEdit(undefined);
    setPreselectedCustomerIdForRma(undefined);
    setIsRmaModalOpen(true);
  };
  
  /** 
   * Opens the modal to edit an existing RMA.
   * @param rma The RMA object to edit.
   */
  const handleEditRma = (rma: Rma) => {
    setRmaToEdit(rma);
    setIsRmaModalOpen(true);
  };
  
  /**
   * Deletes an RMA from the state.
   * @param id The ID of the RMA to delete.
   */
  const handleDeleteRma = (id: string) => {
      setRmas(rmas.filter(r => r.id !== id));
  };
  
  /**
   * Opens the new RMA modal with a customer pre-selected.
   * @param customerId The ID of the customer to pre-select.
   */
  const handleOpenNewRmaForCustomer = (customerId: string) => {
    setRmaToEdit(undefined);
    setPreselectedCustomerIdForRma(customerId);
    setIsRmaModalOpen(true);
  };

  /** Opens the modal to create a new customer. */
  const openNewCustomerModal = () => {
    setCustomerToEdit(undefined);
    setIsCustomerModalOpen(true);
  };
  
  /**
   * Opens the modal to edit an existing customer.
   * @param customer The customer object to edit.
   */
  const handleEditCustomer = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsCustomerModalOpen(true);
  };

  /**
   * Deletes a customer from the state.
   * @param id The ID of the customer to delete.
   */
  const handleDeleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };
  
  /**
   * A memoized list of RMAs filtered by the current filter settings.
   */
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

  // Find the currently selected RMA and Customer objects from their IDs.
  const selectedRma = rmas.find(r => r.id === selectedRmaId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  /**
   * Handles navigation back from the RMA detail view.
   * Returns to the customer detail view if a customer was selected, otherwise to the RMA list.
   */
  const handleBackFromRmaDetail = () => {
    setSelectedRmaId(null);
    if(selectedCustomerId) setCurrentView('customerDetail');
    else setCurrentView('rmaList');
  }

  /**
   * Handles main navigation between top-level views (RMAs and Customers).
   * @param view The view to navigate to.
   */
  const handleNavigate = (view: View) => {
    setSelectedRmaId(null);
    setSelectedCustomerId(null);
    setCurrentView(view);
  }

  // Determine which main navigation tab is active based on the current view.
  const isRmaActive = currentView === 'rmaList' || (currentView === 'rmaDetail' && !selectedCustomerId);
  const isCustomerActive = currentView.startsWith('customer') || (currentView === 'rmaDetail' && selectedCustomerId);

  /**
   * Renders the main content area based on the current view state.
   */
  const renderView = () => {
    switch (currentView) {
      case 'rmaDetail':
        return selectedRma ? <RmaDetailView rma={selectedRma} onBack={handleBackFromRmaDetail} onStatusUpdate={handleStatusUpdate} onNewCycle={(rma) => { setRmaForNewCycle(rma); setIsNewCycleModalOpen(true); }} /> : <div>RMA not found</div>;
      case 'customerList':
        return <CustomerListView customers={customers} onSelectCustomer={handleSelectCustomer} onAddCustomer={openNewCustomerModal} onEditCustomer={handleEditCustomer} onDeleteCustomer={handleDeleteCustomer} />;
      case 'customerDetail':
        if (selectedRmaId) {
             // If an RMA is selected within the customer detail context, show that RMA's detail.
             const rmaForDetail = rmas.find(r => r.id === selectedRmaId);
             return rmaForDetail ? <RmaDetailView rma={rmaForDetail} onBack={handleBackFromRmaDetail} onStatusUpdate={handleStatusUpdate} onNewCycle={(rma) => { setRmaForNewCycle(rma); setIsNewCycleModalOpen(true); }} /> : <div>RMA not found</div>;
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
        {/* Top navigation bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center"><img src="https://avanamedical.com/wp-content/themes/avana/assets/images/logo.png" alt="Avana Medical" className="h-8 w-auto" /></div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Global">
                <button onClick={() => handleNavigate('rmaList')} className={`group inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isRmaActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}><WrenchScrewdriverIcon className={`mr-2 h-5 w-5 ${isRmaActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'}`} />RMAs</button>
                <button onClick={() => handleNavigate('customerList')} className={`group inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isCustomerActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}><BuildingOffice2Icon className={`mr-2 h-5 w-5 ${isCustomerActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'}`} />Customers</button>
              </nav>
            </div>
          </div>
        </div>
        {/* Mobile navigation */}
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

      {/* Global Modals */}
      {isRmaModalOpen && <RmaFormModal customers={customers} onSave={handleSaveRma} onClose={closeRmaModal} rma={rmaToEdit} preselectedCustomerId={preselectedCustomerIdForRma} onAddNewCustomer={() => setIsCustomerModalOpen(true)} lastCreatedCustomerId={lastCreatedCustomerId} />}
      {isNewCycleModalOpen && rmaForNewCycle && <NewCycleModal rma={rmaForNewCycle} onSave={handleSaveNewCycle} onClose={() => setIsNewCycleModalOpen(false)} />}
      {isCustomerModalOpen && <CustomerFormModal onSave={handleSaveCustomer} onClose={() => setIsCustomerModalOpen(false)} customer={customerToEdit} />}
    </div>
  );
};

export default App;
