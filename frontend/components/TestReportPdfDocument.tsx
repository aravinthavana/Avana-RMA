import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { TestReport, TestEquipment, TestStep } from '../src/api/test-reports.api';

// --- Styles ---
const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 9,
        backgroundColor: '#ffffff',
        paddingTop: 20,
        paddingBottom: 25,
        paddingHorizontal: 25,
        color: '#1a1a1a',
    },
    // --- Header ---
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2.5px solid #b27f0d',
        paddingBottom: 10,
        marginBottom: 14,
    },
    companyName: {
        fontSize: 13,
        fontFamily: 'Helvetica-Bold',
        color: '#b27f0d',
    },
    companySubtext: {
        fontSize: 7.5,
        color: '#555555',
        marginTop: 2,
    },
    reportTitle: {
        fontSize: 15,
        fontFamily: 'Helvetica-Bold',
        color: '#b27f0d',
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
        backgroundColor: '#b27f0d',
        color: '#ffffff',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        padding: '4 8',
        marginBottom: 4,
        marginTop: 8,
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
        minHeight: 18,
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
    tableCellCenter: {
        textAlign: 'center',
    },
    okPass: {
        color: '#166534',
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
    },
    okFail: {
        color: '#991b1b',
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
    },
    // --- Assessment box ---
    assessmentBox: {
        marginTop: 12,
        borderWidth: 1.5,
        borderColor: '#d48a07',
        borderRadius: 4,
        overflow: 'hidden',
    },
    assessmentHeader: {
        backgroundColor: '#d48a07',
        padding: '4 8',
    },
    assessmentHeaderText: {
        color: '#ffffff',
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    assessmentBody: {
        padding: 10,
        flexDirection: 'row',
        gap: 20,
    },
    assessmentResultPass: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#166534',
    },
    assessmentResultFail: {
        fontSize: 18,
        fontFamily: 'Helvetica-Bold',
        color: '#991b1b',
    },
    assessmentResultConditional: {
        fontSize: 14,
        fontFamily: 'Helvetica-Bold',
        color: '#92400e',
    },
    assessmentRemarks: {
        flex: 1,
        fontSize: 9,
        color: '#374151',
        lineHeight: 1.5,
    },
    // --- Signatures ---
    signatureRow: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 20,
    },
    signatureBlock: {
        flex: 1,
        borderTopWidth: 1,
        borderColor: '#6b7280',
        paddingTop: 6,
    },
    signatureLabel: {
        fontSize: 7,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    signatureName: {
        fontSize: 9,
        color: '#111827',
        fontFamily: 'Helvetica-Bold',
        marginTop: 3,
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

interface Props {
    report: TestReport;
    deviceSerialNumber: string;
    rmaId: string;
}

const formatDate = (dateStr: string) => {
    try {
        return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

// Column widths for test steps table
const stepColWidths = ['5%', '41%', '15%', '12%', '16%', '11%'];

const TestReportPdfDocument: React.FC<Props> = ({ report, deviceSerialNumber, rmaId }) => {
    const equipment = (report.equipmentUsed || []) as TestEquipment[];
    const steps = (report.testSteps || []) as TestStep[];

    return (
        <Document title={`Test Report - ${rmaId} - ${deviceSerialNumber}`} author="Avana Technology Services">
            <Page size="A4" style={styles.page}>

                {/* ---- HEADER ---- */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'column', gap: 5 }}>
                        <Image src="/avana-logo.png" style={{ height: 50 }} />
                        <Text style={[styles.reportNo, { textAlign: 'left', marginTop: 0 }]}>
                            {report.reportNo ? `Doc Ref No: ${report.reportNo}` : 'Doc Ref No: SH-002'}
                        </Text>
                    </View>
                    <View>
                        <Text style={styles.reportTitle}>TEST REPORT</Text>
                        <Text style={styles.reportNo}>Date: {formatDate(report.testDate)}</Text>
                    </View>
                </View>

                {/* ---- DEVICE DATA ---- */}
                <View style={[styles.infoGrid, { marginBottom: 12, flexDirection: 'column' }]}>
                    <View style={[styles.sectionHeader, { marginTop: 0, marginBottom: 0, padding: '4 8' }]}><Text>Device Data</Text></View>
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: '#d1d5db' }}>
                         <View style={{ width: '50%', padding: '4 7', borderRightWidth: 1, borderColor: '#d1d5db' }}>
                              <Text style={styles.infoLabel}>Device Type/Name</Text>
                              <Text style={styles.infoValue}>{report.deviceType}</Text>
                         </View>
                         <View style={{ width: '50%', padding: '4 7' }}>
                              <Text style={styles.infoLabel}>Serial No:</Text>
                              <Text style={styles.infoValue}>{deviceSerialNumber}</Text>
                         </View>
                    </View>
                    <View style={{ padding: '4 7' }}>
                         <Text style={styles.infoLabel}>Mains Connection:</Text>
                         <Text style={styles.infoValue}>{report.mainsConnection || 'N/A'}</Text>
                    </View>
                </View>

                {/* ---- TEST DATA & EQUIPMENT ---- */}
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                     {/* Test Data */}
                     <View style={{ flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 3 }}>
                          <View style={[styles.sectionHeader, { marginTop: 0, marginBottom: 0, padding: '4 8' }]}><Text>Test Data</Text></View>
                          <View style={{ borderBottomWidth: 1, borderColor: '#d1d5db', padding: '4 7' }}>
                               <Text style={styles.infoLabel}>Performed by</Text>
                               <Text style={styles.infoValue}>{report.performedBy}</Text>
                          </View>
                          <View style={{ padding: '4 7' }}>
                               <Text style={styles.infoLabel}>Tester Name</Text>
                               <Text style={styles.infoValue}>{report.testerName}</Text>
                          </View>
                     </View>

                     {/* Test Equipment used */}
                     <View style={{ flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 3 }}>
                          <View style={[styles.sectionHeader, { marginTop: 0, marginBottom: 0, padding: '4 8' }]}><Text>Test Equipment used</Text></View>
                          {equipment.map((eq, idx) => (
                              <View key={idx} style={{ borderBottomWidth: idx === equipment.length - 1 ? 0 : 1, borderColor: '#d1d5db', padding: '4 7' }}>
                                   <Text style={styles.infoLabel}>Test Equipment ID:</Text>
                                   <Text style={styles.infoValue}>{eq.id || '-'} / {eq.name}</Text>
                              </View>
                          ))}
                          {equipment.length === 0 && (
                               <View style={{ padding: '4 7' }}>
                                   <Text style={styles.infoLabel}>No equipment recorded.</Text>
                               </View>
                          )}
                     </View>
                </View>

                {/* ---- TEST RESULTS ---- */}
                <View style={styles.sectionHeader}><Text>Test Results</Text></View>
                <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 3 }}>
                    <View style={styles.tableHeader} fixed>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[0] }]}>Sl. No.</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[1] }]}>Test Step</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[2] }]}>Criterion</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[3] }]}>Unit</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[4] }]}>Result</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[5], textAlign: 'center' }]}>Pass/Fail</Text>
                    </View>
                    {steps.map((step, idx) => {
                        const parts = step.name.split('\n');
                        const title = parts[0] || '';
                        const question = parts.slice(1).join('\n') || '';

                        return (
                            <View key={idx} style={[idx % 2 === 1 ? styles.tableRowEven : {}, { borderBottomWidth: 1, borderColor: '#e5e7eb' }]} wrap={false}>
                                {/* Row 1: Title */}
                                <View style={{ flexDirection: 'row', minHeight: 22, alignItems: 'center' }}>
                                    <Text style={[styles.tableCell, { width: stepColWidths[0], textAlign: 'center', color: '#6b7280', fontFamily: 'Helvetica-Bold' }]}>{step.stepNo}.</Text>
                                    <Text style={[styles.tableCell, { flex: 1, fontFamily: 'Helvetica-Bold' }]}>{title}</Text>
                                </View>
                                {/* Row 2: Details */}
                                <View style={{ flexDirection: 'row', minHeight: 22, alignItems: 'flex-start', paddingBottom: 4 }}>
                                    <View style={{ width: stepColWidths[0] }} /> {/* spacer */}
                                    <Text style={[styles.tableCell, { width: stepColWidths[1], paddingTop: 0 }]}>{question}</Text>
                                    <Text style={[styles.tableCell, { width: stepColWidths[2], paddingTop: 0 }]}>{step.criterion}</Text>
                                    <Text style={[styles.tableCell, { width: stepColWidths[3], paddingTop: 0 }]}>{step.unit}</Text>
                                    <Text style={[styles.tableCell, { width: stepColWidths[4], paddingTop: 0 }]}>{step.result}</Text>
                                    <Text style={[
                                        styles.tableCell,
                                        styles.tableCellCenter,
                                        { width: stepColWidths[5], paddingTop: 0 },
                                        step.isOk ? styles.okPass : styles.okFail
                                    ]}>
                                        {step.isOk ? '✓ PASS' : '✗ FAIL'}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* ---- OVERALL ASSESSMENT & SIGNATURES ---- */}
                <View wrap={false}>
                    {/* Assessment Box */}
                    <View style={styles.assessmentBox}>
                        <View style={styles.assessmentHeader}>
                            <Text style={styles.assessmentHeaderText}>Overall Assessment</Text>
                        </View>
                        <View style={styles.assessmentBody}>
                            <View style={{ alignItems: 'center' }}>
                                <Text style={
                                    report.overallResult === 'Passed' ? styles.assessmentResultPass :
                                        report.overallResult === 'Failed' ? styles.assessmentResultFail :
                                            styles.assessmentResultConditional
                                }>
                                    {report.overallResult === 'Passed' ? '✓ PASSED' :
                                        report.overallResult === 'Failed' ? '✗ FAILED' : '⚠ CONDITIONAL'}
                                </Text>
                                <Text style={{ fontSize: 7, color: '#6b7280', marginTop: 2 }}>Overall Result</Text>
                            </View>
                            {report.overallAssessment ? (
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.infoLabel}>Remarks:</Text>
                                    <Text style={styles.assessmentRemarks}>{report.overallAssessment}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Signatures */}
                    <View style={styles.signatureRow}>
                        <View style={styles.signatureBlock}>
                            <Text style={styles.signatureLabel}>Tested By</Text>
                            <Text style={styles.signatureName}>{report.testerName}</Text>
                        </View>
                    </View>
                </View>

                {/* ---- FOOTER ---- */}
                <View style={[styles.footer, { justifyContent: 'space-between' }]} fixed>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => (
                        totalPages > 1 ? `Page ${pageNumber} of ${totalPages}` : ''
                    )} />
                    <Text style={styles.footerText}>
                        Generated: {new Date().toLocaleDateString('en-GB')}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default TestReportPdfDocument;
