import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const articleController = {
  // Get all articles
  async getArticles(req: Request, res: Response) {
    try {
      const articles = await prisma.article.findMany({
        orderBy: { articleNo: 'asc' },
      });
      res.json({ success: true, data: articles });
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch articles' });
    }
  },

  // Create a new article if it doesn't exist
  async createArticle(req: Request, res: Response) {
    try {
      const { articleNo, name } = req.body;
      if (!articleNo || typeof articleNo !== 'string') {
        return res.status(400).json({ success: false, error: 'Invalid articleNo' });
      }

      const article = await prisma.article.upsert({
        where: { articleNo },
        update: { name: name || null },
        create: { articleNo, name: name || null },
      });

      res.json({ success: true, data: article });
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ success: false, error: 'Failed to create article' });
    }
  },

  // Update an article
  async updateArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { articleNo, name } = req.body;
      const article = await prisma.article.update({
        where: { id },
        data: { articleNo, name },
      });
      res.json({ success: true, data: article });
    } catch (error) {
      console.error('Error updating article:', error);
      res.status(500).json({ success: false, error: 'Failed to update article' });
    }
  },

  // Delete an article
  async deleteArticle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.article.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting article:', error);
      res.status(500).json({ success: false, error: 'Failed to delete article' });
    }
  },
};
