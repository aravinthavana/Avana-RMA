const { Client } = require('ssh2');
const fs = require('fs');

const conn = new Client();
const script = `
const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/templates/test-steps/AR-8330F',
  method: 'GET',
  headers: {
    // Auth bypass or see if it fails
  }
}, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log("STATUS: ", res.statusCode);
    console.log("DATA: ", data);
  });
});
req.on('error', e => console.error(e));
req.end();
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
