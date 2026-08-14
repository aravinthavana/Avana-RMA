const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const script = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  // Find the bad ones I created
  const newF = await prisma.article.findFirst({ where: { articleNo: 'AR-8330F', name: 'F-Shaver Handpiece' } });
  const newH = await prisma.article.findFirst({ where: { articleNo: 'AR-8332H', name: 'H-Shaver Handpiece' } });
  
  if (newF) {
      await prisma.testStepTemplate.deleteMany({ where: { articleNo: newF.articleNo } });
      await prisma.article.delete({ where: { id: newF.id } });
  }
  
  if (newH) {
      await prisma.testStepTemplate.deleteMany({ where: { articleNo: newH.articleNo } });
      await prisma.article.delete({ where: { id: newH.id } });
  }

  // Update the old long ones to split them correctly
  const oldF = await prisma.article.findFirst({ where: { articleNo: 'AR-8330F - Shaver Handpiece Footswitch Control' } });
  if (oldF) {
      await prisma.$executeRaw\`UPDATE "rma_devices" SET "articleNumber" = 'AR-8330F' WHERE "articleNumber" = 'AR-8330F - Shaver Handpiece Footswitch Control'\`;
      await prisma.article.update({
          where: { id: oldF.id },
          data: { articleNo: 'AR-8330F', name: 'Shaver Handpiece Footswitch Control' }
      });
  }

  const oldH = await prisma.article.findFirst({ where: { articleNo: 'AR-8332H - Shaver Handpiece Handcontrol' } });
  if (oldH) {
      await prisma.$executeRaw\`UPDATE "rma_devices" SET "articleNumber" = 'AR-8332H' WHERE "articleNumber" = 'AR-8332H - Shaver Handpiece Handcontrol'\`;
      await prisma.article.update({
          where: { id: oldH.id },
          data: { articleNo: 'AR-8332H', name: 'Shaver Handpiece Handcontrol' }
      });
  }
  
  // Re-seed the test steps
  const templates = [
      {
        articleNo: 'AR-8330F',
        steps: [
          { stepNo: 1, name: 'Serial Number Check', criterion: 'Does the lasered serial number match the documentation?' },
          { stepNo: 2, name: 'Locking Pin Mechanism', criterion: 'Does the locking pin mechanism work properly? (with test gage IG-0026)' },
          { stepNo: 3, name: 'Shaver Handpiece Condition', criterion: 'Is the device free of any damage and dirt? (incl. silicone warranty seal)' },
          { stepNo: 4, name: 'Suction Valve', criterion: 'Can the suction valve be operated smoothly back and forth?' },
          { stepNo: 5, name: 'O-Ring', criterion: 'Is the O-ring properly seated on the connector?' },
          { stepNo: 6, name: 'Water Bubble Leak Test', criterion: 'Did the leak test pass? (according to work instruction WI-000101081)' },
          { stepNo: 7, name: 'Shaver Blade', criterion: 'Can a shaver blade be inserted smoothly and locked properly?' },
          { stepNo: 8, name: 'F-Shaver Handpiece Function', criterion: 'Is the device working properly? (no abnormal noise)' }
        ]
      },
      {
        articleNo: 'AR-8332H',
        steps: [
          { stepNo: 1, name: 'Serial Number Check', criterion: 'Does the lasered serial number match the documentation?' },
          { stepNo: 2, name: 'Locking Pin Mechanism', criterion: 'Does the locking pin mechanism work properly? (with test gage IG-0026)' },
          { stepNo: 3, name: 'Shaver Handpiece Condition', criterion: 'Is the device free of any damage and dirt? (incl. silicone warranty seal)' },
          { stepNo: 4, name: 'Suction Valve', criterion: 'Can the suction valve be operated smoothly back and forth?' },
          { stepNo: 5, name: 'O-Ring', criterion: 'Is the O-ring properly seated on the connector?' },
          { stepNo: 6, name: 'Water Bubble Leak Test', criterion: 'Did the leak test pass? (according to work instruction WI-000101081)' },
          { stepNo: 7, name: 'Shaver Blade', criterion: 'Can a shaver blade be inserted smoothly and locked properly?' },
          { stepNo: 8, name: 'H-Shaver Handpiece Function', criterion: 'Is the device working properly? (hand control buttons, no abnormal noise)' }
        ]
      }
    ];

    for (const t of templates) {
        await prisma.testStepTemplate.deleteMany({ where: { articleNo: t.articleNo } });
        for (const step of t.steps) {
            await prisma.testStepTemplate.create({
                data: {
                    articleNo: t.articleNo,
                    stepNo: step.stepNo,
                    name: step.name,
                    criterion: step.criterion
                }
            });
        }
    }
    console.log("DB Fixed!");
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
