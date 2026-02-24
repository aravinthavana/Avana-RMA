import rmaRepository, { RmaRepository, RmaFilters, PaginationOptions, CreateRmaData } from '../repositories/rma.repository';
import serviceCycleRepository, { ServiceCycleRepository, AddHistoryEventData } from '../repositories/service-cycle.repository';
import customerRepository, { CustomerRepository } from '../repositories/customer.repository';

export interface CreateRmaDto {
    customerId: string;
    devices: Array<{
        articleNumber?: string;
        serialNumber: string;
        quantity?: number;
    }>;
    serviceCycles: Array<{
        deviceSerialNumber: string;
        status: string;
        issueDescription?: string;
        accessoriesIncluded?: string;
    }>;
    dateOfIncident: string;
    dateOfReport: string;
    attachment?: string;
    isInjuryRelated: boolean;
    injuryDetails?: string;
}

export interface UpdateRmaDto {
    dateOfIncident?: string;
    dateOfReport?: string;
    attachment?: string;
}

export interface UpdateServiceCycleStatusDto {
    status: string;
    notes?: string;
}

export class RmaService {
    constructor(
        private readonly rmaRepo: RmaRepository,
        private readonly serviceCycleRepo: ServiceCycleRepository,
        private readonly customerRepo: CustomerRepository
    ) { }

    /**
     * Get all RMAs with pagination and filtering
     */
    async getAllRmas(pagination: PaginationOptions = {}, filters: RmaFilters = {}) {
        return await this.rmaRepo.findAll(pagination, filters);
    }

    /**
     * Export RMAs to CSV format based on filters
     */
    async exportRmasToCsv(filters: RmaFilters = {}): Promise<string> {
        const rmas = await this.rmaRepo.findAllForExport(filters);

        // Define CSV headers
        const headers = [
            'RMA ID',
            'Creation Date',
            'Customer Name',
            'Customer Company',
            'Device Serials',
            'Current Status',
            'Safety Incident',
            'Injury Details'
        ];

        // Format rows
        const rows = rmas.map(rma => {
            const customerName = rma.customer?.contactPerson || rma.customerName || 'N/A';
            const companyName = rma.customer?.name || 'Unknown Company';
            const devices = rma.devices?.map(d => d.serialNumber).join('; ') || 'N/A';

            // Get unique statuses
            const statuses = rma.serviceCycles?.map(c => c.status) || [];
            const currentStatus = [...new Set(statuses)].join('; ') || 'Pending';

            return [
                rma.id,
                rma.creationDate,
                customerName,
                companyName,
                devices,
                currentStatus,
                rma.isInjuryRelated ? 'Yes' : 'No',
                rma.injuryDetails || ''
            ].map(val => {
                // Properly escape strings for CSV insertion
                const stringVal = String(val);
                if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
                    return `"${stringVal.replace(/"/g, '""')}"`;
                }
                return stringVal;
            }).join(',');
        });

