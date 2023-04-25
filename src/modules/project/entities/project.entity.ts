import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Project extends BaseContent {
    @PrimaryGeneratedColumn()
    projectId: number;

    @Column('int')
    devopsProjectIds: string;

    @Column({ length: 256 })
    name: string;

    @Column({ length: 256 })
    appName: string;
}
