CREATE TABLE IF NOT EXISTS marcaciones (
    id SERIAL PRIMARY KEY,
    codigo_empleado VARCHAR(50) NOT NULL,
    nombre_empleado VARCHAR(150) NOT NULL,
    fecha DATE NOT NULL,
    hora_ingreso_programada TIME NOT NULL,
    hora_ingreso_real TIME NOT NULL,
    hora_salida_programada TIME NOT NULL,
    hora_salida_real TIME NOT NULL,
    estado VARCHAR(20) NOT NULL
);
