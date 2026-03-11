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

export interface HistoryEvent {
    status: string;
    date: string;
    notes: string;
}

export interface ServiceCycle {
    id: number;
    deviceSerialNumber: string;
    status: string;
    creationDate: string;
    statusDate: string;
    issueDescription: string;
    accessoriesIncluded: string;
    history: HistoryEvent[];
}

export interface RMA {
    id: string;
    creationDate: string;
    lastUpdateDate: string;
    dateOfIncident: string;
    dateOfReport: string;
    attachment: string | null;
    customer: Customer;
    devices: Device[];
    serviceCycles: ServiceCycle[];
}
