import { Module } from '@nestjs/common';
import { ExaminationController } from './controllers/examination.controller';
import { ExaminationService } from './services/examination.service';

@Module({
    imports: [],
    controllers: [ExaminationController],
    providers: [ExaminationService],
})
export class ExaminationModule {}
