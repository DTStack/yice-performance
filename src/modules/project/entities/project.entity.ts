import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import BaseContent from '../../base.entity';

@Entity()
export class Project extends BaseContent {
    @PrimaryGeneratedColumn()
    projectId: number;

    @Column('int')
    devopsProjectIds: string;

    @Column({ length: 64 })
    name: string;

    @Column({ length: 64 })
    appName: string;

    @Column({ length: 256 })
    emails: string;
}
