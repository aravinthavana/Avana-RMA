const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

const script = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const articles = await prisma.article.findMany();
  console.log("ARTICLES:");
  console.table(articles);
  
  const steps = await prisma.testStepTemplate.findMany();
  console.log("TEST STEPS:");
  console.log(steps);
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
