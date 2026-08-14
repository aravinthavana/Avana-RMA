const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
    // Run psql inside avana-db container
    const query = `
    ALTER TABLE test_step_templates ADD COLUMN IF NOT EXISTS question TEXT;
    UPDATE test_step_templates SET question = criterion, criterion = 'Yes/No' WHERE question IS NULL AND criterion IS NOT NULL AND criterion != 'Yes/No';
    `;
    conn.exec(`docker exec -i avana-db psql -U postgres -d avana_rma -c "${query}"`, (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            conn.end();
        }).on('data', (data) => {
            console.log(data.toString());
        }).stderr.on('data', (data) => {
            console.error(data.toString());
        });
    });
}).connect({
    host: '172.30.10.21',
    port: 2213,
    username: 'itadmin',
    privateKey: fs.readFileSync('C:\\Users\\EAravinthkumar\\.ssh\\id_ed25519'),
    passphrase: 'lard jockey uncrushed prone'
});
