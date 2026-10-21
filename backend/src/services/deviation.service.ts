import ExcelJS from 'exceljs';
import deviationRepository, { FindDeviationsQuery } from '../repositories/deviation.repository';
import prisma from '../lib/prisma';
import notificationService from './notification.service';
import { auditService, AuditEntity } from './audit.service';

export interface CreateDeviationDto {
    deviationNumber?: string;
    documentNumber?: string;
    version?: string;
    effectiveDate?: string;
    protocolPortion: string;
    protocolPortionCustom?: string;
    testSection: string;
    description: string;
    observedByName: string;
    observedBySignature?: string;
    dateObserved: string | Date;
    investigationImpact?: string;
    correctiveAction?: string;
    attachments?: string[];
    isResolved?: boolean;
    status?: string;
    createdById?: string;
}

export interface UpdateDeviationDto extends Partial<CreateDeviationDto> {
    completedByName?: string;
    completedBySignature?: string;
    completedDate?: string | Date;
    validationApproverName?: string;
    validationApproverSignature?: string;
    validationApprovalDate?: string | Date;
    smeApproverName?: string;
    smeApproverSignature?: string;
    smeApprovalDate?: string | Date;
    approverName?: string;
    approverSignature?: string;
    approvalDate?: string | Date;
}

export interface SignDeviationDto {
    role: 'OBSERVER' | 'COMPLETED' | 'VALIDATION' | 'SME' | 'APPROVAL';
    signerName: string;
    signatureUrl: string;
    date?: string | Date;
}

export class DeviationService {
    private deviationRepo = deviationRepository;

    async getDeviations(query: FindDeviationsQuery) {
        return this.deviationRepo.findAll(query);
    }

    async getDeviationById(id: string) {
        const deviation = await this.deviationRepo.findById(id);
        if (!deviation) {
            throw new Error(`Deviation with ID ${id} not found`);
        }
        return deviation;
    }

    async getNextNumber() {
        return this.deviationRepo.getNextDeviationNumber();
    }

