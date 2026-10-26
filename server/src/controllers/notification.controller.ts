import { Request, Response, NextFunction } from 'express';
import { Notification } from '../models/Notification';
import { BadRequestError } from '../utils/errors';

export class NotificationController {
  public async getMyNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const notifications = await Notification.find({ recipientId: req.user.userId })
        .sort({ createdAt: -1 })
        .limit(30);

      const unreadCount = await Notification.countDocuments({
        recipientId: req.user.userId,
        isRead: false,
      });

      res.status(200).json({
        success: true,
        data: {
          notifications,
          unreadCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public async markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      const { id } = req.params;
      await Notification.findOneAndUpdate(
        { _id: id, recipientId: req.user.userId },
        { $set: { isRead: true } }
      );

      res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
      });
    } catch (error) {
      next(error);
    }
  }

  public async markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.userId) {
        throw new BadRequestError('User context missing.');
      }

      await Notification.updateMany(
        { recipientId: req.user.userId, isRead: false },
        { $set: { isRead: true } }
      );

      res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController = new NotificationController();
