const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const token = req.cookies.token;
    const isJson = req.xhr || req.headers.accept?.includes('application/json') || req.is('json');

    if (!token) {
        if (isJson) {
            return res.status(401).json({ success: false, requireLogin: true, message: 'Please log in to continue' });
        }
        return res.redirect('/login');
    }

    try {
        const user = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = user;

        next();
    } catch (error) {
        if (isJson) {
            return res.status(401).json({ success: false, requireLogin: true, message: 'Session expired. Please log in again.' });
        }
        return res.redirect('/login');
    }
}

module.exports = authenticate;