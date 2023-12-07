import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import BaseContent from '../../base.entity';

@Entity()
export class Version extends BaseContent {
    @PrimaryGeneratedColumn()
    versionId: number;

    @Column('int')
    projectId: number;

    @Column('int')
    devopsShiLiId: number;

    @Column({ length: 256 })
    name?: string;

    @Column({ length: 1024 })
    url: string;

    @Column({ length: 1024 })
    loginUrl: string;

    @Column({ length: 256 })
    username: string;

    @Column({ length: 256 })
    password: string;

    @Column({ length: 64 })
    cron: string;

    @Column('int')
    isFreeze: number;

    @Column({ length: 256 })
    note: string;
}
