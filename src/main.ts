import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const APP_PORT = process.env.APP_PORT || 4000;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(APP_PORT, () => {
        console.log(`app runs on port ${APP_PORT}`);
    });
}
bootstrap();
