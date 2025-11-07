import { Rma, Customer, RmaStatus } from './types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'General Hospital',
    contactPerson: 'Dr. Sarah Connor',
    email: 'sconnor@genhos.com',
    phone: '555-123-4567',
    address: '123 Medical Center Dr\nLos Angeles, CA 90001',
  },
  {
    id: 'CUST-002',
    name: 'City Clinic',
    contactPerson: 'John Smith',
    email: 'jsmith@cityclinic.org',
    phone: '555-987-6543',
    address: '456 Health Plaza\nNew York, NY 10002',
  },
];

export const MOCK_RMAS: Rma[] = [
  {
    id: 'RMA-240715-9F3B',
    customer: MOCK_CUSTOMERS[0],
    devices: [{
      model: 'VitalSign Monitor 5000',
      serialNumber: 'VSM5K-A9876',
    }],
    creationDate: '2024-07-15T10:30:00Z',
    lastUpdateDate: '2024-07-18T14:00:00Z',
    serviceCycles: [
      {
        deviceSerialNumber: 'VSM5K-A9876',
        status: RmaStatus.IN_REPAIR,
        creationDate: '2024-07-15T10:30:00Z',
        statusDate: '2024-07-18T14:00:00Z',
        issueDescription: 'Device screen is flickering and occasionally goes blank. Issue started after a software update.',
        accessoriesIncluded: 'Main unit, power adapter, ECG leads',
        resolutionNotes: `[${RmaStatus.RECEIVED} - 7/17/2024, 9:05:12 AM] Unit received and checked in.\n\n[${RmaStatus.IN_REPAIR} - 7/18/2024, 2:00:00 PM] Technician is currently diagnosing the main board. Suspected faulty capacitor.`,
      },
    ],
  },
  {
    id: 'RMA-240710-A1E6',
    customer: MOCK_CUSTOMERS[1],
    devices: [{
      model: 'Infusion Pump Pro',
      serialNumber: 'IPP-B1234',
    }],
    creationDate: '2024-07-10T09:00:00Z',
    lastUpdateDate: '2024-07-20T11:25:00Z',
    serviceCycles: [
      {
        deviceSerialNumber: 'IPP-B1234',
        status: RmaStatus.SHIPPED,
        creationDate: '2024-07-10T09:00:00Z',
        statusDate: '2024-07-20T11:25:00Z',
        issueDescription: 'The pump is not delivering the correct dosage. Alarm sounds frequently.',
        accessoriesIncluded: 'Main unit and power cord only.',
        resolutionNotes: `[${RmaStatus.RECEIVED} - 7/11/2024, 10:00:00 AM] Pump received.\n\n[${RmaStatus.IN_REPAIR} - 7/12/2024, 02:30:00 PM] Replaced the peristaltic motor assembly and recalibrated the flow sensor.\n\n[${RmaStatus.REPAIRED} - 7/19/2024, 04:00:00 PM] Device passed all post-service diagnostics.\n\n[${RmaStatus.SHIPPED} - 7/20/2024, 11:25:00 AM] Shipped via FedEx, tracking #1234567890.`,
      },
    ],
  },
  {
    id: 'RMA-240620-C4D8',
    customer: MOCK_CUSTOMERS[0],
    devices: [
        {
            model: 'Portable Defibrillator X',
            serialNumber: 'PDX-C5432',
        },
        {
            model: 'ECG Monitor 12-Lead',
            serialNumber: 'ECG12-D9876',
        }
    ],
    creationDate: '2024-06-20T16:00:00Z',
    lastUpdateDate: '2024-07-22T09:15:00Z',
    serviceCycles: [
      {
        deviceSerialNumber: 'PDX-C5432',
        status: RmaStatus.CLOSED,
        creationDate: '2024-06-20T16:00:00Z',
        statusDate: '2024-07-05T17:00:00Z',
        issueDescription: 'Unit failed its self-test procedure. Error code BATT-LOW displayed even with a fully charged battery.',
        accessoriesIncluded: 'Main unit, 2 batteries, charging base.',
        resolutionNotes: `[${RmaStatus.IN_REPAIR} - 6/22/2024, 1:20:15 PM] Replaced the internal battery and main circuit board.\n\n[${RmaStatus.REPAIRED} - 7/4/2024, 3:00:00 PM] Tested and verified functionality.\n\n[${RmaStatus.CLOSED} - 7/5/2024, 5:00:00 PM] Case closed.`,
      },
      {
        deviceSerialNumber: 'PDX-C5432',
        status: RmaStatus.PENDING,
        creationDate: '2024-07-22T09:15:00Z',
        statusDate: '2024-07-22T09:15:00Z',
        issueDescription: 'Customer reports the device is not holding a charge for more than 2 hours.',
        accessoriesIncluded: 'Main unit only'
      },
      {
        deviceSerialNumber: 'ECG12-D9876',
        status: RmaStatus.RECEIVED,
        creationDate: '2024-06-20T16:00:00Z',
        statusDate: '2024-06-22T11:00:00Z',
        issueDescription: 'Lead II is showing artifacts and noise.',
        accessoriesIncluded: 'Main unit, patient cable.'
      }
    ]
  }
];