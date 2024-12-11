

const jwt = require('jsonwebtoken');

// Middleware for protecting routes based on user roles
exports.protect = (allowedRoles = []) => (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Bearer <token>

    // Check if token is provided
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, token is missing or malformed' });
    }

    try {
        // Verify token and attach decoded user to request
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Check if the user's role is allowed
        if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }
        
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token verification error:', error.message);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Not authorized, token has expired' });
        }
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};

// Generalized role-checking middleware
exports.checkRole = (...allowedRoles) => (req, res, next) => {
    if (!req.user) {
        return res.status(403).json({ message: 'Access denied: No user information available' });
    }
    
    // Check if the user's role is included in the allowed roles
    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    
    next(); // Proceed to the next middleware or route handler
};

// Middleware for checking specific roles
exports.isAdmin = exports.checkRole('Super Admin', 'Data Manager'); // Check for Admin roles
exports.isTeacher = exports.checkRole('Teacher'); // Check for Teacher roles
exports.isStudent = exports.checkRole('Student'); // Check for Student roles
