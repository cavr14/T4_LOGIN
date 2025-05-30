// Importa las dependencias necesarias
const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csrf');
const dotenv = require('dotenv');
const crypto = require('crypto');
const cors = require('cors');
const bcrypt = require('bcryptjs');

// Carga variables de entorno
dotenv.config();

const port = process.env.PORT || 3000;
const SECRET_KEY = process.env.SECRET_KEY || 'secret';

// "Bases de datos" en memoria para usuarios y sesiones
const users = [];
const sessions = {};

// Opciones para cookies seguras
const secureCookieOptions = () => ({
    httpOnly: true,
    secure: false, // Cámbialo a true si usas HTTPS
    sameSite: 'strict'
});

// Inicializa la app de Express
const app = express();

// Middlewares básicos
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: 'http://localhost:3001', // Frontend
    credentials: true
}));

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de login segura');
});

// Ruta para obtener un token CSRF
app.get('/csrf-token', (req, res) => {
    const csrfToken = new csrf().create(SECRET_KEY);
    res.json({ csrfToken });
});

// Registro
app.post('/register', async (req, res) => {
    const { usuario, password1, password2, csrfToken } = req.body;

    // Verificación CSRF
    if (!csrf().verify(SECRET_KEY, csrfToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    // Validaciones básicas
    if (!usuario || !password1 || !password2) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
    }
    if (password1 !== password2) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
    }

    // Validación de usuario (mínimo 6 caracteres, empieza por letra)
    const regexpUsuario = /^[a-zA-Z][0-9a-zA-Z]{5,49}$/;
    if (!regexpUsuario.test(usuario)) {
        return res.status(400).json({ error: 'NOMBRE INVÁLIDO PARA USUARIO' });
    }

    // Validación de contraseña fuerte
    function validarPassword(password) {
        return (
            password.length >= 10 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password) &&
            /[^A-Za-z0-9]/.test(password)
        );
    }
    if (!validarPassword(password1)) {
        return res.status(400).json({ error: 'CONTRASEÑA INSEGURA' });
    }

    // Normaliza usuario y busca duplicados
    const usuarioNorm = usuario.toLowerCase();
    const hashUsuario = crypto.createHash('sha1').update(usuarioNorm).digest('hex');
    if (users.find(u => u.hashUsuario === hashUsuario)) {
        return res.status(409).json({ error: 'El usuario ya existe.' });
    }

    // Hashea la contraseña y guarda usuario
    const hashPassword = await bcrypt.hash(password1, 10);
    users.push({ hashUsuario, username: usuarioNorm, password: hashPassword });

    res.status(201).json({ message: 'CUENTA CREADA CORRECTAMENTE' });
});

// Login
app.post('/login', async (req, res) => {
    const { username, password, csrfToken } = req.body;

    // Verificación CSRF
    if (!csrf().verify(SECRET_KEY, csrfToken)) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    // Validaciones básicas
    if (!username || !password) {
        return res.status(400).json({ error: 'Usuario y contraseña son requeridos.' });
    }

    // Busca usuario
    const usernameNorm = username.toLowerCase();
    const hashUsuario = crypto.createHash('sha1').update(usernameNorm).digest('hex');
    const user = users.find(u => u.hashUsuario === hashUsuario);
    if (!user) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Verifica contraseña
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Crea sesión y setea cookie
    const sessionId = crypto.randomBytes(16).toString('base64url');
    sessions[sessionId] = { username: user.username };
    res.cookie('sessionId', sessionId, secureCookieOptions());
    res.status(200).json({ message: 'Login succesful' });
});

// Obtener usuario autenticado
app.get('/me', (req, res) => {
    const sessionId = req.cookies.sessionId;
    if (!sessionId || !sessions[sessionId]) {
        return res.status(401).json({ error: 'No autenticado' });
    }
    res.json({ username: sessions[sessionId].username });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});