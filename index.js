import express from 'express';
import morgan from 'morgan';
import jwt from 'jsonwebtoken';

import * as path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const log = console.log;

// MIDDLEWARES GENERALES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('tiny'));

//DEJAR PÚBLICA LA CARPETA PUBLIC
app.use(express.static('public'));

app.listen(3000, () => {
    log('Servidor escuchando en http://localhost:3000')
});

// Vistas
app.get('/login', (req, res) => {
    res.sendFile(path.resolve(__dirname, './public/login.html'));
})

// Hacer esto con una base de datos real *
let usuarios = [
    { id: 1, nombre: 'Matias', email: 'matias@gmail.com', password: '123456' },
    { id: 2, nombre: 'Carla', email: 'carlas@gmail.com', password: '123456' }
];

// Endpoints
app.post('/api/v1/login', (req, res) => {
    try {
        let { email, password } = req.body;
        log('datos desde el form: ', email, password)
        let usuario = usuarios.find(user => user.email == email && user.password == password);

        if (!usuario) {
            return res.status(400).json({
                message: 'Las credenciales de acceso no coinciden.'
            })
        };
        usuario = JSON.parse(JSON.stringify(usuario));
        delete usuario.password; // de este modo no exponemos la contraseña - al no ser una bbdd no puedo filtrar por columnas

        log('usuarios', usuarios);
        log('usuario', usuario);

        let token = jwt.sign(usuario, 'secreto',)  //proteger palabra clave para firmar el token
        log('token', token)
        res.json({
            message: 'Login exitoso',
            usuario,
            token
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el proceso de login.' })
    }
});

app.get('/privada', (req, res) => {
    try {
        let { token } = req.query;
        jwt.verify(token, 'secreto')
        res.sendFile(path.resolve(__dirname, './public/privada.html'));
    } catch (error) {
        log(error.message)
        let status = 500;
        let message = 'Error al cargar la vista.'
        if (error.message == 'jwt must be provided') {
            status = 400;
            message = 'Debe proporcionar un token válido.'
        } else if (error.message == 'invalid signature') {
            status = 401;
            message = 'Debe proporcionar un token válido.'
        }
        res.status(status).json(message);
    }
});


app.all('*', (req, res) => {
    res.send('Página no encontrada.')
});