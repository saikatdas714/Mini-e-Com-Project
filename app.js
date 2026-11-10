require('dotenv').config();
const { log } = require('console');
const express = require('express')
const path = require('path')
const fs = require('fs');
const multer = require('multer');
const connection = require('./model/connection')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authenticate = require('./middleware/auth');
const adminAuth = require('./middleware/adminAuth');

const {
    createUser,
    getUsers,
    getUserById,
    getUserByEmail,
    loginUser,
    updateUser,
    updatePassword,
    updateRole,
    deleteUser
} = require('./controllers/userController');
const {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} = require('./controllers/productController');
const {
    addToCart,
    getCart,
    getCartCount,
    removeFromCart,
    clearCart
} = require('./controllers/cartController');
const { sendPurchaseNotification } = require('./services/emailService');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.get('/favicon.ico', (req, res) => res.sendFile(path.join(process.cwd(), 'public', 'bag-check-fill.svg')));
app.set('view engine', 'ejs')
app.use(cookieParser());

// Global user session middleware for all views
app.use(async (req, res, next) => {
    const token = req.cookies.token;
    res.locals.cartCount = 0;
    if (token) {
        try {
            const user = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = user;
            req.user = user;
            res.locals.cartCount = await getCartCount(user.id);
        } catch (e) {
            res.locals.user = null;
        }
    } else {
        res.locals.user = null;
    }
    next();
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

app.get('/', async (req, res) => {
    const products = await getProducts()
    res.render('home', { products })
});
app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await loginUser(email, password);

        if (!user) {
            return res.send(`
                <script>
                    alert("Invalid email or password!");
                    window.location.href = "/login";
                </script>
            `);
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000
        });

        res.redirect('/');

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});
app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const user = await createUser(name, email, password);

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000
        });

        res.send(`
            <script>
                alert("Signup successful!");
                window.location.href = "/";
            </script>
        `);

    } catch (error) {
        console.error(error);

        if (error.message === 'User already exists') {
            return res.send(`
                <script>
                    alert("Email already registered!");
                    window.location.href = "/signup";
                </script>
            `);
        }

        res.status(500).send('Server error');
    }
});
app.get('/add-product', authenticate, adminAuth, (req, res) => {
    res.render('add-product')
})
app.post('/add-product', authenticate, adminAuth, async (req, res) => {
    const { name, price, description, image } = req.body;

    try {
        await createProduct(
            name,
            price,
            description,
            image
        );

        res.redirect('/');

    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to add product');
    }
});
app.get('/cart', authenticate, async (req, res) => {

    try {

        const cart = await getCart(req.user.id);

        res.render('cart', { cart });

    } catch (error) {

        console.error(error);
        res.status(500).send('Failed to load cart');

    }

});

// Configure multer storage for payment screenshot uploads
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.jpg';
        const uniqueName = `payment-${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPG, PNG, WEBP) are allowed'));
        }
    }
});

// Checkout must be defined BEFORE /cart/:id so 'checkout' is not treated as :id
app.post('/cart/checkout', authenticate, upload.single('paymentProof'), async (req, res) => {
    const isJson = req.xhr || req.headers.accept?.includes('application/json') || req.is('json') || req.headers['x-requested-with'] === 'XMLHttpRequest';

    try {
        const userId = req.user.id;
        const cart = await getCart(userId);

        if (!cart || cart.length === 0) {
            if (isJson) {
                return res.status(400).json({ success: false, message: 'Your cart is empty!' });
            }
            return res.redirect('/cart');
        }

        if (!req.file) {
            if (isJson) {
                return res.status(400).json({ success: false, message: 'Please upload your payment confirmation screenshot.' });
            }
            return res.redirect('/cart');
        }

        console.log(`[Checkout] Received payment screenshot: "${req.file.originalname}" (${(req.file.size / 1024).toFixed(1)} KB) -> saved to: ${req.file.path}`);

        const user = (await getUserById(userId)) || req.user;
        const totalAmount = cart.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
        const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);

        // Send purchase notification email with attached payment screenshot to saikatdas7320@gmail.com
        let emailResult = { delivered: false };
        try {
            emailResult = await sendPurchaseNotification({
                to: 'saikatdas7320@gmail.com',
                orderId,
                customer: user,
                items: cart,
                totalAmount,
                paymentScreenshot: {
                    path: req.file.path,
                    originalname: req.file.originalname,
                    filename: req.file.filename
                }
            });
        } catch (emailErr) {
            console.error('[Checkout] Error dispatching email notification:', emailErr.message);
        }

        // Clear cart after purchase
        await clearCart(userId);

        if (isJson) {
            return res.json({
                success: true,
                orderId,
                totalAmount,
                emailSent: !!(emailResult && emailResult.delivered),
                message: 'Your order has been placed successfully!'
            });
        }

        res.redirect('/cart');
    } catch (error) {
        console.error('Failed to complete checkout:', error);
        if (isJson) {
            return res.status(500).json({ success: false, message: error.message || 'Failed to process purchase checkout' });
        }
        res.status(500).send('Failed to process purchase checkout');
    }
});

app.post('/cart/remove/:id', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const productId = req.params.id;

        await removeFromCart(userId, productId);

        res.redirect('/cart');

    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to remove product');
    }
});

app.post('/cart/:id', authenticate, async (req, res) => {
    const isJson = req.xhr || req.headers.accept?.includes('application/json') || req.is('json');

    try {
        const userId = req.user.id;
        const productId = req.params.id;

        await addToCart(userId, productId);
        const cartCount = await getCartCount(userId);

        if (isJson) {
            return res.json({
                success: true,
                cartCount,
                message: 'Product added to cart successfully!'
            });
        }

        res.redirect('/cart');

    } catch (error) {
        console.error(error);
        if (isJson) {
            return res.status(500).json({ success: false, message: 'Failed to add product to cart' });
        }
        res.status(500).send('Failed to add product to cart');
    }
});
app.get('/create-admin',authenticate,adminAuth, (req, res) => {
    res.render('create-admin');
});

app.post('/create-admin',authenticate,adminAuth,async (req, res) => {

    const { name, email, password } = req.body;

    try {

        await createUser(
            name,
            email,
            password,
            'admin'
        );

        res.send(`
            <script>
                alert("Admin created successfully!");
                window.location.href = "/";
            </script>
        `);

    } catch (error) {

        console.error(error);

        if (error.message === 'User already exists') {
            return res.send(`
                <script>
                    alert("Email already registered!");
                    window.location.href = "/create-admin";
                </script>
            `);
        }

        res.status(500).send('Failed to create admin');
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});