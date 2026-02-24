export enum RmaStatus {
  PENDING = 'Pending',
  RECEIVED = 'Received',
  IN_REPAIR = 'In Repair',
  REPAIRED = 'Repaired',
  SHIPPED = 'Shipped',
  CLOSED = 'Closed',
}

export interface StatusHistoryEvent {
  status: RmaStatus;
  date: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

export interface Device {
  articleNumber: string;
  serialNumber: string;
  quantity: number;
}

export interface ServiceCycle {
  deviceSerialNumber: string; // Link cycle to a specific device in the RMA
  status: RmaStatus;
  statusDate: string; // This is the last update date for this cycle
  creationDate: string; // The date this specific ticket was created
  issueDescription: string;
  accessoriesIncluded?: string;
  history: StatusHistoryEvent[];
}

export interface Rma {
  id: string;
  customer: Customer | null; // Can be null if customer was deleted
  customerName?: string; // Preserved when customer deleted
  customerEmail?: string; // Preserved when customer deleted
  customerPhone?: string; // Preserved when customer deleted
  devices: Device[]; // Changed from 'device' to 'devices'
  creationDate: string;
  lastUpdateDate: string;
  serviceCycles: ServiceCycle[];
  dateOfIncident: string;
  dateOfReport: string;
  attachment?: string;
  isInjuryRelated: boolean;
  injuryDetails?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: {
    name: string;
    email: string;
  };
  action: string;
  entity: string;
  entityId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}