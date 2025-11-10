export enum RmaStatus {
  PENDING = 'Pending',
  RECEIVED = 'Received',
  IN_REPAIR = 'In Repair',
  REPAIRED = 'Repaired',
  SHIPPED = 'Shipped',
  CLOSED = 'Closed',
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
  model: string;
  partNumber: string;
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
  resolutionNotes?: string;
}

export interface Rma {
  id: string;
  customer: Customer;
  devices: Device[]; // Changed from 'device' to 'devices'
  creationDate: string;
  lastUpdateDate: string;
  serviceCycles: ServiceCycle[];
  dateOfIncident: string;
  dateOfReport: string;
  attachment?: string;
}