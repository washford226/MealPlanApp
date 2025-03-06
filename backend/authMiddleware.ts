import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    res.status(401).send('Access denied. No token provided.');
    return;
  }

  try {
    const secret: string | undefined = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).send('JWT secret is not defined');
      return;
    }

    const decoded = jwt.verify(token, secret);
    (req as any).user = decoded;
    next();
  } catch (ex) {
    res.status(400).send('Invalid token.');
  }
};

export default authMiddleware;