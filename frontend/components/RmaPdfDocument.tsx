import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Rma, Device, RmaStatus, ServiceCycle } from '../types';

// Modern PDF styles optimized for black & white printing
const styles = StyleSheet.create({
  page: {
    padding: '25mm 20mm',
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
    lineHeight: 1.4,
  },

  // Header styles - clean and modern
  header: {
    marginBottom: 20,
    borderBottom: '2px solid #000000',
    paddingBottom: 15,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  documentType: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  rmaNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '6 12',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  documentDate: {
    fontSize: 9,
    marginTop: 4,
  },

  // Address block
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 20,
  },
  addressBlock: {
    flex: 1,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  addressTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 9,
    lineHeight: 1.5,
  },

  // Section styles
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingBottom: 6,
    marginBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#000000',
  },

  // Info grid
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoItem: {
    width: '48%',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    color: '#000000',
    fontWeight: 'bold',
  },
  infoValue: {
    fontSize: 10,
    fontWeight: 'normal',
  },

  // Modern table
  table: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    color: '#ffffff',
  },
  tableHeaderCell: {
    padding: '8 6',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    borderRightWidth: 1,
    borderRightColor: '#ffffff',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  tableCell: {
    padding: '6 6',
    fontSize: 9,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  tableCellLast: {
    borderRightWidth: 0,
  },

  // Column widths
  colArticle: { width: '25%' },
  colSerial: { width: '30%', fontFamily: 'Courier' },
  colQty: { width: '10%', textAlign: 'center' },
  colIssue: { width: '35%', fontSize: 8 },

  // Device details
  deviceSection: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#000000',
  },
  deviceHeader: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
  },
  deviceInfo: {
    fontSize: 9,
    marginBottom: 3,
  },
  deviceLabel: {
    fontWeight: 'bold',
    marginRight: 4,
  },

  // Status history
  historyItem: {
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
    paddingLeft: 10,
  },
  historyDate: {
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyNotes: {
    fontSize: 9,
    fontFamily: 'Helvetica-Oblique',
  },

  // Shipping section
  shippingBox: {
    padding: 15,
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
  },
  shippingTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  shippingItem: {
    fontSize: 9,
    marginBottom: 4,
    paddingLeft: 4,
  },

  // Notes section
  notesBox: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#000000',
    minHeight: 60,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 6,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    fontSize: 8,
    textAlign: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#000000',
  },

  // Page numbers
  pageNumber: {
    fontSize: 9,
    textAlign: 'right',
    fontWeight: 'bold',
  },
});

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB');
};

// Modern Header Component
const ModernHeader = ({ rma, documentType, pageNumber, totalPages }: {
  rma: Rma;
  documentType: string;
  pageNumber: number;
  totalPages: number;
}) => (
  <View style={styles.header}>
    <View style={styles.headerTop}>
      <View>
        <Text style={styles.companyName}>AVANA TECHNOLOGY SERVICES</Text>
        <Text style={styles.documentType}>{documentType}</Text>
      </View>
      <View>
        <View style={styles.rmaNumber}>
          <Text>RMA #{rma.id}</Text>
        </View>
        <Text style={styles.documentDate}>Date: {formatDate(rma.creationDate)}</Text>
        {totalPages > 1 && (
          <Text style={styles.pageNumber}>Page {pageNumber} of {totalPages}</Text>
        )}
      </View>
    </View>
  </View>
);

// Address Section Component
const AddressSection = ({ rma }: { rma: Rma }) => (
  <View style={styles.addressSection}>
    <View style={styles.addressBlock}>
      <Text style={styles.addressTitle}>Return To:</Text>
      <Text style={styles.addressText}>AVANA TECHNOLOGY SERVICES</Text>
      <Text style={styles.addressText}>91, Ground Floor, Sundar Nagar 4th Avenue</Text>
      <Text style={styles.addressText}>Ekkaduthangal, Chennai</Text>
      <Text style={styles.addressText}>Tamil Nadu, 600032</Text>
      <Text style={styles.addressText}>India</Text>
    </View>
    <View style={styles.addressBlock}>
      <Text style={styles.addressTitle}>Customer:</Text>
      <Text style={styles.addressText}>{rma.customer.name}</Text>
      {rma.customer.address && <Text style={styles.addressText}>{rma.customer.address}</Text>}
      {rma.customer.contactPerson && <Text style={styles.addressText}>Attn: {rma.customer.contactPerson}</Text>}
      {rma.customer.email && <Text style={styles.addressText}>Email: {rma.customer.email}</Text>}
      {rma.customer.phone && <Text style={styles.addressText}>Phone: {rma.customer.phone}</Text>}
    </View>
  </View>
);

