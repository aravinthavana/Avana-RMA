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
  {
    id: 'CUST-003',
    name: 'Sunset Medical Group',
    contactPerson: 'Dr. Emily Carter',
    email: 'ecarter@sunsetmed.com',
    phone: '555-321-7654',
    address: '789 Beachfront Ave\nMiami, FL 33101',
  },
];

export const MOCK_RMAS: Rma[] = [
  {
    id: 'RMA-240715-9F3B',
    customer: MOCK_CUSTOMERS[0],
    devices: [
      {
        model: 'VitalSign Monitor 5000',
        partNumber: 'PN-VSM5K',
        serialNumber: 'VSM5K-A9876',
        quantity: 1,
      },
    ],
    creationDate: '2024-07-15T10:30:00Z',
    lastUpdateDate: '2024-07-18T14:00:00Z',
    dateOfIncident: '2024-07-14T00:00:00Z',
    dateOfReport: '2024-07-15T00:00:00Z',
    attachment: 'proof_1.jpg',
    serviceCycles: [
      {
        deviceSerialNumber: 'VSM5K-A9876',
        status: RmaStatus.IN_REPAIR,
        creationDate: '2024-07-15T10:30:00Z',
        statusDate: '2024-07-18T14:00:00Z',
        issueDescription: 'Device screen is flickering and occasionally goes blank. Issue started after a software update.',
        accessoriesIncluded: 'Main unit, power adapter, ECG leads',
        history: [
          { status: RmaStatus.PENDING, date: '2024-07-15T10:30:00Z', notes: 'RMA created and device registered.' },
          { status: RmaStatus.RECEIVED, date: '2024-07-17T09:05:12Z', notes: 'Unit received and checked in.' },
          { status: RmaStatus.IN_REPAIR, date: '2024-07-18T14:00:00Z', notes: 'Technician is currently diagnosing the main board. Suspected faulty capacitor.' },
        ]
      },
    ],
  },
  {
    id: 'RMA-240710-A1E6',
    customer: MOCK_CUSTOMERS[1],
    devices: [
      {
        model: 'Infusion Pump Pro',
        partNumber: 'PN-IPP-PRO',
        serialNumber: 'IPP-B1234',
        quantity: 1,
      },
    ],
    creationDate: '2024-07-10T09:00:00Z',
    lastUpdateDate: '2024-07-20T11:25:00Z',
    dateOfIncident: '2024-07-09T00:00:00Z',
    dateOfReport: '2024-07-10T00:00:00Z',
    serviceCycles: [
      {
        deviceSerialNumber: 'IPP-B1234',
        status: RmaStatus.SHIPPED,
        creationDate: '2024-07-10T09:00:00Z',
        statusDate: '2024-07-20T11:25:00Z',
        issueDescription: 'The pump is not delivering the correct dosage. Alarm sounds frequently.',
        accessoriesIncluded: 'Main unit and power cord only.',
        history: [
          { status: RmaStatus.PENDING, date: '2024-07-10T09:00:00Z', notes: 'RMA created and device registered.' },
          { status: RmaStatus.RECEIVED, date: '2024-07-11T10:00:00Z', notes: 'Pump received.' },
          { status: RmaStatus.IN_REPAIR, date: '2024-07-12T14:30:00Z', notes: 'Replaced the peristaltic motor assembly and recalibrated the flow sensor.' },
          { status: RmaStatus.REPAIRED, date: '2024-07-19T16:00:00Z', notes: 'Device passed all post-service diagnostics.' },
          { status: RmaStatus.SHIPPED, date: '2024-07-20T11:25:00Z', notes: 'Shipped via FedEx, tracking #1234567890.' },
        ]
      },
    ],
  },
  {
    id: 'RMA-240620-C4D8',
    customer: MOCK_CUSTOMERS[0],
    devices: [
      {
        model: 'Portable Defibrillator X',
        partNumber: 'PN-PDX-X',
        serialNumber: 'PDX-C5432',
        quantity: 1,
      },
      {
        model: 'ECG Monitor 12-Lead',
        partNumber: 'PN-ECG12',
        serialNumber: 'ECG12-D9876',
        quantity: 1,
      },
    ],
    creationDate: '2024-06-20T16:00:00Z',
    lastUpdateDate: '2024-07-22T09:15:00Z',
    dateOfIncident: '2024-06-19T00:00:00Z',
    dateOfReport: '2024-06-20T00:00:00Z',
    attachment: 'proof_2.pdf',
    serviceCycles: [
      {
        deviceSerialNumber: 'PDX-C5432',
        status: RmaStatus.CLOSED,
        creationDate: '2024-06-20T16:00:00Z',
        statusDate: '2024-07-05T17:00:00Z',
        issueDescription: 'Unit failed its self-test procedure. Error code BATT-LOW displayed even with a fully charged battery.',
        accessoriesIncluded: 'Main unit, 2 batteries, charging base.',
        history: [
          { status: RmaStatus.PENDING, date: '2024-06-20T16:00:00Z', notes: 'RMA created and device registered.' },
          { status: RmaStatus.IN_REPAIR, date: '2024-06-22T13:20:15Z', notes: 'Replaced the internal battery and main circuit board.' },
          { status: RmaStatus.REPAIRED, date: '2024-07-04T15:00:00Z', notes: 'Tested and verified functionality.' },
          { status: RmaStatus.CLOSED, date: '2024-07-05T17:00:00Z', notes: 'Case closed.' },
        ]
      },
      {
        deviceSerialNumber: 'PDX-C5432',
        status: RmaStatus.PENDING,
        creationDate: '2024-07-22T09:15:00Z',
        statusDate: '2024-07-22T09:15:00Z',
        issueDescription: 'Customer reports the device is not holding a charge for more than 2 hours.',
        accessoriesIncluded: 'Main unit only',
        history: [
          { status: RmaStatus.PENDING, date: '2024-07-22T09:15:00Z', notes: 'New service ticket created.' },
        ]
      },
      {
        deviceSerialNumber: 'ECG12-D9876',
        status: RmaStatus.RECEIVED,
        creationDate: '2024-06-20T16:00:00Z',
        statusDate: '2024-06-22T11:00:00Z',
        issueDescription: 'Lead II is showing artifacts and noise.',
        accessoriesIncluded: 'Main unit, patient cable.',
        history: [
          { status: RmaStatus.PENDING, date: '2024-06-20T16:00:00Z', notes: 'RMA created and device registered.' },
          { status: RmaStatus.RECEIVED, date: '2024-06-22T11:00:00Z', notes: 'Device received at facility.' },
        ]
      },
    ],
  },
  {
    id: 'RMA-240515-BEEF',
    customer: MOCK_CUSTOMERS[2],
    devices: [
      {
        model: 'Anesthesia Machine 9001',
        partNumber: 'PN-AM9K1',
        serialNumber: 'AM9K1-X001',
        quantity: 1,
      },
      {
        model: 'Surgical Light Pro',
        partNumber: 'PN-SLPRO',
        serialNumber: 'SLP-Y002',
        quantity: 2,
      },
      {
        model: 'Patient Warmer Plus',
        partNumber: 'PN-PWP',
        serialNumber: 'PWP-Z003',
        quantity: 1,
      },
      {
        model: 'Electrosurgical Unit 300',
        partNumber: 'PN-ESU300',
        serialNumber: 'ESU3-A004',
        quantity: 1,
      },
      {
        model: 'Medical Gas Blender',
        partNumber: 'PN-MGB',
        serialNumber: 'MGB-B005',
        quantity: 1,
      },
      {
        model: 'Ultrasound System Z',
        partNumber: 'PN-USZ',
        serialNumber: 'USZ-C006',
        quantity: 1,
      },
      {
        model: 'Defibrillator Pad',
        partNumber: 'PN-DPAD',
        serialNumber: 'DPAD-L007',
        quantity: 10,
      },
      {
        model: 'Hospital Bed XYZ',
        partNumber: 'PN-HBXYZ',
        serialNumber: 'HBXYZ-008',
        quantity: 1,
      },
      {
        model: 'IV Stand',
        partNumber: 'PN-IVS',
        serialNumber: 'IVS-009',
        quantity: 5,
      },
      {
        model: 'Wheelchair',
        partNumber: 'PN-WC',
        serialNumber: 'WC-010',
        quantity: 3,
      },
      {
        model: 'Stretcher',
        partNumber: 'PN-STR',
        serialNumber: 'STR-011',
        quantity: 2,
      },
      {
        model: 'Medical Refrigerator',
        partNumber: 'PN-MR',
        serialNumber: 'MR-012',
        quantity: 1,
      },
      {
        model: 'Autoclave',
        partNumber: 'PN-AC',
        serialNumber: 'AC-013',
        quantity: 1,
      },
      {
        model: 'Centrifuge',
        partNumber: 'PN-CFG',
        serialNumber: 'CFG-014',
        quantity: 1,
      },
      {
        model: 'Microscope',
        partNumber: 'PN-MS',
        serialNumber: 'MS-015',
        quantity: 1,
      },
    ],
    creationDate: '2024-05-15T11:00:00Z',
    lastUpdateDate: '2024-05-25T10:00:00Z',
    dateOfIncident: '2024-05-14T00:00:00Z',
    dateOfReport: '2024-05-15T00:00:00Z',
    attachment: 'multi_device_proof.docx',
    serviceCycles: [
      {
        deviceSerialNumber: 'AM9K1-X001',
        status: RmaStatus.CLOSED,
        creationDate: '2024-05-15T11:00:00Z',
        statusDate: '2024-05-25T10:00:00Z',
        issueDescription: 'Vaporizer is leaking. Needs immediate attention.',
        accessoriesIncluded: 'Vaporizer unit only',
        history: [
          { status: RmaStatus.PENDING, date: '2024-05-15T11:00:00Z', notes: 'RMA created and device registered.' },
          { status: RmaStatus.REPAIRED, date: '2024-05-24T16:00:00Z', notes: 'Replaced seals and recalibrated vaporizer.' },
          { status: RmaStatus.CLOSED, date: '2024-05-25T10:00:00Z', notes: 'Final test passed. Case closed.' },
        ]
      },
      {
        deviceSerialNumber: 'SLP-Y002',
        status: RmaStatus.PENDING,
        creationDate: '2024-05-15T11:00:00Z',
        statusDate: '2024-05-15T11:00:00Z',
        issueDescription: 'One of the light heads has a yellow tint.',
        accessoriesIncluded: 'Light head only',
        history: [
          { status: RmaStatus.PENDING, date: '2024-05-15T11:00:00Z', notes: 'RMA created and device registered.' },
        ]
      },
      {
        deviceSerialNumber: 'PWP-Z003',
        status: RmaStatus.PENDING,
        creationDate: '2024-05-15T11:00:00Z',
        statusDate: '2024-05-15T11:00:00Z',
        issueDescription: 'The blanket is not heating evenly.',
        accessoriesIncluded: 'Blanket and main unit',
        history: [
          { status: RmaStatus.PENDING, date: '2024-05-15T11:00:00Z', notes: 'RMA created and device registered.' },
        ]
      },
      {
        deviceSerialNumber: 'HBXYZ-008',
        status: RmaStatus.PENDING,
        creationDate: '2024-05-15T11:00:00Z',
        statusDate: '2024-05-15T11:00:00Z',
        issueDescription: 'The bed controls are not responding.',
        accessoriesIncluded: 'Bed frame and mattress only',
        history: [
          { status: RmaStatus.PENDING, date: '2024-05-15T11:00:00Z', notes: 'RMA created and device registered.' },
        ]
      },
    ],
  },
];
