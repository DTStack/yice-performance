import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DevopsController } from './controllers/devops.controller';
import { DevopsService } from './services/devops.service';

@Module({
    imports: [
        HttpModule.register({
            timeout: 30_000,
            maxRedirects: 5,
        }),
    ],
    controllers: [DevopsController],
    providers: [DevopsService],
})
export class DevopsModule {}
