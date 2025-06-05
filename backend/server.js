const express = require('express');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

//Cargar las variables de entorno que tengo en mi archivo .env
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';

// "Bases de datos" en memoria, se borran los datos cuando se reinicia el servidor
const users = [];
const sessions = {};

// Configuración de las cookies
const cookieOptions = {
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
};

// ======= Funciones Auxiliares =======

// Validar usuario según regex del diagrama
function validarUsuario(usuario) {
    const regexpUsuario = /^[a-zA-Z][0-9a-zA-Z]{5,49}$/;
    return regexpUsuario.test(usuario);
}

// Validar password 
function validarPassword(password) {
    return (
        typeof password === 'string' &&
        password.length >= 10 &&
        /[A-Z]/.test(password) &&
        /[a-z]/.test(password) &&
        /[0-9]/.test(password) &&
        /[^A-Za-z0-9]/.test(password)
    );
}

// Generar hash del usuario
function hashUsuario(username) {
    return crypto.createHash('sha1').update(username).digest('hex');
}

// Middleware para verificar CSRF simple
function verificarCSRF(req, res, next) {
    const token = req.cookies.csrfToken;
    const tokenBody = req.body.csrfToken;
    if (!token || !tokenBody || token !== tokenBody) {
        return res.status(403).json({ error: 'Token CSRF inválido.' });
    }
    next();
}

// ======= Middlewares =======
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// ======= Rutas =======
app.get('/', (req, res) => {
    res.send('API de login segura');
});

// CSRF token (cookie + respuesta)
app.get('/csrf-token', (req, res) => {
    const csrfToken = crypto.randomBytes(24).toString('hex');
    res.cookie('csrfToken', csrfToken, { ...cookieOptions, maxAge: 10 * 60 * 1000 }); // La cookie expirará en 10 minutos
    res.json({ csrfToken });
});

// Registro de usuario
app.post('/register', verificarCSRF, async (req, res) => {
    const { usuario, password1, password2 } = req.body;

    // 1. Contraseñas coinciden
    if (password1 !== password2) {
        return res.status(400).json({ error: 'Contraseñas no coinciden.' });
    }

    // 2. Usuario válido
    if (!validarUsuario(usuario)) {
        return res.status(400).json({ error: 'Nombre inválido para usuario.' });
    }

    // 3. Password fuerte
    if (!validarPassword(password1)) {
        return res.status(400).json({ error: 'Contraseña insegura.' });
    }

    // 4. Normalizar, hash y comprobar duplicado
    const usuarioNorm = usuario.toLowerCase();
    const hashUser = hashUsuario(usuarioNorm);
    if (users.find(u => u.hashUsuario === hashUser)) {
        return res.status(409).json({ error: 'El usuario ya existe.' });
    }

    // 5. Hashear password y guardar usuario
    const hashPassword = await bcrypt.hash(password1, 12);
    users.push({ hashUsuario: hashUser, username: usuarioNorm, password: hashPassword });

    res.status(201).json({ message: 'Cuenta creada correctamente' });
});

// Login de usuario
app.post('/login', verificarCSRF, async (req, res) => {
    const { username, password } = req.body;

    const usernameNorm = username.toLowerCase();
    const hashUser = hashUsuario(usernameNorm);
    const user = users.find(u => u.hashUsuario === hashUser);

    if (!user) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    const coincide = await bcrypt.compare(password, user.password);
    if (!coincide) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Crear sesión y regresar cookie
    const sessionId = crypto.randomBytes(20).toString('hex');
    sessions[sessionId] = { username: user.username };
    res.cookie('sessionId', sessionId, cookieOptions);

    res.status(200).json({ message: 'Login exitoso.' });
});

// Obtener usuario autenticado
app.get('/me', (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId || !sessions[sessionId]) {
        return res.status(401).json({ error: 'No autenticado.' });
    }
    res.json({ username: sessions[sessionId].username });
});

app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});