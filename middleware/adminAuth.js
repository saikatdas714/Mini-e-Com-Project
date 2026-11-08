function adminAuth(req, res, next) {

    if (!req.user) {
        return res.redirect('/login');
    }

    if (req.user.role !== 'admin') {
        return res.status(403).send(`
            <script>
                alert("Access Denied: Admin only");
                window.location.href = "/";
            </script>
        `);
    }

    next();
}

module.exports = adminAuth;