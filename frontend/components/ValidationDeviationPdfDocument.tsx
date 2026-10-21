import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ValidationDeviation } from '../types';

const styles = StyleSheet.create({
    page: {
        fontFamily: 'Helvetica',
        fontSize: 8.5,
        backgroundColor: '#ffffff',
        paddingTop: 28,
        paddingBottom: 28,
        paddingHorizontal: 30,
        color: '#000000',
    },
    // Top document header
    headerContainer: {
        marginBottom: 10,
    },
    headerTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    logo: {
        width: 100,
        height: 32,
        objectFit: 'contain',
        marginBottom: 4,
    },
    docMetaLeft: {
        fontSize: 8,
        color: '#222222',
    },
    docMetaBold: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 9,
    },
    docMetaRight: {
        fontSize: 8,
        textAlign: 'right',
        color: '#222222',
    },
    title: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 12.5,
        marginTop: 4,
        color: '#000000',
    },
    // Table borders
    tableBox: {
        border: '1.2px solid #000000',
        marginBottom: 6,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableHeaderCell: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8,
        backgroundColor: '#f1f1f1',
        padding: '3 5',
        borderRight: '1px solid #000000',
        borderBottom: '1px solid #000000',
    },
    tableCell: {
        padding: '4 6',
        fontSize: 8.5,
        borderRight: '1px solid #000000',
    },
    lastCell: {
        borderRight: 'none',
    },
    // Section styles
    sectionHeaderBar: {
        padding: '3 6',
        backgroundColor: '#ffffff',
        borderBottom: '0.8px solid #000000',
    },
    sectionTitle: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 8.5,
    },
    guidanceText: {
        fontFamily: 'Helvetica-Oblique',
        fontSize: 7.5,
        color: '#444444',
        marginTop: 1,
    },
    contentArea: {
        padding: '6 8',
        minHeight: 55,
        fontSize: 8.5,
        lineHeight: 1.3,
    },
    subRow: {
        flexDirection: 'row',
        borderTop: '1px solid #000000',
        backgroundColor: '#fafafa',
    },
    subRowColLeft: {
        width: '65%',
        padding: '4 6',
        borderRight: '1px solid #000000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    subRowColRight: {
        width: '35%',
        padding: '4 6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sigImage: {
        height: 24,
        maxWidth: 120,
        objectFit: 'contain',
    },
    // Verification Section
    verifRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4 8',
        borderBottom: '1px solid #000000',
        backgroundColor: '#fafafa',
    },
    approvalRow: {
        flexDirection: 'row',
        borderBottom: '1px solid #000000',
        minHeight: 28,
        alignItems: 'center',
    },
    approvalColLeft: {
        width: '70%',
        padding: '3 6',
        borderRight: '1px solid #000000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    approvalColRight: {
        width: '30%',
        padding: '3 6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 18,
        left: 30,
        right: 30,
        textAlign: 'center',
    },
    footerPageNumber: {
        fontSize: 7.5,
        fontFamily: 'Helvetica-Bold',
        textAlign: 'center',
        marginBottom: 2,
    },
    footerConfidential: {
        fontSize: 6.5,
        color: '#555555',
        textAlign: 'center',
    },
});

interface ValidationDeviationPdfDocumentProps {
    deviation?: Partial<ValidationDeviation> | null;
    isBlank?: boolean;
}

