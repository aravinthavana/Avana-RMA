import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Hash the new password
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

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
    console.log('   Password: Admin123!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
