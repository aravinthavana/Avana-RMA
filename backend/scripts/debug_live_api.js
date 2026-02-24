async function run() {
  console.log("Logging into live API...");
  const loginRes = await fetch('https://avana-rma.onrender.com/api/auth/signin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@avanamedical.com', password: 'Admin123!' })
  });
  
  const loginData = await loginRes.json();
  if(!loginData.token) {
     console.log('Login failed:', loginData);
     return;
  }
  
  const token = loginData.token;
  console.log("Fetching RMAs to trigger the 500 error...");
  const rmasRes = await fetch('https://avana-rma.onrender.com/api/rmas?page=1&limit=10', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const text = await rmasRes.text();
  try {
     const json = JSON.parse(text);
     console.log('\n--- REAL ERROR DETAILS ---');
     console.log(JSON.stringify(json, null, 2));
  } catch(e) {
     console.log('\n--- RAW TEXT RESPONSE ---');
     console.log(text);
  }
}
run();