// Device Table Component
const DeviceTable = ({ devices, rma }: { devices: Device[]; rma: Rma }) => (
  <View style={styles.table}>
    <View style={styles.tableHeader}>
      <Text style={[styles.tableHeaderCell, styles.colArticle]}>Article Number</Text>
      <Text style={[styles.tableHeaderCell, styles.colSerial]}>Serial Number</Text>
      <Text style={[styles.tableHeaderCell, styles.colQty]}>Qty</Text>
      <Text style={[styles.tableHeaderCell, styles.colIssue, styles.tableCellLast]}>Reported Issue</Text>
    </View>
    {devices.map((device, idx) => (
      <View key={idx} style={styles.tableRow}>
        <Text style={[styles.tableCell, styles.colArticle]}>{device.articleNumber || 'N/A'}</Text>
        <Text style={[styles.tableCell, styles.colSerial]}>{device.serialNumber}</Text>
        <Text style={[styles.tableCell, styles.colQty]}>{device.quantity || 1}</Text>
        <Text style={[styles.tableCell, styles.colIssue, styles.tableCellLast]}>
          {rma.serviceCycles.find(c => c.deviceSerialNumber === device.serialNumber)?.issueDescription || 'N/A'}
        </Text>
      </View>
    ))}
  </View>
);

// Return Authorization Document
export const ReturnAuthorizationDocument = ({ rma }: { rma: Rma }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <ModernHeader rma={rma} documentType="RETURN AUTHORIZATION" pageNumber={1} totalPages={1} />

      <AddressSection rma={rma} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Device Information</Text>
        <DeviceTable devices={rma.devices} rma={rma} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Shipping Instructions</Text>
        <View style={styles.shippingBox}>
          <Text style={styles.shippingTitle}>⚠ IMPORTANT SHIPPING GUIDELINES ⚠</Text>
          <Text style={styles.shippingItem}>• Include this RMA form inside the package</Text>
          <Text style={styles.shippingItem}>• Write RMA #{rma.id} clearly on the outside of the package</Text>
          <Text style={styles.shippingItem}>• Pack all items securely to prevent damage during shipping</Text>
          <Text style={styles.shippingItem}>• Include all accessories and cables originally included</Text>
          <Text style={styles.shippingItem}>• Remove any personal data or confidential information</Text>
          <Text style={styles.shippingItem}>• Ship via trackable courier service</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Additional Notes</Text>
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Internal Use Only:</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>This is an official Return Merchandise Authorization from Avana Technology Services</Text>
        <Text>For inquiries, contact us at support@avanamedical.com or call +91-XXXX-XXXXXX</Text>
      </View>
    </Page>
  </Document>
);

// Service Report Document
export const ServiceReportDocument = ({ rma, device, cycle }: {
  rma: Rma;
  device: Device;
  cycle: ServiceCycle;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <ModernHeader rma={rma} documentType="SERVICE REPORT" pageNumber={1} totalPages={1} />

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Customer Information</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Customer Name</Text>
            <Text style={styles.infoValue}>{rma.customer.name}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Contact Person</Text>
            <Text style={styles.infoValue}>{rma.customer.contactPerson || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{rma.customer.email || 'N/A'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{rma.customer.phone || 'N/A'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.deviceSection}>
        <Text style={styles.deviceHeader}>Device Details</Text>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceLabel}>Article Number:</Text>
          <Text>{device.articleNumber || 'N/A'}</Text>
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceLabel}>Serial Number:</Text>
          <Text>{device.serialNumber}</Text>
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceLabel}>Quantity:</Text>
          <Text>{device.quantity || 1}</Text>
        </View>
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceLabel}>Accessories Included:</Text>
          <Text>{cycle.accessoriesIncluded || 'None specified'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Reported Issue</Text>
        <View style={{ padding: 10, borderWidth: 1, borderColor: '#000000' }}>
          <Text>{cycle.issueDescription || 'No description provided'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Service History</Text>
        {cycle.history && cycle.history.length > 0 ? (
          cycle.history.map((entry, idx) => (
            <View key={idx} style={styles.historyItem}>
              <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
              <Text style={styles.historyStatus}>Status: {entry.status}</Text>
              {entry.notes && <Text style={styles.historyNotes}>{entry.notes}</Text>}
            </View>
          ))
        ) : (
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Oblique' }}>No service history available</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Technician Notes</Text>
        <View style={styles.notesBox}>
          <Text style={{ fontSize: 9 }}>(To be filled by service technician)</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>Service Report - Avana Technology Services | Confidential Document</Text>
        <Text>Generated on {new Date().toLocaleDateString('en-GB')}</Text>
      </View>
    </Page>
  </Document>
);
