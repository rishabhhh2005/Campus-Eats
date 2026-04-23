import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export const protect = (req, res, next) => {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '');
		if (!token) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		res.status(401).json({ error: 'Invalid or expired token' });
	}
};
