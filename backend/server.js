const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csrf');
const dotenv = require('dotenv');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const cors = require('cors');

dotenv.config();

const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';

const users = [
    {
        usernameHash: crypto.createHash('sha1').update('admin').digest('hex'),
        passwordHash: bcrypt.hashSync('admin', 10)
    }
];

const sessions = {};

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

const tokens = new csrf();


app.get('/csrf-token', (req, res) => {
    const csrfToken = tokens.create(SECRET_KEY);
    res.json({ csrfToken });
});


app.post('/login', async (req, res) => {
    const { username, password, csrfToken } = req.body;

    if (!tokens.verify(SECRET_KEY, csrfToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    const usernameHash = crypto.createHash('sha1').update(username).digest('hex');

    // Buscamos el usuario
    const user = users.find(user => user.usernameHash === usernameHash);

    if (!user) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Comparamos la contraseña usando bcrypt
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Creamos la sesión y enviamos la cookie
    const sessionId = crypto.randomBytes(16).toString('base64url');
    sessions[sessionId] = { usernameHash };
    res.cookie('sessionId', sessionId);
    
    res.status(200).json({ message: 'Login successful' });
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
