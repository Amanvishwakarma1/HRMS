import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'chronos_payroll_super_secret_token_key';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access Denied: No Token Provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or Expired Token.' });
  }
};

export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ success: false, message: 'Access Denied: Role Context Missing.' });
    }
    
    const role = req.user.role.toLowerCase();
    const allowed = allowedRoles.map(r => r.toLowerCase());
    
    if (!allowed.includes(role)) {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges.' });
    }
    
    next();
  };
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};
