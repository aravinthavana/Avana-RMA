import { Request, Response } from 'express';
import { prisma } from '../index';

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
      const { articleNo } = req.body;
      if (!articleNo || typeof articleNo !== 'string') {
        return res.status(400).json({ success: false, error: 'Invalid articleNo' });
      }

      // Check if it exists
      let article = await prisma.article.findUnique({
        where: { articleNo },
      });

      if (!article) {
        article = await prisma.article.create({
          data: { articleNo },
        });
      }

      res.json({ success: true, data: article });
    } catch (error) {
      console.error('Error creating article:', error);
      res.status(500).json({ success: false, error: 'Failed to create article' });
    }
  },
};
