import { Request, Response, NextFunction } from 'express';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { WorkRequest } from '../models/WorkRequest';
import { BadRequestError, ForbiddenError, NotFoundError } from '../utils/errors';

export class ConversationController {
  public async getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const conversations = await Conversation.find({
        participants: req.user.userId,
      })
        .populate('participants', 'fullName phone role verificationStatus')
        .populate('jobId', 'title locality status')
        .sort({ lastMessageAt: -1 });

      res.status(200).json({
        success: true,
        data: { conversations },
      });
    } catch (error) {
      next(error);
    }
  }

  public async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { id } = req.params;
      const conversation = await Conversation.findById(id);
      if (!conversation) {
        throw new NotFoundError('Conversation not found.');
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === req.user?.userId
      );
      if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this conversation.');
      }

      const messages = await Message.find({ conversationId: id })
        .populate('senderId', 'fullName role')
        .sort({ createdAt: 1 });

      // Mark messages as read for this user
      await Message.updateMany(
        {
          conversationId: id,
          senderId: { $ne: req.user.userId },
          isRead: false,
        },
        {
          $set: { isRead: true, readAt: new Date() },
        }
      );

      res.status(200).json({
        success: true,
        data: { messages },
      });
    } catch (error) {
      next(error);
    }
  }

  public async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { id } = req.params;
      const { content } = req.body;

      if (!content || !content.trim()) {
        throw new BadRequestError('Message content cannot be empty.');
      }

      const conversation = await Conversation.findById(id);
      if (!conversation) {
        throw new NotFoundError('Conversation not found.');
      }

      const isParticipant = conversation.participants.some(
        (p) => p.toString() === req.user?.userId
      );
      if (!isParticipant) {
        throw new ForbiddenError('You are not a participant in this conversation.');
      }

      const message = await Message.create({
        conversationId: id,
        senderId: req.user.userId,
        content: content.trim(),
        isRead: false,
      });

      conversation.lastMessage = content.trim();
      conversation.lastMessageSenderId = req.user.userId as unknown as import('mongoose').Types.ObjectId;
      conversation.lastMessageAt = new Date();
      await conversation.save();

      res.status(201).json({
        success: true,
        data: { message },
      });
    } catch (error) {
      next(error);
    }
  }

  public async startOrGetConversation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { targetUserId, jobId } = req.body;
      if (!targetUserId) {
        throw new BadRequestError('Target user ID is required.');
      }

      // Check if accepted work relationship exists to prevent spam
      const hasAcceptedBooking = await WorkRequest.findOne({
        status: { $in: ['ACCEPTED', 'COMPLETED'] },
        $or: [
          { employerId: req.user.userId, workerId: targetUserId },
          { workerId: req.user.userId, employerId: targetUserId },
        ],
      });

      if (!hasAcceptedBooking) {
        throw new ForbiddenError(
          'Direct messaging is unlocked only after a work request is accepted to prevent spam.'
        );
      }

      let conversation = await Conversation.findOne({
        participants: { $all: [req.user.userId, targetUserId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [req.user.userId, targetUserId],
          jobId,
          lastMessageAt: new Date(),
        });
      }

      res.status(200).json({
        success: true,
        data: { conversation },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();
