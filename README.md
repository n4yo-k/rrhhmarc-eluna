# RRHH Aplicación RRHH    

## Arquitectura
Usuario -> Web (Nginx, puerto 8080) -> API REST (Node/Express, puerto 3001) -> PostgreSQL (interno, red rrhhnet)

## Cómo levantar
1. Copiar `.env.example` a `.env` y ajustar contraseñas.
2. Ejecutar: `docker compose up -d --build`
3. Web: http://localhost:8080
4. API: http://localhost:3005/api/marcaciones
## Se usa el puerto 3005 por que en mi dispositivo el 3001... estaban ocupados

## Endpoints
- POST /api/marcaciones
- GET /api/marcaciones
- GET /api/marcaciones?empleado=EMP001
- GET /api/marcaciones/{id}
- PUT /api/marcaciones/{id}

## Por qué no se usa localhost para la conexión API-DB
Cada contenedor tiene su propia red localhost, y en el contenedor de la api apunta a si mismo y no a la bdd. Docker Compose crea una red privada donde el nombre del servicio actúa como DNS interno, resolviendo a la IP del contenedor correspondiente.