    async getSigners() {
        return prisma.user.findMany({
            where: { isActive: true, isDeleted: false },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                signatureUrl: true,
            },
            orderBy: { name: 'asc' },
        });
    }

    private async notifyProxySigners(deviationId: string, deviationNumber: string, data: any, currentUser?: any) {
        if (!currentUser) return;

        const rolesToCheck = [
            { key: 'OBSERVER', label: 'Observed By', name: data.observedByName, signature: data.observedBySignature },
            { key: 'COMPLETED', label: 'Completed By', name: data.completedByName, signature: data.completedBySignature },
            { key: 'SME', label: 'SME Approver', name: data.smeApproverName, signature: data.smeApproverSignature },
            { key: 'APPROVAL', label: 'Approval', name: data.approverName, signature: data.approverSignature },
        ];

        try {
            const activeUsers = await prisma.user.findMany({
                where: { isActive: true, isDeleted: false },
                select: { id: true, name: true, email: true }
            });

            for (const item of rolesToCheck) {
                if (!item.name || !item.signature) continue;

                const targetUser = activeUsers.find(
                    u => u.name?.trim().toLowerCase() === item.name.trim().toLowerCase()
                );

                if (targetUser && targetUser.id !== currentUser.id) {
                    const message = `Your digital signature was applied to Validation Deviation ${deviationNumber} (${item.label}) by ${currentUser.name || currentUser.email}.`;

                    await notificationService.createNotification(
                        'DEVIATION_SIGNATURE',
                        message,
                        JSON.stringify({
                            deviationId,
                            deviationNumber,
                            role: item.key,
                            roleLabel: item.label,
                            signedByUserId: currentUser.id,
                            signedByUserName: currentUser.name || currentUser.email,
                            signedForUserId: targetUser.id,
                            signedForUserName: targetUser.name,
                        })
                    );

                    await auditService.log({
                        userId: currentUser.id,
                        action: 'PROXY_SIGN',
                        entity: AuditEntity.DEVIATION,
                        entityId: deviationId,
                        details: {
                            signedForId: targetUser.id,
                            signedForName: targetUser.name,
                            role: item.key,
                            deviationNumber
                        }
                    });
                }
            }
        } catch (err) {
            console.error('Failed to notify proxy signers:', err);
        }
    }

    async createDeviation(data: CreateDeviationDto, currentUser?: any) {
        const deviationNumber = data.deviationNumber && data.deviationNumber.trim() !== ''
            ? data.deviationNumber.trim()
            : await this.deviationRepo.getNextDeviationNumber();

        // Check for duplicates
        const existing = await this.deviationRepo.findByDeviationNumber(deviationNumber);
        if (existing) {
            throw new Error(`Deviation number '${deviationNumber}' already exists.`);
        }

        const created = await this.deviationRepo.create({
            deviationNumber,
            documentNumber: data.documentNumber || 'FORM-SH001',
            version: data.version || '1.0',
            effectiveDate: data.effectiveDate || '01-Oct-2026',
            protocolPortion: data.protocolPortion,
            protocolPortionCustom: data.protocolPortionCustom,
            testSection: data.testSection,
            description: data.description,
            observedByName: data.observedByName,
            observedBySignature: data.observedBySignature,
            dateObserved: new Date(data.dateObserved),
            investigationImpact: data.investigationImpact || '',
            correctiveAction: data.correctiveAction || '',
            attachments: data.attachments || [],
            isResolved: data.isResolved ?? false,
            status: data.status || 'DRAFT',
            ...(data.createdById ? { createdBy: { connect: { id: data.createdById } } } : {}),
        });

        await this.notifyProxySigners(created.id, created.deviationNumber, data, currentUser);

        return created;
    }

    async updateDeviation(id: string, data: UpdateDeviationDto, currentUser?: any) {
        await this.getDeviationById(id);

        const updateData: any = { ...data };

        if (data.dateObserved) updateData.dateObserved = new Date(data.dateObserved);
        if (data.completedDate) updateData.completedDate = new Date(data.completedDate);
        if (data.validationApprovalDate) updateData.validationApprovalDate = new Date(data.validationApprovalDate);
        if (data.smeApprovalDate) updateData.smeApprovalDate = new Date(data.smeApprovalDate);
        if (data.approvalDate) updateData.approvalDate = new Date(data.approvalDate);

        delete updateData.createdById;

        const updated = await this.deviationRepo.update(id, updateData);

        await this.notifyProxySigners(updated.id, updated.deviationNumber, data, currentUser);

        return updated;
    }

    async deleteDeviation(id: string) {
        await this.getDeviationById(id);
        return this.deviationRepo.delete(id);
    }

    async signDeviation(id: string, signDto: SignDeviationDto, currentUser?: any) {
        const deviation = await this.getDeviationById(id);
        const signDate = signDto.date ? new Date(signDto.date) : new Date();

        const updatePayload: any = {};

        switch (signDto.role) {
            case 'OBSERVER':
                updatePayload.observedByName = signDto.signerName;
                updatePayload.observedBySignature = signDto.signatureUrl;
                break;
            case 'COMPLETED':
                updatePayload.completedByName = signDto.signerName;
                updatePayload.completedBySignature = signDto.signatureUrl;
                updatePayload.completedDate = signDate;
                break;
            case 'VALIDATION':
                updatePayload.validationApproverName = signDto.signerName;
                updatePayload.validationApproverSignature = signDto.signatureUrl;
                updatePayload.validationApprovalDate = signDate;
                break;
            case 'SME':
                updatePayload.smeApproverName = signDto.signerName;
                updatePayload.smeApproverSignature = signDto.signatureUrl;
                updatePayload.smeApprovalDate = signDate;
                break;
            case 'APPROVAL':
                updatePayload.approverName = signDto.signerName;
                updatePayload.approverSignature = signDto.signatureUrl;
                updatePayload.approvalDate = signDate;
                updatePayload.status = 'APPROVED';
                break;
            default:
                throw new Error(`Invalid signing role: ${signDto.role}`);
        }

        const updated = await this.deviationRepo.update(id, updatePayload);
        await this.notifyProxySigners(updated.id, updated.deviationNumber, updatePayload, currentUser);
        return updated;
    }

    async exportToExcel(query: FindDeviationsQuery, selectedIds?: string[]): Promise<Buffer> {
        let deviations;
        if (selectedIds && selectedIds.length > 0) {
            deviations = await this.deviationRepo.findByIds(selectedIds);
        } else {
            const result = await this.deviationRepo.findAll({ ...query, limit: 10000 });
            deviations = result.deviations;
        }

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Avana Medical Devices';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Deviations', {
            views: [{ showGridLines: true }],
        });

        // Title Row
        sheet.mergeCells('A1:L1');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'Avana Medical Devices — Validation Deviation Register (FORM-SH001)';
        titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E3A8A' }, // Deep Blue
        };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(1).height = 36;

        // Subtitle Info
        sheet.mergeCells('A2:K2');
        const subCell = sheet.getCell('A2');
        subCell.value = `Document: FORM-SH001 | Version: 1.0 | Exported On: ${new Date().toLocaleDateString('en-GB')} | Total Records: ${deviations.length}`;
        subCell.font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF475569' } };
        subCell.alignment = { vertical: 'middle', horizontal: 'center' };
        sheet.getRow(2).height = 20;

        // Header Columns
        const headers = [
            { header: 'Deviation No', key: 'deviationNumber', width: 16 },
            { header: 'Protocol', key: 'protocolPortion', width: 12 },
            { header: 'Test Section', key: 'testSection', width: 22 },
            { header: 'Observed By', key: 'observedByName', width: 18 },
            { header: 'Date Observed', key: 'dateObserved', width: 14 },
            { header: 'Status', key: 'status', width: 14 },
            { header: 'Closed?', key: 'isResolved', width: 10 },
            { header: 'Description', key: 'description', width: 35 },
            { header: 'Completed By', key: 'completedBy', width: 18 },
            { header: 'SME Approval', key: 'smeApproval', width: 18 },
            { header: 'Approval', key: 'approval', width: 18 },
        ];

        const headerRow = sheet.getRow(4);
        headers.forEach((h, idx) => {
            const cell = headerRow.getCell(idx + 1);
            cell.value = h.header;
            cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF0284C7' }, // Primary Sky
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            sheet.getColumn(idx + 1).width = h.width;
        });
        headerRow.height = 28;

        // Populate Data Rows
        deviations.forEach((d, index) => {
            const rowNumber = index + 5;
            const row = sheet.getRow(rowNumber);

            const formatDate = (date?: Date | null) => {
                if (!date) return '-';
                const dObj = new Date(date);
                return isNaN(dObj.getTime()) ? '-' : dObj.toLocaleDateString('en-GB');
            };

            row.values = [
                d.deviationNumber,
                d.protocolPortion === 'OTHER' ? (d.protocolPortionCustom || 'Other') : d.protocolPortion,
                d.testSection,
                d.observedByName,
                formatDate(d.dateObserved),
                d.status,
                d.isResolved ? 'YES' : 'NO',
                d.description,
                d.completedByName ? `${d.completedByName} (${formatDate(d.completedDate)})` : '-',
                d.smeApproverName ? `${d.smeApproverName} (${formatDate(d.smeApprovalDate)})` : '-',
                d.approverName ? `${d.approverName} (${formatDate(d.approvalDate)})` : '-',
            ];

            // Alternating zebra row colors
            const isEven = index % 2 === 0;
            const bgColor = isEven ? 'FFF8FAFC' : 'FFFFFFFF';

            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.font = { name: 'Arial', size: 9 };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: bgColor },
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                };
                cell.alignment = {
                    vertical: 'middle',
                    horizontal: [1, 2, 5, 6, 7].includes(colNumber) ? 'center' : 'left',
                    wrapText: colNumber === 8,
                };
            });
            row.height = 24;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
}

export default new DeviationService();
