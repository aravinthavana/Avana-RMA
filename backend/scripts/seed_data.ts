
import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../database.db');
const db = new sqlite3.Database(dbPath);

const seedData = async () => {
    console.log('Seeding realistic medical device data...');

    const run = (sql: string, params: any[] = []) => new Promise<void>((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve();
        });
    });

    const customers = [
        { name: 'City General Hospital', contact: 'Dr. Sarah Johnson', email: 'sjohnson@citygenhosp.com', phone: '555-0100', address: '123 Medical Center Drive\nNew York, NY 10001' },
        { name: 'Westside Medical Center', contact: 'James Martinez', email: 'jmartinez@westsidemc.com', phone: '555-0101', address: '456 Healthcare Blvd\nLos Angeles, CA 90001' },
        { name: 'Regional Healthcare System', contact: 'Dr. Emily Chen', email: 'echen@regionalhcs.org', phone: '555-0102', address: '789 Hospital Way\nBoston, MA 02101' },
        { name: 'Community Medical Clinic', contact: 'Robert Williams', email: 'rwilliams@commclinic.com', phone: '555-0103', address: '321 Wellness Street\nChicago, IL 60601' },
        { name: 'Advanced Diagnostics Lab', contact: 'Dr. Michael Brown', email: 'mbrown@advdiaglab.com', phone: '555-0104', address: '654 Lab Avenue\nHouston, TX 77001' },
    ];

    const devices = [
        { article: 'VSM-5000', serial: 'VSM2024001', issue: 'Display shows intermittent flickering during operation' },
        { article: 'ECG-12L', serial: 'ECG2024002', issue: 'Lead II contact error, unable to get proper readings' },
        { article: 'BP-AUTO-300', serial: 'BPA2024003', issue: 'Cuff inflation inconsistent, pressure readings unreliable' },
        { article: 'PULSE-OX-100', serial: 'POX2024004', issue: 'Sensor not detecting finger placement correctly' },
        { article: 'INF-PUMP-2000', serial: 'INF2024005', issue: 'Alarm sounds continuously even after flow rate adjustment' },
        { article: 'SYRINGE-DRV-50', serial: 'SYR2024006', issue: 'Motor stalling during mid-delivery' },
        { article: 'VENT-PRO-3000', serial: 'VNT2024007', issue: 'Oxygen sensor calibration failure' },
        { article: 'DEFIB-AED-500', serial: 'DEF2024008', issue: 'Battery not holding charge, needs immediate replacement' },
        { article: 'GLUC-METER-X1', serial: 'GLU2024009', issue: 'Test strips rejected repeatedly with error code E05' },
        { article: 'TEMP-SCAN-200', serial: 'TMP2024010', issue: 'Temperature readings consistently 2°F higher than calibrated standard' },
    ];

    try {
        await run('BEGIN TRANSACTION');

        for (let i = 0; i < Math.min(customers.length, devices.length); i++) {
            const customer = customers[i];
            const device = devices[i];
            const customerId = `CUST-${1000 + i}`;
            const rmaId = `RMA-${2024}${String(100 + i).padStart(3, '0')}`;

            // Create dates for variety
            const creationDate = new Date();
            creationDate.setDate(creationDate.getDate() - (i * 3));
            const incidentDate = new Date(creationDate);
            incidentDate.setDate(incidentDate.getDate() - 2);

            const creationISO = creationDate.toISOString();
            const incidentISO = incidentDate.toISOString();

            // Insert Customer
            await run(
                `INSERT OR REPLACE INTO customers (id, name, contactPerson, email, phone, address) VALUES (?, ?, ?, ?, ?, ?)`,
                [customerId, customer.name, customer.contact, customer.email, customer.phone, customer.address]
            );

            // Insert RMA
            await run(
                `INSERT OR REPLACE INTO rmas (id, customerId, creationDate, lastUpdateDate, dateOfIncident, dateOfReport, attachment) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [rmaId, customerId, creationISO, creationISO, incidentISO, creationISO, null]
            );

            // Insert RMA Device with articleNumber (no model)
            await run(
                `INSERT OR REPLACE INTO rma_devices (rmaId, articleNumber, serialNumber, quantity) VALUES (?, ?, ?, ?)`,
                [rmaId, device.article, device.serial, 1]
            );

            // Insert Service Cycle
            const status = i % 3 === 0 ? 'Received' : 'Pending';
            const cycleSql = `INSERT INTO service_cycles (rmaId, deviceSerialNumber, status, creationDate, statusDate, issueDescription, accessoriesIncluded) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            await run(cycleSql, [rmaId, device.serial, status, creationISO, creationISO, device.issue, 'Power cord, user manual']);
        }

        await run('COMMIT');
        console.log(`Successfully seeded ${Math.min(customers.length, devices.length)} realistic RMAs with medical device data.`);
    } catch (err) {
        await run('ROLLBACK');
        console.error('Error seeding data:', err);
    } finally {
        db.close();
    }
};

seedData();
