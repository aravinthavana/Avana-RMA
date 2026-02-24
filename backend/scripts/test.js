async function hitTest() {
    console.log("Waiting for Render to deploy the new database schema...");
    for (let i = 0; i < 20; i++) {
        try {
            const res = await fetch('https://avana-rma.onrender.com/api/test-error');
            const text = await res.text();

            if (res.status === 200) {
                console.log("\n--- DEPLOYED! RESULT: ---");
                try {
                    console.log(JSON.stringify(JSON.parse(text), null, 2));
                } catch (e) {
                    console.log(text);
                }
                return;
            } else {
                console.log(`[Attempt ${i + 1}] Received status ${res.status}. Still deploying...`);
            }
        } catch (err) {
            console.log(`[Attempt ${i + 1}] Network error, retrying...`);
        }
        await new Promise(r => setTimeout(r, 10000));
    }
}
hitTest();
