import express from 'express';
import cors from 'cors';
import db from './database';
import { RMA, Device, ServiceCycle, HistoryEvent } from './types';

const app = express();
const port = 3001;

const whitelist = [
    'http://localhost:3000',
    'https://3000-firebase-avana-rmagit-1762161040513.cluster-zumahodzirciuujpqvsniawo3o.cloudworkstations.dev'
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.options('*', cors(corsOptions));

// Promisify db.run, db.get, db.all
const run = (sql: string, params: any[] = []) => new Promise<number>((resolve, reject) => {
    db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
    });
});

const get = (sql: string, params: any[] = []) => new Promise<any>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
    });
});

const all = (sql: string, params: any[] = []) => new Promise<any[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
    });
});


app.get('/api/customers', async (req, res) => {
    try {
        const rows = await all("SELECT * FROM customers");
        res.json(rows);
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

app.get('/api/customers/:id', async (req, res) => {
    try {
        const row = await get("SELECT * FROM customers WHERE id = ?", [req.params.id]);
        if (row) {
            res.json(row);
        } else {
            res.status(404).send('Customer not found');
        }
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

app.post('/api/customers', async (req, res) => {
    const { name, contactPerson, email, phone, address } = req.body;
    const newId = `CUST-${Date.now()}`;
    try {
        await run(
            `INSERT INTO customers (id, name, contactPerson, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
            [newId, name, contactPerson, email, phone, address]
        );
        res.status(201).json({ id: newId, name, contactPerson, email, phone, address });
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

app.put('/api/customers/:id', async (req, res) => {
    const { name, contactPerson, email, phone, address } = req.body;
    try {
        await run(
            `UPDATE customers SET name = ?, contactPerson = ?, email = ?, phone = ?, address = ? WHERE id = ?`,
            [name, contactPerson, email, phone, address, req.params.id]
        );
        res.status(200).json({ id: req.params.id, name, contactPerson, email, phone, address });
    } catch (err: any) {
        res.status(500).send(err.message);
    }
});

app.delete('/api/customers/:id', async (req, res) => {
    const customerId = req.params.id;
    try {
        await run('BEGIN TRANSACTION');
        await run(`DELETE FROM service_history WHERE serviceCycleId IN (SELECT id FROM service_cycles WHERE rmaId IN (SELECT id FROM rmas WHERE customerId = ?))`, [customerId]);
        await run(`DELETE FROM service_cycles WHERE rmaId IN (SELECT id FROM rmas WHERE customerId = ?)`, [customerId]);
        await run(`DELETE FROM rma_devices WHERE rmaId IN (SELECT id FROM rmas WHERE customerId = ?)`, [customerId]);
        await run(`DELETE FROM rmas WHERE customerId = ?`, [customerId]);
        await run(`DELETE FROM customers WHERE id = ?`, [customerId]);
        await run('COMMIT');
        res.status(204).send();
    } catch (err: any) {
        await run('ROLLBACK');
        res.status(500).send(err.message);
    }
});

app.post('/api/rmas', async (req, res) => {
    const { customer, devices, dateOfIncident, dateOfReport, attachment } = req.body;

    if (!customer || !devices || !devices.length) {
        return res.status(400).send('Missing required RMA data.');
    }

    for (const device of devices) {
        if (device.quantity < 1) {
            return res.status(400).send('Device quantity must be at least 1.');
        }
    }

    const rmaId = `RMA-${Date.now()}`;
    const now = new Date().toISOString();

    try {
        await run('BEGIN TRANSACTION');

        const rmaSql = `INSERT INTO rmas (id, customerId, creationDate, lastUpdateDate, dateOfIncident, dateOfReport, attachment) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await run(rmaSql, [rmaId, customer.id, now, now, dateOfIncident, dateOfReport, attachment || null]);

        const serviceCycles: ServiceCycle[] = [];
        for (const device of devices) {
            const status = 'Pending';
            const issueDescription = 'Initial registration';
            const accessoriesIncluded = '';
            const historyNotes = 'RMA created and device registered.';

            const deviceSql = `INSERT INTO rma_devices (rmaId, model, partNumber, serialNumber, quantity) VALUES (?, ?, ?, ?, ?)`;
            await run(deviceSql, [rmaId, device.model, device.partNumber, device.serialNumber, device.quantity]);

            const cycleSql = `INSERT INTO service_cycles (rmaId, deviceSerialNumber, status, creationDate, statusDate, issueDescription, accessoriesIncluded) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const serviceCycleId = await run(cycleSql, [rmaId, device.serialNumber, status, now, now, issueDescription, accessoriesIncluded]);

            const historySql = `INSERT INTO service_history (serviceCycleId, status, date, notes) VALUES (?, ?, ?, ?)`;
            await run(historySql, [serviceCycleId, status, now, historyNotes]);

            serviceCycles.push({
                // @ts-ignore
                id: serviceCycleId,
                deviceSerialNumber: device.serialNumber,
                status,
                creationDate: now,
                statusDate: now,
                issueDescription,
                accessoriesIncluded,
                history: [{ status, date: now, notes: historyNotes }]
            });
        }

        await run('COMMIT');

        res.status(201).json({
            id: rmaId,
            creationDate: now,
            lastUpdateDate: now,
            dateOfIncident,
            dateOfReport,
            attachment: attachment || null,
            customer,
            devices,
            serviceCycles,
        });

    } catch (error: any) {
        await run('ROLLBACK');
        res.status(500).send(error.message);
    }
});


app.put('/api/rmas/:id', async (req, res) => {
    const { customer, devices, dateOfIncident, dateOfReport, attachment, serviceCycles } = req.body;
    const rmaId = req.params.id;
    const now = new Date().toISOString();

    for (const device of devices) {
        if (device.quantity < 1) {
            return res.status(400).send('Device quantity must be at least 1.');
        }
    }

    try {
        await run('BEGIN TRANSACTION');

        await run(`UPDATE rmas SET customerId = ?, lastUpdateDate = ?, dateOfIncident = ?, dateOfReport = ?, attachment = ? WHERE id = ?`,
            [customer.id, now, dateOfIncident, dateOfReport, attachment, rmaId]);

        await run(`DELETE FROM rma_devices WHERE rmaId = ?`, [rmaId]);
        for (const device of devices) {
            await run(`INSERT INTO rma_devices (rmaId, model, partNumber, serialNumber, quantity) VALUES (?, ?, ?, ?, ?)`,
                [rmaId, device.model, device.partNumber, device.serialNumber, device.quantity]);
        }

        await run(`DELETE FROM service_history WHERE serviceCycleId IN (SELECT id FROM service_cycles WHERE rmaId = ?)`, [rmaId]);
        await run(`DELETE FROM service_cycles WHERE rmaId = ?`, [rmaId]);
        for (const cycle of serviceCycles) {
            const serviceCycleId = await run(`INSERT INTO service_cycles (rmaId, deviceSerialNumber, status, creationDate, statusDate, issueDescription, accessoriesIncluded) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [rmaId, cycle.deviceSerialNumber, cycle.status, cycle.creationDate, now, cycle.issueDescription, cycle.accessoriesIncluded]);

            for (const h of cycle.history) {
                await run(`INSERT INTO service_history (serviceCycleId, status, date, notes) VALUES (?, ?, ?, ?)`,
                    [serviceCycleId, h.status, h.date, h.notes]);
            }
        }

        await run('COMMIT');
        res.status(200).json({ ...req.body, id: rmaId, lastUpdateDate: now });
    } catch (err: any) {
        await run('ROLLBACK');
        res.status(500).send(err.message);
    }
});


app.delete('/api/rmas/:id', async (req, res) => {
    const rmaId = req.params.id;
    try {
        await run('BEGIN TRANSACTION');
        await run(`DELETE FROM service_history WHERE serviceCycleId IN (SELECT id FROM service_cycles WHERE rmaId = ?)`, [rmaId]);
        await run(`DELETE FROM service_cycles WHERE rmaId = ?`, [rmaId]);
        await run(`DELETE FROM rma_devices WHERE rmaId = ?`, [rmaId]);
        await run(`DELETE FROM rmas WHERE id = ?`, [rmaId]);
        await run('COMMIT');
        res.status(204).send();
    } catch (err: any) {
        await run('ROLLBACK');
        res.status(500).send(err.message);
    }
});


app.get('/api/rmas', async (req, res) => {
    try {
        const rmaRows = await all(`
            SELECT
                r.id as rmaId, r.creationDate, r.lastUpdateDate, r.dateOfIncident, r.dateOfReport, r.attachment,
                c.id as customerId, c.name, c.contactPerson, c.email, c.phone, c.address
            FROM rmas r
            JOIN customers c ON r.customerId = c.id
        `);

        const deviceRows = await all("SELECT * FROM rma_devices");
        const cycleRows = await all("SELECT * FROM service_cycles");
        const historyRows = await all("SELECT * FROM service_history");

        const historyByCycleId = (historyRows as any[]).reduce((acc, h) => {
            const history: HistoryEvent = { status: h.status, date: h.date, notes: h.notes };
            (acc[h.serviceCycleId] = acc[h.serviceCycleId] || []).push(history);
            return acc;
        }, {} as { [key: number]: HistoryEvent[] });

        const cyclesByRmaId = (cycleRows as any[]).reduce((acc, c: any) => {
            const cycle: ServiceCycle = {
                // @ts-ignore
                id: c.id,
                deviceSerialNumber: c.deviceSerialNumber,
                status: c.status,
                statusDate: c.statusDate,
                creationDate: c.creationDate,
                issueDescription: c.issueDescription,
                accessoriesIncluded: c.accessoriesIncluded,
                history: historyByCycleId[c.id] || []
            };
            (acc[c.rmaId] = acc[c.rmaId] || []).push(cycle);
            return acc;
        }, {} as { [key: string]: ServiceCycle[] });

        const devicesByRmaId = (deviceRows as any[]).reduce((acc, d: any) => {
            const device: Device = { model: d.model, partNumber: d.partNumber, serialNumber: d.serialNumber, quantity: d.quantity };
            (acc[d.rmaId] = acc[d.rmaId] || []).push(device);
            return acc;
        }, {} as { [key: string]: Device[] });

        const result: RMA[] = (rmaRows as any[]).map(r => ({
            id: r.rmaId,
            creationDate: r.creationDate,
            lastUpdateDate: r.lastUpdateDate,
            dateOfIncident: r.dateOfIncident,
            dateOfReport: r.dateOfReport,
            attachment: r.attachment,
            customer: {
                id: r.customerId,
                name: r.name,
                contactPerson: r.contactPerson,
                email: r.email,
                phone: r.phone,
                address: r.address,
            },
            devices: devicesByRmaId[r.rmaId] || [],
            serviceCycles: cyclesByRmaId[r.rmaId] || [],
        }));

        res.json(result);
    } catch (err: any) {
        console.error("Failed to fetch and assemble RMA data:", err);
        res.status(500).send("Failed to retrieve RMA data.");
    }
});

app.listen(port, () => {
    console.log(`Backend server listening at http://localhost:${port}`);
});