        // Combine headers and rows
        return [
            headers.join(','),
            ...rows
        ].join('\n');
    }

    /**
     * Get a single RMA by ID
     */
    async getRmaById(id: string) {
        if (!id) {
            throw new Error('RMA ID is required');
        }

        const rma = await this.rmaRepo.findById(id);
        if (!rma) {
            throw new Error(`RMA with ID ${id} not found`);
        }

        return rma;
    }

    /**
     * Create a new RMA
     */
    async createRma(data: CreateRmaDto) {
        // Validate customer exists
        const customer = await this.customerRepo.findById(data.customerId);
        if (!customer) {
            throw new Error(`Customer with ID ${data.customerId} not found`);
        }

        // Validate devices
        if (!data.devices || data.devices.length === 0) {
            throw new Error('At least one device is required');
        }

        // Validate serial numbers are unique
        const serialNumbers = data.devices.map(d => d.serialNumber);
        const uniqueSerials = new Set(serialNumbers);
        if (serialNumbers.length !== uniqueSerials.size) {
            throw new Error('Duplicate serial numbers are not allowed in the same RMA');
        }

        // Validate service cycles
        if (!data.serviceCycles || data.serviceCycles.length === 0) {
            throw new Error('At least one service cycle is required');
        }

        // Ensure all service cycle device serial numbers exist in devices
        const deviceSerials = new Set(serialNumbers);
        for (const cycle of data.serviceCycles) {
            if (!deviceSerials.has(cycle.deviceSerialNumber)) {
                throw new Error(`Service cycle references non-existent device serial: ${cycle.deviceSerialNumber}`);
            }
        }

        // Generate RMA ID
        const rmaId = this.rmaRepo.generateId();
        const now = new Date().toISOString();

        // Prepare service cycles with dates
        const serviceCycles = data.serviceCycles.map(cycle => ({
            ...cycle,
            creationDate: now,
            statusDate: now,
        }));

        // Create RMA
        const rmaData: CreateRmaData = {
            id: rmaId,
            customerId: data.customerId,
            devices: data.devices,
            serviceCycles,
            creationDate: now,
            lastUpdateDate: now,
            dateOfIncident: data.dateOfIncident,
            dateOfReport: data.dateOfReport,
            attachment: data.attachment,
            isInjuryRelated: data.isInjuryRelated,
            injuryDetails: data.injuryDetails,
        };

        return await this.rmaRepo.create(rmaData);
    }

    /**
     * Update an RMA
     */
    async updateRma(id: string, data: UpdateRmaDto) {
        if (!id) {
            throw new Error('RMA ID is required');
        }

        // Check if RMA exists
        await this.getRmaById(id);

        return await this.rmaRepo.update(id, data);
    }

    /**
     * Delete an RMA
     */
    async deleteRma(id: string) {
        if (!id) {
            throw new Error('RMA ID is required');
        }

        // Check if RMA exists
        await this.getRmaById(id);

        return await this.rmaRepo.delete(id);
    }

    /**
     * Update service cycle status by RMA ID and device serial number
     */
    async updateServiceCycleStatusBySerialNumber(
        rmaId: string,
        deviceSerialNumber: string,
        newStatus: string,
        notes?: string
    ) {
        // Get the RMA
        const rma = await this.rmaRepo.findById(rmaId);
        if (!rma) {
            throw new Error(`RMA not found: ${rmaId}`);
        }

        // Find the service cycle by device serial number
        const serviceCycle = rma.serviceCycles.find(
            cycle => cycle.deviceSerialNumber === deviceSerialNumber
        );

        if (!serviceCycle) {
            throw new Error(`Service cycle not found for device: ${deviceSerialNumber}`);
        }

        // Update the service cycle status
        const updatedCycle = await this.updateServiceCycleStatus(serviceCycle.id, {
            status: newStatus,
            notes
        });

        // Update RMA last update date
        await this.rmaRepo.update(rmaId, {
            lastUpdateDate: new Date().toISOString()
        });

        return await this.rmaRepo.findById(rmaId);
    }

    /**
     * Update service cycle status and add history
     */
    async updateServiceCycleStatus(
        cycleId: number,
        statusUpdate: UpdateServiceCycleStatusDto
    ) {
        // Validate service cycle exists
        const cycle = await this.serviceCycleRepo.findById(cycleId);
        if (!cycle) {
            throw new Error(`Service cycle with ID ${cycleId} not found`);
        }

        const now = new Date().toISOString();

        // Update status
        const updatedCycle = await this.serviceCycleRepo.updateStatus(
            cycleId,
            statusUpdate.status,
            now
        );

        // Add history event
        const historyData: AddHistoryEventData = {
            status: statusUpdate.status,
            date: now,
            notes: statusUpdate.notes,
        };

        await this.serviceCycleRepo.addHistoryEvent(cycleId, historyData);

        // Update RMA's lastUpdateDate
        await this.rmaRepo.update(cycle.rmaId, {});

        return updatedCycle;
    }

    /**
     * Add a new service cycle to an existing RMA
     */
    async addServiceCycle(rmaId: string, data: {
        deviceSerialNumber: string;
        status: string;
        issueDescription?: string;
        accessoriesIncluded?: string;
    }) {
        // Validate RMA exists
        const rma = await this.getRmaById(rmaId);

        // Validate device exists in this RMA
        const deviceExists = rma.devices.some(d => d.serialNumber === data.deviceSerialNumber);
        if (!deviceExists) {
            throw new Error(`Device with serial ${data.deviceSerialNumber} not found in this RMA`);
        }

        const now = new Date().toISOString();

        const cycle = await this.serviceCycleRepo.create({
            rmaId,
            deviceSerialNumber: data.deviceSerialNumber,
            status: data.status,
            creationDate: now,
            statusDate: now,
            issueDescription: data.issueDescription,
            accessoriesIncluded: data.accessoriesIncluded,
        });

        // Update RMA's lastUpdateDate
        await this.rmaRepo.update(rmaId, {});

        return cycle;
    }

    /**
     * Get RMAs by customer ID
     */
    async getRmasByCustomer(customerId: string) {
        if (!customerId) {
            throw new Error('Customer ID is required');
        }

        return await this.rmaRepo.findByCustomerId(customerId);
    }
}

// Instantiate after class definition to avoid circular dependencies
export default new RmaService(rmaRepository, serviceCycleRepository, customerRepository);
