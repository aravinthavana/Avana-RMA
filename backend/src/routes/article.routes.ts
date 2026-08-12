import express from 'express';
import { articleController } from '../controllers/article.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

router.use(authenticate); // Require authentication for all article routes

router.get('/', articleController.getArticles);
router.post('/', articleController.createArticle);

export default router;
