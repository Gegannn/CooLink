import { Router, Request, Response, NextFunction } from 'express';
import { Skill } from '../models/Skill';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const skills = await Skill.find({ isActive: true }).sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: { skills },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
