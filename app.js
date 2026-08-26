const { log } = require('console');
const express = require('express')
const path = require('path')
const connection = require('./model/connection')
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const authenticate = require('./middleware/auth');
require('dotenv').config();
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

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'public')));
app.set('view engine','ejs')
app.use(cookieParser());


app.get('/', async (req, res) => {
    console.table(await getUsers());
    res.render('home')
});
app.get('/login',(req,res)=>{
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});