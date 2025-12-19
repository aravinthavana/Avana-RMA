import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@avanagroup.com';
    const password = 'password123';
    const name = 'Admin User';

    console.log(`Checking for existing admin user: ${email}...`);

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        console.log('Admin user already exists.');
        return;
    }

    console.log('Creating admin user...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            role: 'ADMIN',
        },
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${user.email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
