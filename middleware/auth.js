const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
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
        return res.redirect('/login');
    }
}

module.exports = authenticate;