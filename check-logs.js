const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
    conn.exec('cd /home/itadmin/dev/Avana-RMA && bash -c \'set -a; source .env; set +a; docker run --rm --network avana-rma_avana-net -e DATABASE_URL="postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD}@avana-db:5432/${POSTGRES_DB:-avana_rma}?schema=public" avana-rma-backend:latest npx prisma migrate resolve --applied 20260814101000_test_report_and_signature\'', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log('STDOUT: ' + data);
        }).stderr.on('data', (data) => {
            console.log('STDERR: ' + data);
        });
    });
}).connect({
    host: '172.30.10.21',
    port: 2213,
    username: 'itadmin',
    privateKey: fs.readFileSync('C:\\Users\\EAravinthkumar\\.ssh\\id_ed25519'),
    passphrase: 'lard jockey uncrushed prone'
});
