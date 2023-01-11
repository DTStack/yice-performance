import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class TaskService {
    async createTask(): Promise<string> {
        return 'createTask 1234';
    }
}
