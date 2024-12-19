const express = require('express');
const sql = require('mssql');
const cors = require('cors'); // Importa el paquete CORS
const app = express();

const config = {
  user: 'tu_usuario',
  password: 'tu_contraseña',
  server: 'localhost',
  database: 'tu_base_de_datos'
};

// Configuración de CORS
app.use(cors({
  origin: 'https://front-fnw0.onrender.com', // Cambia esto por la URL de tu frontend en Render
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/formulario', async (req, res) => {
  const { nombre, contraseña, celular, tipoUsuario } = req.body;

  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('nombre', sql.NVarChar, nombre)
      .input('contraseña', sql.NVarChar, contraseña)
      .input('celular', sql.Int, celular || null)
      .input('tipoUsuario', sql.NVarChar, tipoUsuario)
      .query('INSERT INTO usuarios (nombre, contraseña, celular, tipoUsuario) VALUES (@nombre, @contraseña, @celular, @tipoUsuario)');

    res.send('Usuario registrado correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al registrar el usuario');
  }
});

app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
