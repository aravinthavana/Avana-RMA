import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // SECURITY: Never hardcode passwords in source code.
    // The initial admin password is read from the SEED_ADMIN_PASSWORD env var.
    // If not provided, a random one-time password is generated and printed to the console.
    const initialPassword = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
    const hashedPassword = await bcrypt.hash(initialPassword, 10);

    // Upsert will create if doesn't exist, or update if exists
    await prisma.user.upsert({
        where: { email: 'admin@avanamedical.com' },
        update: {
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
            isActive: true
        },
        create: {
            email: 'admin@avanamedical.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log('✅ Default admin user created/updated:');
    console.log('   Email: admin@avanamedical.com');
    console.log(`   Password: ${initialPassword}`);
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
