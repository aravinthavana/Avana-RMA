import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const rmas = await prisma.rma.findMany({
        orderBy: { creationDate: 'asc' }
    });

    const letterMap: Record<string, string> = {
        '0': 'A', '1': 'B', '2': 'C', '3': 'D', '4': 'E',
        '5': 'F', '6': 'G', '7': 'H', '8': 'I', '9': 'J'
    };

    const seqCounters: Record<string, number> = {};

    console.log(`Found ${rmas.length} RMAs to evaluate for migration`);

    let migratedCount = 0;

    for (const rma of rmas) {
        // Skip if it already matches the new format (YYMMXXX with letters)
        if (/^[A-J]{2}\d{5}$/.test(rma.id)) {
            console.log(`Skipping ${rma.id} - already matches new format`);
            
            // Still register it in counters so future RMAs in the same month don't overlap
            const prefix = rma.id.slice(0, 4);
            const seq = parseInt(rma.id.slice(4), 10);
            if (!seqCounters[prefix] || seqCounters[prefix] <= seq) {
                seqCounters[prefix] = seq + 1;
            }
            continue;
        }

        const date = rma.creationDate;
        const yearStr = date.getFullYear().toString().slice(-2);
        const monthStr = (date.getMonth() + 1).toString().padStart(2, '0');
        
        const yearPrefix = yearStr.split('').map(digit => letterMap[digit]).join('');
        const prefix = `${yearPrefix}${monthStr}`;

        if (!seqCounters[prefix]) {
            seqCounters[prefix] = 1;
        }

        const seqStr = seqCounters[prefix].toString().padStart(3, '0');
        const newId = `${prefix}${seqStr}`;
        seqCounters[prefix]++;

        console.log(`Migrating ${rma.id} -> ${newId}`);

        // Update the ID directly in the DB. Postgres ON UPDATE CASCADE handles related tables.
        await prisma.$executeRawUnsafe(`UPDATE rmas SET id = $1 WHERE id = $2`, newId, rma.id);
        migratedCount++;
    }
    
    console.log(`Migration complete! Successfully migrated ${migratedCount} RMAs.`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
