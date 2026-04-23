const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const users = require('./users.js');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your_secret_key_here';

app.use(cors());
app.use(express.json());

app.post('/login', (req, res) => {
    const { username, password, rememberMe } = req.body;

    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: rememberMe ? '7d' : '1h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });
    } else {
        res.status(401).json({ message: 'Credenciales inválidas' });
    }
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token requerido' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
}

function authorizeRole(requiredRole) {
    return (req, res, next) => {
        if (req.user.role !== requiredRole) {
            return res.status(403).json({ message: 'Acceso denegado: rol insuficiente' });
        }
        next();
    };
}

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});