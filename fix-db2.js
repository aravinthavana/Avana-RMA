const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const script = `
const { execSync } = require('child_process');
console.log("Generating prisma client...");
execSync("npx prisma generate");
console.log("Prisma client generated.");

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        await prisma.$executeRaw\`ALTER TABLE "test_step_templates" ADD COLUMN "question" TEXT;\`;
        console.log("Column added.");
    } catch(e) {
        console.log("Column might already exist", e.message);
    }

    const steps = await prisma.testStepTemplate.findMany();
    let updated = 0;
    for (const step of steps) {
        if (!step.question && step.criterion && step.criterion !== 'Yes/No') {
            await prisma.testStepTemplate.update({
                where: { id: step.id },
                data: {
                    question: step.criterion,
                    criterion: 'Yes/No'
                }
            });
            updated++;
        }
    }
    console.log("DB Migration done, updated " + updated + " steps.");
}
main().finally(() => prisma.$disconnect());
`;

conn.on('ready', () => {
    conn.exec(`docker exec -i avana-backend node`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.error(data.toString());
        });
        stream.write(script);
        stream.end();
    });
}).connect({
    host: '172.30.10.21',
    port: 2213,
    username: 'itadmin',
    privateKey: fs.readFileSync('C:\\Users\\EAravinthkumar\\.ssh\\id_ed25519'),
    passphrase: 'lard jockey uncrushed prone'
});
