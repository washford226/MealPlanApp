import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).send('Access denied. Invalid token format.');
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const secret: string | undefined = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT secret is not defined');
    }

    const decoded = jwt.verify(token, secret) as DecodedToken;
    (req as any).user = decoded; // Attach the decoded token to the request object
    next();
  } catch (err) {
    if (err instanceof Error) {
      console.error('Error verifying token:', err.message);
    } else {
      console.error('Error verifying token:', err);
    }
    res.status(401).send('Invalid token.');
  }
};

export default authMiddleware;