export const ValidationDeviationPdfDocument: React.FC<ValidationDeviationPdfDocumentProps> = ({ deviation, isBlank = false }) => {
    const formatDate = (dateString?: string | null) => {
        if (!dateString) return isBlank ? '____-____-________' : '-';
        const d = new Date(dateString);
        if (isNaN(d.getTime())) return '-';
        const day = d.getDate().toString().padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = months[d.getMonth()];
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const docNumber = deviation?.documentNumber || 'FORM-SH001';
    const docVersion = deviation?.version || '1.0';
    const effectiveDate = deviation?.effectiveDate || '10-Oct-2022';

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerTopRow}>
                        <View>
                            <Image src="/avana-logo.png" style={styles.logo} />
                            <Text style={styles.docMetaLeft}>Document Number</Text>
                            <Text style={styles.docMetaBold}>{docNumber}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.docMetaRight}>Version</Text>
                            <Text style={[styles.docMetaBold, { textAlign: 'right' }]}>{docVersion}</Text>
                            <Text style={[styles.docMetaRight, { marginTop: 2 }]}>Effective</Text>
                            <Text style={[styles.docMetaBold, { textAlign: 'right' }]}>{effectiveDate}</Text>
                        </View>
                    </View>
                    <Text style={styles.title}>Validation Deviation Form</Text>
                </View>

                {/* Top Info Table: Deviation Number | Protocol Portion | Test Section */}
                <View style={styles.tableBox}>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableHeaderCell, { width: '28%' }]}>Deviation Number</Text>
                        <Text style={[styles.tableHeaderCell, { width: '32%' }]}>Protocol Portion (IQ, PQ)</Text>
                        <Text style={[styles.tableHeaderCell, { width: '40%' }, styles.lastCell]}>Test Section</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.tableCell, { width: '28%', fontFamily: 'Helvetica-Bold' }]}>
                            {isBlank ? 'DEV-________________' : (deviation?.deviationNumber || '')}
                        </Text>
                        <Text style={[styles.tableCell, { width: '32%' }]}>
                            {isBlank ? (
                                '[  ] IQ     [  ] PQ     [  ] Other'
                            ) : (
                                deviation?.protocolPortion === 'OTHER' ? (deviation?.protocolPortionCustom || 'Other') : (deviation?.protocolPortion || '-')
                            )}
                        </Text>
                        <Text style={[styles.tableCell, { width: '40%' }, styles.lastCell]}>
                            {isBlank ? '' : (deviation?.testSection || '')}
                        </Text>
                    </View>
                </View>

                {/* Section 1: Describe the Deviation */}
                <View style={styles.tableBox}>
                    <View style={styles.sectionHeaderBar}>
                        <Text style={styles.sectionTitle}>Describe the Deviation</Text>
                        <Text style={styles.guidanceText}>
                            [Describe in detail the deviation. Be specific, including references to the protocol section, the difference between expected and actual results, etc.]
                        </Text>
                    </View>
                    <View style={[styles.contentArea, isBlank && { minHeight: 75 }]}>
                        <Text>{isBlank ? '' : (deviation?.description || '-')}</Text>
                    </View>
                    <View style={styles.subRow}>
                        <View style={styles.subRowColLeft}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Observed By (Print/Sign):</Text>
                            {isBlank ? (
                                <Text style={{ color: '#555555' }}>Print: ___________________  Sign: ___________________</Text>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ marginRight: 6 }}>{deviation?.observedByName || '-'}</Text>
                                    {deviation?.observedBySignature && (
                                        <Image src={deviation.observedBySignature} style={styles.sigImage} />
                                    )}
                                </View>
                            )}
                        </View>
                        <View style={styles.subRowColRight}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Date Observed:</Text>
                            <Text>{isBlank ? '____-____-________' : formatDate(deviation?.dateObserved)}</Text>
                        </View>
                    </View>
                </View>

                {/* Section 2: Investigation and impact */}
                <View style={styles.tableBox}>
                    <View style={styles.sectionHeaderBar}>
                        <Text style={styles.sectionTitle}>Investigation and impact</Text>
                        <Text style={styles.guidanceText}>
                            [Give an explanation of how and why the deviation occurred and describe what impact, if any, the deviation has on the validity of the protocol. Reference additional evidence as needed]
                        </Text>
                    </View>
                    <View style={[styles.contentArea, isBlank && { minHeight: 75 }]}>
                        <Text>{isBlank ? '' : (deviation?.investigationImpact || '-')}</Text>
                    </View>
                </View>

                {/* Section 3: Correction / Corrective Action / Resolution */}
                <View style={styles.tableBox}>
                    <View style={styles.sectionHeaderBar}>
                        <Text style={styles.sectionTitle}>Correction / Corrective Action / Resolution</Text>
                        <Text style={styles.guidanceText}>
                            [ State all specific actions to address the deviation and its associated risks, e.g. Protocol document clarification, test re-execution, additional testing, etc. Include reference to any initiated NCR/Deviation/CAPA and whether an update to a risk management file is needed. If no further action is required, provide justification. Attach any supporting data as necessary]
                        </Text>
                    </View>
                    <View style={[styles.contentArea, isBlank && { minHeight: 75 }]}>
                        <Text>{isBlank ? '' : (deviation?.correctiveAction || '-')}</Text>
                    </View>
                </View>

                {/* Section 4: Verification & Approvals */}
                <View style={styles.tableBox}>
                    <View style={styles.sectionHeaderBar}>
                        <Text style={styles.sectionTitle}>Verification</Text>
                    </View>

                    {/* Deviation Closed Status */}
                    <View style={styles.verifRow}>
                        <Text style={{ fontFamily: 'Helvetica-Bold' }}>All actions were satisfactorily resolved. Deviation Closed?</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={{ fontFamily: 'Helvetica-Bold', marginRight: 15 }}>
                                Yes {isBlank ? '[   ]' : (deviation?.isResolved ? '[ X ]' : '[   ]')}
                            </Text>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>
                                No {isBlank ? '[   ]' : (!deviation?.isResolved ? '[ X ]' : '[   ]')}
                            </Text>
                        </View>
                    </View>

                    {/* 1. Completed By */}
                    <View style={styles.approvalRow}>
                        <View style={styles.approvalColLeft}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Completed By (Print/Sign):</Text>
                            {isBlank ? (
                                <Text style={{ color: '#555555' }}>Print: ___________________  Sign: ___________________</Text>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ marginRight: 6 }}>{deviation?.completedByName || '-'}</Text>
                                    {deviation?.completedBySignature && (
                                        <Image src={deviation.completedBySignature} style={styles.sigImage} />
                                    )}
                                </View>
                            )}
                        </View>
                        <View style={styles.approvalColRight}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Date:</Text>
                            <Text>{isBlank ? '____-____-________' : formatDate(deviation?.completedDate)}</Text>
                        </View>
                    </View>

                    {/* 2. Validation or Designee Approval */}
                    <View style={styles.approvalRow}>
                        <View style={styles.approvalColLeft}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Validation or Designee Approval (Print, Sign):</Text>
                            {isBlank ? (
                                <Text style={{ color: '#555555' }}>Print: ___________________  Sign: ___________________</Text>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ marginRight: 6 }}>{deviation?.validationApproverName || '-'}</Text>
                                    {deviation?.validationApproverSignature && (
                                        <Image src={deviation.validationApproverSignature} style={styles.sigImage} />
                                    )}
                                </View>
                            )}
                        </View>
                        <View style={styles.approvalColRight}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Date:</Text>
                            <Text>{isBlank ? '____-____-________' : formatDate(deviation?.validationApprovalDate)}</Text>
                        </View>
                    </View>

                    {/* 3. Process Owner or SME Approval */}
                    <View style={styles.approvalRow}>
                        <View style={styles.approvalColLeft}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Process Owner or SME Approval (Print, Sign):</Text>
                            {isBlank ? (
                                <Text style={{ color: '#555555' }}>Print: ___________________  Sign: ___________________</Text>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ marginRight: 6 }}>{deviation?.smeApproverName || '-'}</Text>
                                    {deviation?.smeApproverSignature && (
                                        <Image src={deviation.smeApproverSignature} style={styles.sigImage} />
                                    )}
                                </View>
                            )}
                        </View>
                        <View style={styles.approvalColRight}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Date:</Text>
                            <Text>{isBlank ? '____-____-________' : formatDate(deviation?.smeApprovalDate)}</Text>
                        </View>
                    </View>

                    {/* 4. Approval (Print/Sign) - customized from Quality Approval */}
                    <View style={[styles.approvalRow, { borderBottom: 'none' }]}>
                        <View style={styles.approvalColLeft}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Approval (Print/Sign):</Text>
                            {isBlank ? (
                                <Text style={{ color: '#555555' }}>Print: ___________________  Sign: ___________________</Text>
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <Text style={{ marginRight: 6 }}>{deviation?.approverName || '-'}</Text>
                                    {deviation?.approverSignature && (
                                        <Image src={deviation.approverSignature} style={styles.sigImage} />
                                    )}
                                </View>
                            )}
                        </View>
                        <View style={styles.approvalColRight}>
                            <Text style={{ fontFamily: 'Helvetica-Bold' }}>Date:</Text>
                            <Text>{isBlank ? '____-____-________' : formatDate(deviation?.approvalDate)}</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer} fixed>
                    <Text style={styles.footerPageNumber} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
                    <Text style={styles.footerConfidential}>
                        This document is confidential and proprietary, and it may not be reproduced, used, or disclosed to others without written consent of Avana Medical Devices Pvt. Ltd.
                    </Text>
                </View>
            </Page>
        </Document>
    );
};

export default ValidationDeviationPdfDocument;
