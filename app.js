require('dotenv').config();
const { log } = require('console');
const express = require('express')
const path = require('path')
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
    removeFromCart
} = require('./controllers/cartController');

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.set('view engine', 'ejs')
app.use(cookieParser());


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
app.post('/cart/:id', authenticate, async (req, res) => {

    try {

        const userId = req.user.id;
        const productId = req.params.id;

        await addToCart(userId, productId);

        res.redirect('/');

    } catch (error) {

        console.error(error);
        res.status(500).send('Failed to add product to cart');

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
app.get('/create-admin', (req, res) => {
    res.render('create-admin');
});

app.post('/create-admin', async (req, res) => {

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