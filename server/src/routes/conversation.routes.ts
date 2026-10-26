import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticate, (req, res, next) =>
  conversationController.getConversations(req, res, next)
);

router.post('/start', authenticate, (req, res, next) =>
  conversationController.startOrGetConversation(req, res, next)
);

router.get('/:id/messages', authenticate, (req, res, next) =>
  conversationController.getMessages(req, res, next)
);

router.post('/:id/messages', authenticate, (req, res, next) =>
  conversationController.sendMessage(req, res, next)
);

export default router;
