import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { TestReport, TestEquipment, TestStep } from '../src/api/test-reports.api';

// --- Styles ---
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
const stepColWidths = ['5%', '28%', '28%', '12%', '16%', '11%'];

const TestReportPdfDocument: React.FC<Props> = ({ report, deviceSerialNumber, rmaId }) => {
    const equipment = (report.equipmentUsed || []) as TestEquipment[];
    const steps = (report.testSteps || []) as TestStep[];

    return (
        <Document title={`Test Report - ${rmaId} - ${deviceSerialNumber}`} author="Avana Technology Services">
            <Page size="A4" style={styles.page}>

                {/* ---- HEADER ---- */}
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
                        <Text style={styles.reportTitle}>TEST REPORT</Text>
                        <Text style={styles.reportNo}>
                            {report.reportNo ? `Report No: ${report.reportNo}` : ''}
                        </Text>
                        <Text style={styles.reportNo}>Date: {formatDate(report.testDate)}</Text>
                        <Text style={styles.reportNo}>RMA: {rmaId}</Text>
                    </View>
                </View>

                {/* ---- DEVICE INFORMATION ---- */}
                <View style={styles.sectionHeader}><Text>Device & Test Information</Text></View>
                <View style={styles.infoGrid}>
                    <View style={styles.infoCell}>
                        <Text style={styles.infoLabel}>Device Type</Text>
                        <Text style={styles.infoValue}>{report.deviceType}</Text>
                    </View>
                    <View style={styles.infoCell}>
                        <Text style={styles.infoLabel}>Serial Number</Text>
                        <Text style={styles.infoValue}>{deviceSerialNumber}</Text>
                    </View>
                    <View style={[styles.infoCell, { borderRightWidth: 0 }]}>
                        <Text style={styles.infoLabel}>Manufacturer</Text>
                        <Text style={styles.infoValue}>{report.manufacturer}</Text>
                    </View>
                    <View style={styles.infoCell}>
                        <Text style={styles.infoLabel}>Mains Connection</Text>
                        <Text style={styles.infoValue}>{report.mainsConnection}</Text>
                    </View>
                    <View style={styles.infoCell}>
                        <Text style={styles.infoLabel}>Kind of Test</Text>
                        <Text style={styles.infoValue}>{report.kindOfTest}</Text>
                    </View>
                    <View style={[styles.infoCell, { borderRightWidth: 0 }]}>
                        <Text style={styles.infoLabel}>Test Date</Text>
                        <Text style={styles.infoValue}>{formatDate(report.testDate)}</Text>
                    </View>
                    <View style={styles.infoCellHalf}>
                        <Text style={styles.infoLabel}>Performed By</Text>
                        <Text style={styles.infoValue}>{report.performedBy}</Text>
                    </View>
                    <View style={[styles.infoCellHalf, { borderRightWidth: 0 }]}>
                        <Text style={styles.infoLabel}>Tester</Text>
                        <Text style={styles.infoValue}>{report.testerName}</Text>
                    </View>
                </View>

                {/* ---- EQUIPMENT USED ---- */}
                {equipment.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}><Text>Test Equipment Used</Text></View>
                        <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 3 }}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableHeaderCell, { width: '30%' }]}>Equipment ID / S/N</Text>
                                <Text style={[styles.tableHeaderCell, { width: '70%' }]}>Equipment Name / Description</Text>
                            </View>
                            {equipment.map((eq, idx) => (
                                <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                                    <Text style={[styles.tableCell, { width: '30%' }]}>{eq.id || '-'}</Text>
                                    <Text style={[styles.tableCell, { width: '70%' }]}>{eq.name}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* ---- TEST RESULTS ---- */}
                <View style={styles.sectionHeader}><Text>Test Results</Text></View>
                <View style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 3 }}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[0] }]}>No.</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[1] }]}>Test Name</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[2] }]}>Criterion / Limit</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[3] }]}>Unit</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[4] }]}>Result</Text>
                        <Text style={[styles.tableHeaderCell, { width: stepColWidths[5], textAlign: 'center' }]}>Pass/Fail</Text>
                    </View>
                    {steps.map((step, idx) => (
                        <View key={idx} style={[styles.tableRow, idx % 2 === 1 ? styles.tableRowEven : {}]}>
                            <Text style={[styles.tableCell, { width: stepColWidths[0], textAlign: 'center', color: '#6b7280' }]}>{step.stepNo}</Text>
                            <Text style={[styles.tableCell, { width: stepColWidths[1] }]}>{step.name}</Text>
                            <Text style={[styles.tableCell, { width: stepColWidths[2] }]}>{step.criterion}</Text>
                            <Text style={[styles.tableCell, { width: stepColWidths[3] }]}>{step.unit}</Text>
                            <Text style={[styles.tableCell, { width: stepColWidths[4] }]}>{step.result}</Text>
                            <Text style={[
                                styles.tableCell,
                                styles.tableCellCenter,
                                { width: stepColWidths[5] },
                                step.isOk ? styles.okPass : styles.okFail
                            ]}>
                                {step.isOk ? '✓ PASS' : '✗ FAIL'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* ---- OVERALL ASSESSMENT ---- */}
                <View style={styles.assessmentBox}>
                    <View style={styles.assessmentHeader}>
                        <Text style={styles.assessmentHeaderText}>Overall Assessment</Text>
                    </View>
                    <View style={styles.assessmentBody}>
                        <View>
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
                            <Text style={styles.assessmentRemarks}>{report.overallAssessment}</Text>
                        ) : null}
                    </View>
                </View>

                {/* ---- SIGNATURES ---- */}
                <View style={styles.signatureRow}>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureLabel}>Tested By</Text>
                        <Text style={styles.signatureName}>{report.testerName}</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <Text style={styles.signatureLabel}>Authorized By</Text>
                        <Text style={styles.signatureName}>{report.performedBy}</Text>
                    </View>
                    {report.copyPrintedBy && (
                        <View style={styles.signatureBlock}>
                            <Text style={styles.signatureLabel}>Copy Printed By</Text>
                            <Text style={styles.signatureName}>{report.copyPrintedBy}</Text>
                        </View>
                    )}
                </View>

                {/* ---- FOOTER ---- */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerText}>
                        Avana Technology Services Pvt. Ltd. | Confidential Test Document
                    </Text>
                    <Text style={styles.footerText}>
                        Generated: {new Date().toLocaleDateString('en-GB')} | RMA: {rmaId} | S/N: {deviceSerialNumber}
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default TestReportPdfDocument;
