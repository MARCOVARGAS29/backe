import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:4200',
    'https://front-fnw0.onrender.com', // URL adicional del frontend en Render
    'https://backe-585f.onrender.com'
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    methods: 'GET,POST,PUT,DELETE,PATCH', // Métodos HTTP permitidos
    credentials: true // Permitir cookies o cabeceras autorizadas
  });

  // Escuchar en 0.0.0.0 para que Render acepte conexiones externas
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`Servidor corriendo en el puerto ${process.env.PORT || 3000}`);
}

bootstrap();
