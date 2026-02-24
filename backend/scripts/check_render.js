async function getLogs() {
    try {
        const token = 'rnd_50r5kEaCqjEw7V8BwA02K0Fqnd8O';
        const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

        // Get the service ID
        const servicesRes = await fetch('https://api.render.com/v1/services', { headers });
        const services = await servicesRes.json();

        if (!services || services.length === 0) {
            console.log("No services found.");
            return;
        }

        const serviceId = services[0].service.id;
        console.log(`Checking Service: ${services[0].service.name} (${serviceId})`);

        // Get latest deploy
        const deploysRes = await fetch(`https://api.render.com/v1/services/${serviceId}/deploys?limit=1`, { headers });
        const deploys = await deploysRes.json();

        if (deploys && deploys.length > 0) {
            console.log(`Latest Deploy Status: ${deploys[0].deploy.status}`);
        }

    } catch (error) {
        console.error("Error fetching from Render API:", error);
    }
}

getLogs();
