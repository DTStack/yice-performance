import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { isMobilePhone, isEmail } from 'class-validator';

@Injectable()
export class ExaminationService {
    async test1(): Promise<string> {
        return '1234';
    }
}
