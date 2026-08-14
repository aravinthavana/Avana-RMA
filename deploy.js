const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();

conn.on('ready', () => {
    console.log('Client :: ready');
    conn.exec('cd /home/itadmin/dev/Avana-RMA && git stash && git checkout develop && git pull origin develop && git stash pop || true && docker compose down && docker compose up -d --build', (err, stream) => {
        if (err) throw err;
        stream.on('close', (code, signal) => {
            console.log('Stream :: close :: code: ' + code + ', signal: ' + signal);
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
