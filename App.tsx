import React, { useState, useMemo } from 'react';
import { Rma, Customer, RmaStatus, ServiceCycle } from './types';
import { MOCK_RMAS, MOCK_CUSTOMERS } from './constants';
import RmaList from './components/RmaList';
import RmaDetailView from './components/RmaDetailView';
import CustomerListView from './components/CustomerListView';
import CustomerDetailView from './components/CustomerDetailView';
import RmaFormModal from './components/RmaFormModal';
import NewCycleModal from './components/NewCycleModal';
import CustomerFormModal from './components/CustomerFormModal';
import { WrenchScrewdriverIcon, BuildingOffice2Icon } from './components/icons';

type View = 'rmaList' | 'rmaDetail' | 'customerList' | 'customerDetail';

export interface RmaFilters {
  searchTerm: string;
  statuses: RmaStatus[];
  customerId: string;
  dateFrom: string;
  dateTo: string;
}

const App: React.FC = () => {
  const [rmas, setRmas] = useState<Rma[]>(MOCK_RMAS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  
  const [currentView, setCurrentView] = useState<View>('rmaList');
  const [selectedRmaId, setSelectedRmaId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const [isRmaModalOpen, setIsRmaModalOpen] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  
  const [rmaToEdit, setRmaToEdit] = useState<Rma | undefined>(undefined);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | undefined>(undefined);
  const [rmaForNewCycle, setRmaForNewCycle] = useState<Rma | null>(null);
  const [preselectedCustomerIdForRma, setPreselectedCustomerIdForRma] = useState<string | undefined>(undefined);
  const [lastCreatedCustomerId, setLastCreatedCustomerId] = useState<string | null>(null);


  const [filters, setFilters] = useState<RmaFilters>({
    searchTerm: '',
    statuses: [],
    customerId: '',
    dateFrom: '',
    dateTo: '',
  });

  const handleSelectRma = (id: string) => {
    setSelectedRmaId(id);
    if(currentView === 'customerDetail') {
      // Keep customerDetail view
    } else {
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

  const handleSaveRma = (rmaData: Omit<Rma, 'id' | 'creationDate' | 'lastUpdateDate' | 'serviceCycles'> & {serviceCycles: Omit<Rma['serviceCycles'][0], 'status' | 'statusDate' | 'creationDate' | 'deviceSerialNumber'>[]}, id?: string) => {
    if (id) {
      // Edit
      setRmas(rmas.map(r => {
        if (r.id === id) {
           return {
            ...r,
            customer: rmaData.customer,
            devices: rmaData.devices,
            lastUpdateDate: new Date().toISOString(),
             // Note: More complex logic would be needed to edit individual service cycles.
             // This implementation focuses on editing customer/device info.
          };
        }
        return r;
      }));
    } else {
      // Create
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const datePart = `${year}${month}${day}`;
      const randomPart = Math.random().toString(16).slice(2, 6).toUpperCase();
      const newRmaId = `RMA-${datePart}-${randomPart}`;
      
      const nowISO = now.toISOString();
      
      const newServiceCycles: ServiceCycle[] = rmaData.devices.map((device, index) => ({
          deviceSerialNumber: device.serialNumber,
          status: RmaStatus.PENDING,
          statusDate: nowISO,
          creationDate: nowISO,
          issueDescription: rmaData.serviceCycles[index]?.issueDescription || 'N/A',
          accessoriesIncluded: rmaData.serviceCycles[index]?.accessoriesIncluded || '',
      }));

      const newRma: Rma = {
        id: newRmaId,
        customer: rmaData.customer,
        devices: rmaData.devices,
        creationDate: nowISO,
        lastUpdateDate: nowISO,
        serviceCycles: newServiceCycles,
      };
      setRmas([newRma, ...rmas]);
    }
    closeRmaModal();
  };
  
  const handleSaveCustomer = (customerData: Omit<Customer, 'id'>, id?: string) => {
    if (id) {
        // Edit
        setCustomers(customers.map(c => c.id === id ? { ...c, ...customerData } : c));
    } else {
        // Create
        const newCustomer: Customer = {
            ...customerData,
            id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        };
        setCustomers([newCustomer, ...customers]);
        setLastCreatedCustomerId(newCustomer.id);
    }
    setIsCustomerModalOpen(false);
    setCustomerToEdit(undefined);
  };

  const handleSaveNewCycle = (rmaId: string, deviceSerialNumber: string, issueDescription: string, accessoriesIncluded: string) => {
    setRmas(rmas.map(r => {
      if (r.id === rmaId) {
        const now = new Date().toISOString();
        return {
          ...r,
          lastUpdateDate: now,
          serviceCycles: [
            ...r.serviceCycles,
            {
              deviceSerialNumber: deviceSerialNumber,
              status: RmaStatus.PENDING,
              statusDate: now,
              creationDate: now,
              issueDescription,
              accessoriesIncluded,
            }
          ]
        }
      }
      return r;
    }));
    setIsNewCycleModalOpen(false);
    setRmaForNewCycle(null);
  };
  
  const handleStatusUpdate = (rmaId: string, cycleCreationDate: string, deviceSerialNumber: string, newStatus: RmaStatus, notes: string) => {
    setRmas(rmas.map(r => {
      if (r.id === rmaId) {
        const newCycles = r.serviceCycles.map(cycle => {
           if (cycle.deviceSerialNumber === deviceSerialNumber && cycle.creationDate === cycleCreationDate) {
              const noteText = notes.trim() || 'Status updated.';
              const newLogEntry = `[${newStatus} - ${new Date().toLocaleString()}] ${noteText}`;
              return {
                ...cycle,
                status: newStatus,
                statusDate: new Date().toISOString(),
                resolutionNotes: (cycle.resolutionNotes ? `${cycle.resolutionNotes}\n\n${newLogEntry}` : newLogEntry),
              };
           }
           return cycle;
        });
        
        return {
          ...r,
          lastUpdateDate: new Date().toISOString(),
          serviceCycles: newCycles,
        }
      }
      return r;
    }));
  };

  const openNewRmaModal = () => {
    setRmaToEdit(undefined);
    setPreselectedCustomerIdForRma(undefined);
    setIsRmaModalOpen(true);
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
  
  const filteredRmas = useMemo(() => {
    return rmas.filter(rma => {
      // For filtering, we check the status of ANY service cycle. A more complex rule could be applied.
      const hasMatchingStatus = rma.serviceCycles.some(cycle => filters.statuses.includes(cycle.status));
      if (filters.statuses.length > 0 && !hasMatchingStatus) {
        return false;
      }
  
      if (filters.customerId && rma.customer.id !== filters.customerId) {
        return false;
      }
  
      const creationDate = new Date(rma.creationDate);
      if (filters.dateFrom && creationDate < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        if (creationDate > toDate) {
          return false;
        }
      }
  
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        const hasMatchingDevice = rma.devices.some(d => d.serialNumber.toLowerCase().includes(term));
        if (
          !rma.id.toLowerCase().includes(term) &&
          !rma.customer.name.toLowerCase().includes(term) &&
          !hasMatchingDevice
        ) {
          return false;
        }
      }
      
      return true;
    });
  }, [rmas, filters]);


  const selectedRma = rmas.find(r => r.id === selectedRmaId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleBackFromRmaDetail = () => {
    setSelectedRmaId(null);
    if(selectedCustomerId) {
        setCurrentView('customerDetail');
    } else {
        setCurrentView('rmaList');
    }
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
        return selectedRma ? <RmaDetailView rma={selectedRma} onBack={handleBackFromRmaDetail} onStatusUpdate={handleStatusUpdate} onNewCycle={(rma) => { setRmaForNewCycle(rma); setIsNewCycleModalOpen(true); }} /> : <div>RMA not found</div>;
      case 'customerList':
        return <CustomerListView customers={customers} onSelectCustomer={handleSelectCustomer} onAddCustomer={openNewCustomerModal} />;
      case 'customerDetail':
        if (selectedRmaId) {
             const rmaForDetail = rmas.find(r => r.id === selectedRmaId);
             return rmaForDetail ? <RmaDetailView rma={rmaForDetail} onBack={handleBackFromRmaDetail} onStatusUpdate={handleStatusUpdate} onNewCycle={(rma) => { setRmaForNewCycle(rma); setIsNewCycleModalOpen(true); }} /> : <div>RMA not found</div>;
        }
        return selectedCustomer ? <CustomerDetailView customer={selectedCustomer} rmas={rmas.filter(r => r.customer.id === selectedCustomer.id)} onBack={() => setCurrentView('customerList')} onSelectRma={handleSelectRma} onNewRma={handleOpenNewRmaForCustomer} /> : <div>Customer not found</div>;
      case 'rmaList':
      default:
        return <RmaList rmas={filteredRmas} customers={customers} filters={filters} onFiltersChange={setFilters} onSelectRma={handleSelectRma} onNewRma={openNewRmaModal} />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                 <img src="https://avanamedical.com/wp-content/themes/avana/assets/images/logo.png" alt="Avana Medical" className="h-8 w-auto" />
              </div>
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8" aria-label="Global">
                <button onClick={() => handleNavigate('rmaList')} className={`group inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isRmaActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
                  <WrenchScrewdriverIcon className={`mr-2 h-5 w-5 ${isRmaActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  RMAs
                </button>
                 <button onClick={() => handleNavigate('customerList')} className={`group inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${isCustomerActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}>
                  <BuildingOffice2Icon className={`mr-2 h-5 w-5 ${isCustomerActive ? 'text-primary-500' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  Customers
                </button>
              </nav>
            </div>
          </div>
        </div>
         <nav className="sm:hidden border-t border-slate-200" aria-label="Mobile">
            <div className="flex justify-around">
                <button onClick={() => handleNavigate('rmaList')} className={`flex-1 py-3 text-center inline-flex justify-center items-center gap-2 text-sm font-medium border-b-4 ${isRmaActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}>
                    <WrenchScrewdriverIcon className="w-5 h-5" />
                    RMAs
                </button>
                <button onClick={() => handleNavigate('customerList')} className={`flex-1 py-3 text-center inline-flex justify-center items-center gap-2 text-sm font-medium border-b-4 ${isCustomerActive ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500'}`}>
                    <BuildingOffice2Icon className="w-5 h-5" />
                    Customers
                </button>
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