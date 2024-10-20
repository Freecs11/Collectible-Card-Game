import { Request, Response, NextFunction } from 'express';

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Check if the authorization header is provided
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.status(401).json({ message: 'Missing or invalid authorization header' });
    return;
  }

  // Decode the Base64-encoded credentials
  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    // in js we will declare the auth as follows:
    // headers: { Authorization: 'Basic ' + btoa(`${username}:${password}`) },

  // Check if the provided password matches the one in the environment
  if (password !== process.env.ADMIN_PASSWORD ) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  // Proceed to the next middleware or route handler
  next();
};
