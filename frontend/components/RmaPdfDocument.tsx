import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import { Rma, Device, RmaStatus, ServiceCycle } from '../types';

// Matching the visually appealing styles from Test Report PDF + Amber theme
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    backgroundColor: '#ffffff',
    paddingTop: 30,
    paddingBottom: 40,
    paddingHorizontal: 35,
    color: '#1a1a1a',
  },
  // --- Header ---
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '2.5px solid #d48a07',
    paddingBottom: 10,
    marginBottom: 14,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#d48a07',
  },
  companySubtext: {
    fontSize: 7.5,
    color: '#555555',
    marginTop: 2,
  },
  reportTitle: {
    fontSize: 15,
    fontFamily: 'Helvetica-Bold',
    color: '#d48a07',
    textAlign: 'right',
  },
  reportNo: {
    fontSize: 9,
    color: '#555555',
    textAlign: 'right',
    marginTop: 2,
  },
  // --- Section headers ---
  sectionHeader: {
    backgroundColor: '#d48a07',
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    padding: '4 8',
    marginBottom: 6,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // --- Info grid ---
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 0,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 3,
  },
  infoCell: {
    width: '33.33%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    padding: '4 7',
  },
  infoCellHalf: {
    width: '50%',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    padding: '4 7',
  },
  infoCellFull: {
    width: '100%',
    borderBottomWidth: 1,
    borderColor: '#d1d5db',
    padding: '4 7',
  },
  infoLabel: {
    fontSize: 7,
    color: '#6b7280',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 9,
    color: '#111827',
    fontFamily: 'Helvetica-Bold',
  },
  // --- Tables ---
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    padding: '4 0',
  },
  tableHeaderCell: {
    color: '#ffffff',
    fontFamily: 'Helvetica-Bold',
    fontSize: 7.5,
    paddingHorizontal: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    minHeight: 22,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#f9fafb',
  },
  tableCell: {
    fontSize: 8.5,
    paddingHorizontal: 6,
    paddingVertical: 4,
    color: '#1f2937',
  },
  // --- Custom specific elements ---
  safetyAlert: {
    backgroundColor: '#fef2f2',
    borderWidth: 1.5,
    borderColor: '#ef4444',
    padding: 10,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 4,
  },
  safetyAlertTitle: {
    color: '#b91c1c',
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    marginBottom: 4,
  },
  shippingBox: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#d48a07',
    borderStyle: 'dashed',
    borderRadius: 4,
  },
  shippingTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#d48a07',
    textAlign: 'center',
    marginBottom: 8,
  },
  shippingItem: {
    fontSize: 8.5,
    marginBottom: 4,
    paddingLeft: 4,
    color: '#374151',
  },
  // --- Footer ---
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 35,
    right: 35,
    borderTopWidth: 1,
    borderColor: '#d1d5db',
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 7,
    color: '#9ca3af',
  },
});

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Modern Header Component matching Test Report
const ModernHeader = ({ rma, documentType, pageNumber, totalPages }: {
  rma: Rma;
  documentType: string;
  pageNumber: number;
  totalPages: number;
}) => (
  <View style={styles.header}>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Image src="/avana-logo.png" style={{ width: 40, height: 40 }} />
      <View>
        <Text style={styles.companyName}>AVANA TECHNOLOGY SERVICES</Text>
        <Text style={styles.companySubtext}>Medical Device Service & Repair</Text>
        <Text style={styles.companySubtext}>www.avanamedical.com | support@avanamedical.com</Text>
      </View>
    </View>
    <View>
      <Text style={styles.reportTitle}>{documentType}</Text>
      <Text style={styles.reportNo}>RMA: {rma.id}</Text>
      <Text style={styles.reportNo}>Date: {formatDate(rma.creationDate)}</Text>
      {totalPages > 1 && (
        <Text style={styles.reportNo}>Page {pageNumber} of {totalPages}</Text>
      )}
    </View>
  </View>
);

