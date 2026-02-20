import request from 'supertest';
import express from 'express';
import indexRoutes from '../routes'; // Assuming index routes are exported properly
import cors from 'cors';
import helmet from 'helmet';

// Mock app setup for testing
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use('/api', indexRoutes);

describe('Health Check', () => {
    it('should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('API is running');
    });
});
