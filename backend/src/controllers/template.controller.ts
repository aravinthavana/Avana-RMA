import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const templateController = {
  // --- TEST STEPS ---
  async getTestSteps(req: Request, res: Response) {
    try {
      const { articleNo } = req.params;
      const steps = await prisma.testStepTemplate.findMany({
        where: articleNo ? { articleNo } : undefined,
        orderBy: [{ articleNo: 'asc' }, { stepNo: 'asc' }],
      });
      res.json({ success: true, data: steps });
    } catch (error) {
      console.error('Error fetching test steps:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch test steps' });
    }
  },

  async createTestStep(req: Request, res: Response) {
    try {
      const { articleNo, stepNo, name, question, criterion } = req.body;
      const step = await prisma.testStepTemplate.create({
        data: { articleNo, stepNo, name, question, criterion },
      });
      res.json({ success: true, data: step });
    } catch (error) {
      console.error('Error creating test step:', error);
      res.status(500).json({ success: false, error: 'Failed to create test step' });
    }
  },

  async updateTestStep(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { stepNo, name, question, criterion } = req.body;
      const step = await prisma.testStepTemplate.update({
        where: { id },
        data: { stepNo, name, question, criterion },
      });
      res.json({ success: true, data: step });
    } catch (error) {
      console.error('Error updating test step:', error);
      res.status(500).json({ success: false, error: 'Failed to update test step' });
    }
  },

  async deleteTestStep(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.testStepTemplate.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting test step:', error);
      res.status(500).json({ success: false, error: 'Failed to delete test step' });
    }
  },

  // --- TEST EQUIPMENT ---
  async getEquipment(req: Request, res: Response) {
    try {
      const equipment = await prisma.testEquipmentTemplate.findMany({
        orderBy: { equipmentId: 'asc' },
      });
      res.json({ success: true, data: equipment });
    } catch (error) {
      console.error('Error fetching equipment templates:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch equipment templates' });
    }
  },

  async createEquipment(req: Request, res: Response) {
    try {
      const { equipmentId, name } = req.body;
      const equip = await prisma.testEquipmentTemplate.create({
        data: { equipmentId, name },
      });
      res.json({ success: true, data: equip });
    } catch (error) {
      console.error('Error creating equipment template:', error);
      res.status(500).json({ success: false, error: 'Failed to create equipment template' });
    }
  },

  async updateEquipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { equipmentId, name } = req.body;
      const equip = await prisma.testEquipmentTemplate.update({
        where: { id },
        data: { equipmentId, name },
      });
      res.json({ success: true, data: equip });
    } catch (error) {
      console.error('Error updating equipment template:', error);
      res.status(500).json({ success: false, error: 'Failed to update equipment template' });
    }
  },

  async deleteEquipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.testEquipmentTemplate.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting equipment template:', error);
      res.status(500).json({ success: false, error: 'Failed to delete equipment template' });
    }
  },
};
