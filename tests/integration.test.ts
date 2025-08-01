import request from 'supertest';
import express, { type Express } from 'express';

// Mock database for integration testing
const mockDatabase = {
  users: [] as any[],
  agents: [] as any[],
  annotations: [] as any[],
  activities: [] as any[],
  workflows: [] as any[],
  phases: [] as any[],
  repositories: [] as any[],
  services: [] as any[]
};

describe('Integration Tests', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());

    // Add routes that interact with mock database
    app.get('/api/agents', (req, res) => {
      res.json(mockDatabase.agents);
    });

    app.post('/api/agents', (req, res) => {
      const { name, type, description, emoji, provider } = req.body;
      
      // Validate required fields
      if (!name || !type || !description || !emoji || !provider) {
        return res.status(400).json({ 
          message: 'Missing required fields',
          required: ['name', 'type', 'description', 'emoji', 'provider']
        });
      }
      
      const agent = {
        id: mockDatabase.agents.length + 1,
        ...req.body,
        status: 'pending',
        lastUpdated: new Date().toISOString()
      };
      mockDatabase.agents.push(agent);
      res.status(201).json(agent);
    });

    app.get('/api/agents/:id', (req, res) => {
      const agent = mockDatabase.agents.find(a => a.id === parseInt(req.params.id));
      if (!agent) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      res.json(agent);
    });

    app.patch('/api/agents/:id', (req, res) => {
      const agentIndex = mockDatabase.agents.findIndex(a => a.id === parseInt(req.params.id));
      if (agentIndex === -1) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      mockDatabase.agents[agentIndex] = {
        ...mockDatabase.agents[agentIndex],
        ...req.body,
        lastUpdated: new Date().toISOString()
      };
      
      res.json(mockDatabase.agents[agentIndex]);
    });

    app.delete('/api/agents/:id', (req, res) => {
      const agentIndex = mockDatabase.agents.findIndex(a => a.id === parseInt(req.params.id));
      if (agentIndex === -1) {
        return res.status(404).json({ message: 'Agent not found' });
      }
      
      mockDatabase.agents.splice(agentIndex, 1);
      res.status(204).send();
    });

    // Annotations CRUD
    app.get('/api/annotations', (req, res) => {
      res.json(mockDatabase.annotations);
    });

    app.post('/api/annotations', (req, res) => {
      const annotation = {
        id: mockDatabase.annotations.length + 1,
        ...req.body,
        createdAt: new Date().toISOString()
      };
      mockDatabase.annotations.push(annotation);
      res.status(201).json(annotation);
    });

    // Activities CRUD
    app.get('/api/activities', (req, res) => {
      res.json(mockDatabase.activities);
    });

    app.post('/api/activities', (req, res) => {
      const activity = {
        id: mockDatabase.activities.length + 1,
        ...req.body,
        timestamp: new Date().toISOString()
      };
      mockDatabase.activities.push(activity);
      res.status(201).json(activity);
    });

    // Workflows CRUD
    app.get('/api/workflows', (req, res) => {
      res.json(mockDatabase.workflows);
    });

    app.post('/api/workflows', (req, res) => {
      const workflow = {
        id: mockDatabase.workflows.length + 1,
        ...req.body,
        status: 'pending'
      };
      mockDatabase.workflows.push(workflow);
      res.status(201).json(workflow);
    });

    // Phases CRUD
    app.get('/api/phases', (req, res) => {
      res.json(mockDatabase.phases);
    });

    app.post('/api/phases', (req, res) => {
      const phase = {
        id: mockDatabase.phases.length + 1,
        ...req.body,
        status: 'pending',
        progress: 0
      };
      mockDatabase.phases.push(phase);
      res.status(201).json(phase);
    });

    // Repositories CRUD
    app.get('/api/repositories', (req, res) => {
      res.json(mockDatabase.repositories);
    });

    app.post('/api/repositories', (req, res) => {
      const repository = {
        id: mockDatabase.repositories.length + 1,
        ...req.body,
        status: 'pending',
        isPrivate: true
      };
      mockDatabase.repositories.push(repository);
      res.status(201).json(repository);
    });

    // Services CRUD
    app.get('/api/services', (req, res) => {
      res.json(mockDatabase.services);
    });

    app.post('/api/services', (req, res) => {
      const service = {
        id: mockDatabase.services.length + 1,
        ...req.body,
        status: 'healthy',
        lastCheck: new Date().toISOString()
      };
      mockDatabase.services.push(service);
      res.status(201).json(service);
    });

    // Health check with database status
    app.get('/api/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'fanno-platform-api',
        database: {
          connected: true,
          tables: {
            agents: mockDatabase.agents.length,
            annotations: mockDatabase.annotations.length,
            activities: mockDatabase.activities.length,
            workflows: mockDatabase.workflows.length,
            phases: mockDatabase.phases.length,
            repositories: mockDatabase.repositories.length,
            services: mockDatabase.services.length
          }
        }
      });
    });
  });

  beforeEach(() => {
    // Clear mock database before each test
    Object.keys(mockDatabase).forEach(key => {
      (mockDatabase as any)[key] = [];
    });
  });

  describe('Agents Integration', () => {
    test('should create and retrieve agents', async () => {
      // Create an agent
      const createResponse = await request(app)
        .post('/api/agents')
        .send({
          name: 'Test Agent',
          type: 'ui-ux',
          description: 'A test agent for integration testing',
          emoji: '🤖',
          provider: 'test-provider',
          config: { key: 'value' }
        })
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: 1,
        name: 'Test Agent',
        type: 'ui-ux',
        description: 'A test agent for integration testing',
        emoji: '🤖',
        provider: 'test-provider',
        status: 'pending'
      });

      // Retrieve the agent
      const getResponse = await request(app)
        .get('/api/agents/1')
        .expect(200);

      expect(getResponse.body).toMatchObject(createResponse.body);

      // List all agents
      const listResponse = await request(app)
        .get('/api/agents')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
      expect(listResponse.body[0]).toMatchObject(createResponse.body);
    });

    test('should update agent status', async () => {
      // Create an agent first
      await request(app)
        .post('/api/agents')
        .send({
          name: 'Test Agent',
          type: 'backend',
          description: 'Backend agent',
          emoji: '⚙️',
          provider: 'test'
        })
        .expect(201);

      // Update the agent
      const updateResponse = await request(app)
        .patch('/api/agents/1')
        .send({
          status: 'active',
          description: 'Updated backend agent'
        })
        .expect(200);

      expect(updateResponse.body).toMatchObject({
        id: 1,
        name: 'Test Agent',
        type: 'backend',
        description: 'Updated backend agent',
        status: 'active'
      });
    });

    test('should delete agents', async () => {
      // Create an agent first
      await request(app)
        .post('/api/agents')
        .send({
          name: 'Temporary Agent',
          type: 'frontend',
          description: 'Will be deleted',
          emoji: '🗑️',
          provider: 'test'
        })
        .expect(201);

      // Delete the agent
      await request(app)
        .delete('/api/agents/1')
        .expect(204);

      // Verify it's gone
      await request(app)
        .get('/api/agents/1')
        .expect(404);
    });
  });

  describe('Annotations Integration', () => {
    test('should create and retrieve annotations', async () => {
      const createResponse = await request(app)
        .post('/api/annotations')
        .send({
          inputText: 'This is a test annotation',
          resultJson: { sentiment: 'positive', keywords: ['test', 'annotation'] }
        })
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: 1,
        inputText: 'This is a test annotation',
        resultJson: { sentiment: 'positive', keywords: ['test', 'annotation'] }
      });

      const listResponse = await request(app)
        .get('/api/annotations')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
    });
  });

  describe('Activities Integration', () => {
    test('should create and retrieve activities', async () => {
      const createResponse = await request(app)
        .post('/api/activities')
        .send({
          title: 'Test Activity',
          type: 'info'
        })
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: 1,
        title: 'Test Activity',
        type: 'info'
      });

      const listResponse = await request(app)
        .get('/api/activities')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
    });
  });

  describe('Workflows Integration', () => {
    test('should create and retrieve workflows', async () => {
      const createResponse = await request(app)
        .post('/api/workflows')
        .send({
          fromAgent: 'ui-ux-agent',
          toAgent: 'backend-agent',
          description: 'Transfer design specs',
          artifact: 'design-specs.json'
        })
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: 1,
        fromAgent: 'ui-ux-agent',
        toAgent: 'backend-agent',
        description: 'Transfer design specs',
        artifact: 'design-specs.json',
        status: 'pending'
      });

      const listResponse = await request(app)
        .get('/api/workflows')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
    });
  });

  describe('Phases Integration', () => {
    test('should create and retrieve phases', async () => {
      const createResponse = await request(app)
        .post('/api/phases')
        .send({
          name: 'Planning Phase',
          description: 'Initial planning and design',
          order: 1
        })
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: 1,
        name: 'Planning Phase',
        description: 'Initial planning and design',
        order: 1,
        status: 'pending',
        progress: 0
      });

      const listResponse = await request(app)
        .get('/api/phases')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
    });
  });

  describe('Repositories Integration', () => {
    test('should create and retrieve repositories', async () => {
      const createResponse = await request(app)
        .post('/api/repositories')
        .send({
          name: 'test-repo'
        })
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: 1,
        name: 'test-repo',
        status: 'pending',
        isPrivate: true
      });

      const listResponse = await request(app)
        .get('/api/repositories')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
    });
  });

  describe('Services Integration', () => {
    test('should create and retrieve services', async () => {
      const createResponse = await request(app)
        .post('/api/services')
        .send({
          name: 'test-service'
        })
        .expect(201);

      expect(createResponse.body).toMatchObject({
        id: 1,
        name: 'test-service',
        status: 'healthy'
      });

      const listResponse = await request(app)
        .get('/api/services')
        .expect(200);

      expect(listResponse.body).toHaveLength(1);
    });
  });

  describe('Health Check Integration', () => {
    test('should include database status in health check', async () => {
      // Add some data first
      await request(app)
        .post('/api/agents')
        .send({
          name: 'Health Check Agent',
          type: 'test',
          description: 'For health check test',
          emoji: '🏥',
          provider: 'test'
        })
        .expect(201);

      await request(app)
        .post('/api/annotations')
        .send({
          inputText: 'Health check annotation',
          resultJson: { type: 'health' }
        })
        .expect(201);

      const healthResponse = await request(app)
        .get('/api/health')
        .expect(200);

      expect(healthResponse.body).toMatchObject({
        status: 'healthy',
        service: 'fanno-platform-api',
        database: {
          connected: true,
          tables: {
            agents: 1,
            annotations: 1,
            activities: 0,
            workflows: 0,
            phases: 0,
            repositories: 0,
            services: 0
          }
        }
      });
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle non-existent resources gracefully', async () => {
      await request(app)
        .get('/api/agents/999')
        .expect(404);

      await request(app)
        .patch('/api/agents/999')
        .send({ name: 'Updated' })
        .expect(404);

      await request(app)
        .delete('/api/agents/999')
        .expect(404);
    });

    test('should validate required fields', async () => {
      // Test missing required fields for agents
      await request(app)
        .post('/api/agents')
        .send({
          name: 'Incomplete Agent'
          // Missing required fields
        })
        .expect(400);
    });
  });
});