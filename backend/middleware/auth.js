import jwt from 'jsonwebtoken';

export function requireAdmin(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'admin') {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    req.admin = true;
    next();
  } catch {
    return res.status(401).json({ message: 'Not authenticated' });
  }
}
