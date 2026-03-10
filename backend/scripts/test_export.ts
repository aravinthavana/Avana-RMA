import { RmaRepository } from '../src/repositories/rma.repository';
import { RmaService } from '../src/services/rma.service';
import { ServiceCycleRepository } from '../src/repositories/service-cycle.repository';
import { CustomerRepository } from '../src/repositories/customer.repository';

async function run() {
    console.log("Testing export...");

    const mockRmas = [
        {
            id: 'RMA-001',
            creationDate: new Date(),
            isInjuryRelated: false,
            injuryDetails: null,
            customerName: null, // intentionally missing to test edge cases
            customer: null, // intentionally missing
            devices: null, // intentionally missing
            serviceCycles: null // intentionally missing
        },
        {
            id: 'RMA-002',
            creationDate: new Date(),
            isInjuryRelated: true,
            injuryDetails: "Cut hand",
            customerName: "Legacy Name",
            customer: { name: "Test Corp", contactPerson: "Test Guy" },
            devices: [{ serialNumber: "SN123" }],
            serviceCycles: [{ status: "RECEIVED" }, { status: "EVALUATING" }]
        }
    ];

    const rmaRepo = {
        findAllForExport: async () => mockRmas
    } as unknown as RmaRepository;

    const serviceCycleRepo = {} as any;
    const customerRepo = {} as any;

    try {
        const rmaService = new RmaService(rmaRepo, serviceCycleRepo, customerRepo);
        const csv = await rmaService.exportRmasToCsv({});
        console.log("CSV Generated Successfully.");
        console.log(csv);
    } catch (e) {
        console.error("CSV Gen Failed:");
        console.error(e);
    }
}
run();
