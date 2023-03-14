import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * 请求成功接口的封装
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data: any) => {
                return {
                    data,
                    code: 200,
                    message: '请求成功',
                };
            })
        );
    }
}