// Address Section styled like the Info Grid
const AddressSection = ({ rma }: { rma: Rma }) => (
  <>
    <View style={styles.sectionHeader}><Text>Customer & Return Information</Text></View>
    <View style={styles.infoGrid}>
      <View style={styles.infoCellHalf}>
        <Text style={styles.infoLabel}>Return To</Text>
        <Text style={styles.infoValue}>AVANA TECHNOLOGY SERVICES PVT. LTD.</Text>
        <Text style={{ fontSize: 9, color: '#4b5563', marginTop: 2 }}>91, G Floor, Sundar Nagar 4th Avenue</Text>
        <Text style={{ fontSize: 9, color: '#4b5563' }}>Ekkaduthangal, Chennai</Text>
        <Text style={{ fontSize: 9, color: '#4b5563' }}>Tamil Nadu, 600032, India</Text>
      </View>
      <View style={[styles.infoCellHalf, { borderRightWidth: 0 }]}>
        <Text style={styles.infoLabel}>Customer</Text>
        <Text style={styles.infoValue}>{rma.customer.name}</Text>
        {rma.customer.address && <Text style={{ fontSize: 9, color: '#4b5563', marginTop: 2 }}>{rma.customer.address}</Text>}
        {rma.customer.contactPerson && <Text style={{ fontSize: 9, color: '#4b5563', marginTop: 2 }}>Attn: {rma.customer.contactPerson}</Text>}
        <Text style={{ fontSize: 9, color: '#4b5563', marginTop: 2 }}>
          {rma.customer.phone ? `Ph: ${rma.customer.phone} ` : ''}
          {rma.customer.email ? `| Email: ${rma.customer.email}` : ''}
        </Text>
      </View>
    </View>
  </>
);

