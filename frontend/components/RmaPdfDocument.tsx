import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { Rma, Device, RmaStatus, ServiceCycle } from '../types';

const styles = StyleSheet.create({
  page: { padding: '30mm 20mm', backgroundColor: '#ffffff', fontFamily: 'Helvetica', fontSize: 10, color: '#000000' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', borderBottomWidth: 1.5, borderBottomColor: '#000000', paddingBottom: 4, marginBottom: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingBottom: 12, marginBottom: 12, borderBottomWidth: 3, borderBottomColor: '#000000' },
  headerLeft: { flexDirection: 'column' },
  headerRight: { flexDirection: 'column', alignItems: 'flex-end', fontSize: 9, color: '#4A4A4A' },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 2 },
  recipientText: { fontWeight: 'bold', color: '#000000' },
  pageNumber: { fontSize: 9, marginTop: 8, fontWeight: 'bold' },
  infoTable: { width: '100%' },
  infoTableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', padding: '4px 0' },
  infoTableLabel: { width: '33%', fontWeight: 'bold', color: '#374151' },
  infoTableValue: { width: '67%' },
  deviceTable: { width: '100%', border: '1px solid #D1D5DB' },
  deviceTableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', fontWeight: 'bold' },
  deviceTableCell: { padding: 4, borderRightWidth: 1, borderRightColor: '#D1D5DB', flex: 1 },
  deviceTableCellHeader: { padding: 4, borderRightWidth: 1, borderRightColor: '#D1D5DB', flex: 1, fontWeight: 'bold' },
  deviceTableBodyRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#D1D5DB' },
  colModel: { flex: 2 },
  colPart: { flex: 2 },
  colSerial: { flex: 3, fontFamily: 'Courier' },
  colQty: { flex: 1 },
  colDesc: { flex: 4, fontSize: 8 },
  shippingBox: { border: '1px solid #000000', padding: 12 },
  shippingListItem: { marginBottom: 4 },
  rmaIdText: { fontSize: 20, fontWeight: 'bold', letterSpacing: 2 },
  footer: { position: 'absolute', bottom: '20mm', left: '20mm', right: '20mm', textAlign: 'center', fontSize: 8, color: '#6B7280', borderTopWidth: 1, borderTopColor: '#000000', paddingTop: 4 },
  resolutionBox: {
    backgroundColor: '#F9FAFB',
    padding: 8,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 4,
  },
  resolutionDate: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 2,
  },
  resolutionStatus: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 10,
  },
  resolutionNotes: {
    fontSize: 10,
  },
  italicText: {
    fontFamily: 'Helvetica-Oblique',
    color: '#6B7280',
  },
});

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
};

const RmaFormHeader = ({ rma, pageNumber, totalPages }: { rma: Rma; pageNumber: number, totalPages: number }) => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <Text style={styles.title}>Return Authorization</Text>
      <Text style={styles.subtitle}>RMA #<Text style={{ fontWeight: 'bold' }}>{rma.id}</Text></Text>
    </View>
    <View style={styles.headerRight}>
      <Text style={styles.recipientText}>Recipient: AVANA TECHNOLOGY SERVICES</Text>
      <Text>91, GROUND FLOOR SUNDAR NAGAR 4TH AVENUE</Text>
      <Text>Ekkaduthangal, Chennai, Tamil Nadu, 600032</Text>
      {totalPages > 1 && <Text style={styles.pageNumber}>Page {pageNumber} of {totalPages}</Text>}
    </View>
  </View>
);

const RmaFormFooter = () => (
  <Text style={styles.footer}>If you have any questions, please contact our support team at 1-800-555-HELP. &copy; {new Date().getFullYear()} Avana Medical. All rights reserved.</Text>
);

const InfoTable = ({ data }: { data: { label: string; value: string | undefined | null }[] }) => (
  <View style={styles.infoTable}>
    {data.map(({ label, value }) => (
      <View style={styles.infoTableRow} key={label}>
        <Text style={styles.infoTableLabel}>{label}</Text>
        <Text style={styles.infoTableValue}>{value || 'N/A'}</Text>
      </View>
    ))}
  </View>
);

const DeviceTable = ({ devices, rma }: { devices: Device[]; rma: Rma }) => (
  <View style={styles.deviceTable}>
    <View style={styles.deviceTableHeader}>
      <Text style={[styles.deviceTableCellHeader, styles.colModel]}>Device Model</Text>
      <Text style={[styles.deviceTableCellHeader, styles.colPart]}>Part No.</Text>
      <Text style={[styles.deviceTableCellHeader, styles.colSerial]}>Serial / Lot No.</Text>
      <Text style={[styles.deviceTableCellHeader, styles.colQty]}>Qty</Text>
      <Text style={[styles.deviceTableCellHeader, styles.colDesc, { borderRightWidth: 0 }]}>Failure Description</Text>
    </View>
    {devices.map(device => {
      const mostRecentCycle = [...rma.serviceCycles]
          .filter(c => c.deviceSerialNumber === device.serialNumber)
          .sort((a, b) => new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime())[0];
      return (
        <View style={styles.deviceTableBodyRow} key={device.serialNumber}>
          <Text style={[styles.deviceTableCell, styles.colModel]}>{device.model}</Text>
          <Text style={[styles.deviceTableCell, styles.colPart]}>{device.partNumber}</Text>
          <Text style={[styles.deviceTableCell, styles.colSerial]}>{device.serialNumber}</Text>
          <Text style={[styles.deviceTableCell, styles.colQty]}>{String(device.quantity)}</Text>
          <Text style={[styles.deviceTableCell, styles.colDesc, { borderRightWidth: 0 }]}>{mostRecentCycle?.issueDescription || 'N/A'}</Text>
        </View>
      );
    })}
  </View>
);

