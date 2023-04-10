import path from 'path';
import { DataSource } from 'typeorm';
import dbConfig from '@/configs/db.config';
console.log(1119, process.env.RESPONSE_SLEEP, dbConfig);

export const databaseProviders = [
    {
        provide: 'DATA_SOURCE',
        useFactory: async () => {
            const dataSource = new DataSource({
                // ...dbConfig,
                type: 'mysql',
                entities: [path.join(__dirname, '/../**/*.entity{.ts,.js}')],
                // synchronize: true,
            });

            return dataSource.initialize();
        },
    },
];