// Return Authorization Document
export const ReturnAuthorizationDocument = ({ rma }: { rma: Rma }) => (
  <Document title={`RMA - ${rma.id}`} author="Avana Technology Services">
    <Page size="A4" style={styles.page}>
      <ModernHeader rma={rma} documentType="RETURN AUTHORIZATION" pageNumber={1} totalPages={1} />

      {rma.isInjuryRelated && (
        <View style={styles.safetyAlert} wrap={false}>
          <Text style={styles.safetyAlertTitle}>⚠ SAFETY INCIDENT REPORT</Text>
          <Text style={{ fontSize: 9, color: '#7f1d1d', marginBottom: 4 }}>Details recorded regarding patient, user, or third-party injury:</Text>
          <Text style={{ fontSize: 9, color: '#1f2937' }}>{rma.injuryDetails}</Text>
        </View>
      )}

      <AddressSection rma={rma} />

      <View style={styles.sectionHeader}><Text>Device Information</Text></View>
      <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 3 }}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Article Number</Text>
          <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Serial Number</Text>
          <Text style={[styles.tableHeaderCell, { width: '10%' }]}>Qty</Text>
          <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Reported Issue</Text>
        </View>
        {rma.devices.map((device, idx) => (
          <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
            <Text style={[styles.tableCell, { width: '25%' }]}>{device.articleNumber || 'N/A'}</Text>
            <Text style={[styles.tableCell, { width: '25%' }]}>{device.serialNumber}</Text>
            <Text style={[styles.tableCell, { width: '10%' }]}>{device.quantity || 1}</Text>
            <Text style={[styles.tableCell, { width: '40%' }]}>
              {rma.serviceCycles.find(c => c.deviceSerialNumber === device.serialNumber)?.issueDescription || 'N/A'}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeader}><Text>Shipping Instructions</Text></View>
      <View style={styles.shippingBox}>
        <Text style={styles.shippingTitle}>⚠ IMPORTANT SHIPPING GUIDELINES ⚠</Text>
        <Text style={styles.shippingItem}>• Include this RMA form inside the package</Text>
        <Text style={styles.shippingItem}>• Write {rma.id} clearly on the outside of the package</Text>
        <Text style={styles.shippingItem}>• Pack all items securely to prevent damage during shipping</Text>
        <Text style={styles.shippingItem}>• Include all accessories and cables originally included</Text>
        <Text style={styles.shippingItem}>• Remove any personal data or confidential information</Text>
        <Text style={styles.shippingItem}>• Ship via trackable courier service</Text>
      </View>

      {rma.attachment && (
        <>
          <View style={styles.sectionHeader}><Text>Attachment</Text></View>
          <View style={{ padding: 8, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 3 }}>
            <Text style={{ fontSize: 9 }}>📎 {rma.attachment}</Text>
          </View>
        </>
      )}

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Avana Technology Services Pvt. Ltd. | Official Return Authorization
        </Text>
        <Text style={styles.footerText}>
          Generated: {new Date().toLocaleDateString('en-GB')} | RMA: {rma.id}
        </Text>
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
  <Document title={`Service Report - ${rma.id} - ${device.serialNumber}`} author="Avana Technology Services">
    <Page size="A4" style={styles.page}>
      <ModernHeader rma={rma} documentType="SERVICE REPORT" pageNumber={1} totalPages={1} />

      {rma.isInjuryRelated && (
        <View style={styles.safetyAlert} wrap={false}>
          <Text style={styles.safetyAlertTitle}>⚠ SAFETY INCIDENT REPORT</Text>
          <Text style={{ fontSize: 9, color: '#7f1d1d', marginBottom: 4 }}>Details recorded regarding patient, user, or third-party injury:</Text>
          <Text style={{ fontSize: 9, color: '#1f2937' }}>{rma.injuryDetails}</Text>
        </View>
      )}

      <View style={styles.sectionHeader}><Text>Customer Information</Text></View>
      <View style={styles.infoGrid}>
        <View style={styles.infoCellHalf}>
          <Text style={styles.infoLabel}>Customer Name</Text>
          <Text style={styles.infoValue}>{rma.customer.name}</Text>
        </View>
        <View style={[styles.infoCellHalf, { borderRightWidth: 0 }]}>
          <Text style={styles.infoLabel}>Contact Person</Text>
          <Text style={styles.infoValue}>{rma.customer.contactPerson || 'N/A'}</Text>
        </View>
        <View style={[styles.infoCellHalf, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{rma.customer.email || 'N/A'}</Text>
        </View>
        <View style={[styles.infoCellHalf, { borderBottomWidth: 0, borderRightWidth: 0 }]}>
          <Text style={styles.infoLabel}>Phone</Text>
          <Text style={styles.infoValue}>{rma.customer.phone || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}><Text>Device Details</Text></View>
      <View style={styles.infoGrid}>
        <View style={styles.infoCellHalf}>
          <Text style={styles.infoLabel}>Article Number</Text>
          <Text style={styles.infoValue}>{device.articleNumber || 'N/A'}</Text>
        </View>
        <View style={[styles.infoCellHalf, { borderRightWidth: 0 }]}>
          <Text style={styles.infoLabel}>Serial Number</Text>
          <Text style={styles.infoValue}>{device.serialNumber}</Text>
        </View>
        <View style={[styles.infoCellFull, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabel}>Accessories Included</Text>
          <Text style={styles.infoValue}>{cycle.accessoriesIncluded || 'None specified'}</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}><Text>Reported Issue</Text></View>
      <View style={{ padding: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 3 }}>
        <Text style={{ fontSize: 9, color: '#1f2937' }}>{cycle.issueDescription || 'No description provided'}</Text>
      </View>

      <View style={styles.sectionHeader}><Text>Service History</Text></View>
      <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 3 }}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Date</Text>
          <Text style={[styles.tableHeaderCell, { width: '25%' }]}>Status</Text>
          <Text style={[styles.tableHeaderCell, { width: '55%' }]}>Notes</Text>
        </View>
        {cycle.history && cycle.history.length > 0 ? (
          cycle.history.map((entry, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]} wrap={false}>
              <Text style={[styles.tableCell, { width: '20%' }]}>{formatDate(entry.date)}</Text>
              <Text style={[styles.tableCell, { width: '25%' }]}>{entry.status}</Text>
              <Text style={[styles.tableCell, { width: '55%' }]}>{entry.notes || '-'}</Text>
            </View>
          ))
        ) : (
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, { width: '100%', fontStyle: 'italic', color: '#6b7280' }]}>No service history available</Text>
          </View>
        )}
      </View>

      <View style={styles.footer} fixed>
        <Text style={styles.footerText}>
          Avana Technology Services Pvt. Ltd. | Confidential Service Report
        </Text>
        <Text style={styles.footerText}>
          Generated: {new Date().toLocaleDateString('en-GB')} | RMA: {rma.id} | S/N: {device.serialNumber}
        </Text>
      </View>
    </Page>
  </Document>
);