const ReturnAuthDocument = ({ rma }: { rma: Rma }) => {
  const MAX_DEVICES_FIRST_PAGE = 8;
  const MAX_DEVICES_SUBSEQUENT_PAGE = 18;

  const deviceChunks: Device[][] = [];
  if (rma.devices.length > MAX_DEVICES_FIRST_PAGE) {
    deviceChunks.push(rma.devices.slice(0, MAX_DEVICES_FIRST_PAGE));
    let remaining = rma.devices.slice(MAX_DEVICES_FIRST_PAGE);
    while (remaining.length > 0) {
        deviceChunks.push(remaining.slice(0, MAX_DEVICES_SUBSEQUENT_PAGE));
        remaining = remaining.slice(MAX_DEVICES_SUBSEQUENT_PAGE);
    }
  } else {
      deviceChunks.push(rma.devices);
  }
  const totalPages = deviceChunks.length;

  return (
    <Document title={`ReturnAuth-${rma.id}`}>
      {deviceChunks.map((chunk, pageIndex) => (
        <Page size="A4" style={styles.page} key={pageIndex} wrap>
            <RmaFormHeader rma={rma} pageNumber={pageIndex + 1} totalPages={totalPages} />
            {pageIndex === 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Information</Text>
                <InfoTable data={[
                  { label: 'Facility/Customer Name', value: rma.customer.name },
                  { label: 'Address', value: rma.customer.address },
                  { label: 'Date of Incident', value: formatDate(rma.dateOfIncident) },
                  { label: 'Date of Report', value: formatDate(rma.dateOfReport) },
                  { label: 'Attachment Proof', value: rma.attachment ? 'Proof Attached' : 'N/A' },
                ]} />
              </View>
            )}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{pageIndex === 0 ? "Authorized Devices for Return" : "Authorized Devices for Return (continued)"}</Text>
              <DeviceTable devices={chunk} rma={rma} />
            </View>
            {pageIndex === totalPages - 1 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Shipping Instructions</Text>
                <View style={styles.shippingBox}>
                    <Text style={styles.shippingListItem}>1. Securely pack the device(s) listed above to prevent damage.</Text>
                    <Text style={styles.shippingListItem}>2. Include a printed copy of this document inside the shipment.</Text>
                    <Text style={[styles.shippingListItem, {fontWeight: 'bold'}]}>3. Write the RMA number clearly on the outside of the container: <Text style={styles.rmaIdText}>{rma.id}</Text></Text>
                </View>
              </View>
            )}
            <RmaFormFooter />
        </Page>
      ))}
    </Document>
  )
};

const ServiceReportDocument = ({ rma, serviceCycle }: { rma: Rma; serviceCycle: ServiceCycle }) => {
    const device = rma.devices.find(d => d.serialNumber === serviceCycle.deviceSerialNumber);
    const finalReportEvent = serviceCycle.history.find(h => h.status === RmaStatus.CLOSED || h.status === RmaStatus.REPAIRED) || serviceCycle.history[serviceCycle.history.length - 1];

    if (!device) return <Document><Page><Text>Device not found for this service cycle.</Text></Page></Document>;

    return (
        <Document title={`ServiceReport-${rma.id}-${device.serialNumber}`}>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.title}>Device Service Report</Text>
                        <Text style={styles.subtitle}>RMA #{rma.id}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <Text style={styles.recipientText}>AVANA TECHNOLOGY SERVICES</Text>
                        <Text>91, GROUND FLOOR SUNDAR NAGAR 4TH AVENUE</Text>
                        <Text>Ekkaduthangal, Chennai, Tamil Nadu, 600032</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recipient</Text>
                    <InfoTable data={[
                        { label: "Facility/Customer Name", value: rma.customer.name },
                        { label: "Contact Person", value: rma.customer.contactPerson },
                    ]} />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Details</Text>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 2 }}>{device.model}</Text>
                    <Text style={{ fontSize: 10, color: '#4A4A4A', marginBottom: 6 }}>S/N: {device.serialNumber}</Text>

                    <InfoTable data={[
                        { label: "Part Number", value: device.partNumber },
                        { label: "Quantity", value: String(device.quantity) },
                        { label: "Accessories Included", value: serviceCycle.accessoriesIncluded },
                        { label: "Service Ticket Date", value: formatDate(serviceCycle.creationDate) },
                        { label: "Service Report Date", value: finalReportEvent ? formatDate(finalReportEvent.date) : 'N/A' },
                    ]} />
                    <View style={{ marginTop: 8 }}>
                        <Text style={{ fontWeight: 'bold' }}>Failure Description/Details</Text>
                        <Text style={{ fontSize: 10, marginTop: 2, padding: 4, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                            {serviceCycle.issueDescription}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Service Resolution</Text>
                    {finalReportEvent ? (
                        <View style={styles.resolutionBox}>
                            <Text style={styles.resolutionDate}>{new Date(finalReportEvent.date).toLocaleString()}</Text>
                            <Text style={styles.resolutionStatus}>Final Status: "{finalReportEvent.status}"</Text>
                            <Text style={styles.resolutionNotes}>{finalReportEvent.notes}</Text>
                        </View>
                    ) : (
                        <Text style={styles.italicText}>No final resolution has been logged for this service ticket.</Text>
                    )}
                </View>

                <RmaFormFooter />
            </Page>
        </Document>
    );
};

const RmaPdfDocument: React.FC<{ rma: Rma; selectedCycle?: ServiceCycle }> = ({ rma, selectedCycle }) => {
  if (selectedCycle) {
    return <ServiceReportDocument rma={rma} serviceCycle={selectedCycle} />;
  } else {
    return <ReturnAuthDocument rma={rma} />;
  }
};

export default RmaPdfDocument;
