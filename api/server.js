const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const PORT = process.env.INTERNAL_API_PORT || 3001;

function calcularEstado(programada, real) {
  return real <= programada ? 'PUNTUAL' : 'ATRASO';
}

app.post('/api/marcaciones', async (req, res) => {
  try {
    const { codigo_empleado, nombre_empleado, fecha, hora_ingreso_programada,
      hora_ingreso_real, hora_salida_programada, hora_salida_real } = req.body;

    if (!codigo_empleado || !fecha || !hora_ingreso_real || !hora_salida_real) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }
    if (hora_salida_real < hora_ingreso_real) {
      return res.status(400).json({ error: 'La hora de salida no puede ser antes de la de entrada' });
    }

    const estado = calcularEstado(hora_ingreso_programada, hora_ingreso_real);

    const result = await pool.query(
      `INSERT INTO marcaciones
      (codigo_empleado, nombre_empleado, fecha, hora_ingreso_programada, hora_ingreso_real, hora_salida_programada, hora_salida_real, estado)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [codigo_empleado, nombre_empleado, fecha, hora_ingreso_programada, hora_ingreso_real, hora_salida_programada, hora_salida_real, estado]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/marcaciones', async (req, res) => {
  try {
    const { empleado } = req.query;
    const result = empleado
      ? await pool.query('SELECT * FROM marcaciones WHERE codigo_empleado = $1 ORDER BY id', [empleado])
      : await pool.query('SELECT * FROM marcaciones ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.get('/api/marcaciones/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM marcaciones WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.put('/api/marcaciones/:id', async (req, res) => {
  try {
    const { codigo_empleado, nombre_empleado, fecha, hora_ingreso_programada,
      hora_ingreso_real, hora_salida_programada, hora_salida_real } = req.body;

    if (!codigo_empleado || !fecha || !hora_ingreso_real || !hora_salida_real) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }
    if (hora_salida_real < hora_ingreso_real) {
      return res.status(400).json({ error: 'La hora de salida no puede ser antes que a la de ingreso' });
    }

    const estado = calcularEstado(hora_ingreso_programada, hora_ingreso_real);

    const result = await pool.query(
      `UPDATE marcaciones SET codigo_empleado=$1, nombre_empleado=$2, fecha=$3,
      hora_ingreso_programada=$4, hora_ingreso_real=$5, hora_salida_programada=$6,
      hora_salida_real=$7, estado=$8 WHERE id=$9 RETURNING *`,
      [codigo_empleado, nombre_empleado, fecha, hora_ingreso_programada, hora_ingreso_real, hora_salida_programada, hora_salida_real, estado, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'No encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(PORT, () => console.log(`API RRHH en puerto ${PORT}`));
