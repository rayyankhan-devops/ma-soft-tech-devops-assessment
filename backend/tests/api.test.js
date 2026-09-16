import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { closePool } from '../src/db.js';

afterAll(async () => {
  await closePool();
});

describe('Backend API Test Suite (MA Soft Tech Solutions)', () => {
  describe('Main Application Endpoint (/)', () => {
    it('should return 200 OK and API discovery information', async () => {
      const res = await request(app).get('/');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body).toHaveProperty('service');
      expect(res.body).toHaveProperty('status', 'ONLINE');
      expect(res.body).toHaveProperty('endpoints');
    });
  });

  describe('Health Endpoint (/health)', () => {
    it('should return 200 OK and complete system health status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body).toHaveProperty('status', 'UP');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
      expect(res.body).toHaveProperty('database');
      expect(res.body).toHaveProperty('system');
    });
  });

  describe('Items API (GET /api/v1/items)', () => {
    it('should return 200 OK and array of items', async () => {
      const res = await request(app).get('/api/v1/items');

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/json/);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(typeof res.body.count).toBe('number');
    });
  });

  describe('Input Validation & Creation (POST /api/v1/items)', () => {
    it('should return 201 Created when payload is valid', async () => {
      const validPayload = {
        title: 'Configure MySQL Replica in AWS',
        category: 'Database',
        priority: 'high',
      };

      const res = await request(app)
        .post('/api/v1/items')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.title).toBe(validPayload.title);
      expect(res.body.data.priority).toBe('high');
      expect(res.body.data.category).toBe('Database');
    });

    it('should return 400 Bad Request when title is missing or empty', async () => {
      const res = await request(app)
        .post('/api/v1/items')
        .send({ title: '', priority: 'low' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.details).toContain('Field "title" must be between 3 and 100 characters');
    });

    it('should return 400 Bad Request when title is too short (< 3 chars)', async () => {
      const res = await request(app)
        .post('/api/v1/items')
        .send({ title: 'db' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toContain('Field "title" must be between 3 and 100 characters');
    });

    it('should return 400 Bad Request when priority is invalid enum', async () => {
      const res = await request(app)
        .post('/api/v1/items')
        .send({ title: 'Valid Title Here', priority: 'super_urgent_invalid' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details.some((d) => d.includes('Field "priority" must be one of'))).toBe(true);
    });
  });

  describe('Single Item Operations (GET & DELETE /api/v1/items/:id)', () => {
    it('should return 200 OK for an existing item ID', async () => {
      const res = await request(app).get('/api/v1/items/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(1);
    });

    it('should return 404 Not Found for non-existent item ID', async () => {
      const res = await request(app).get('/api/v1/items/99999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBe('Not Found');
    });

    it('should return 400 Bad Request for non-numeric ID', async () => {
      const res = await request(app).get('/api/v1/items/invalid-id');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.details).toContain('Item ID must be a valid number');
    });

    it('should delete an item and return 200 OK', async () => {
      const res = await request(app).delete('/api/v1/items/2');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
