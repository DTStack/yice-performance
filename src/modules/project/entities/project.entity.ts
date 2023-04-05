import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Project extends BaseContent {
    @PrimaryGeneratedColumn()
    projectId: number;

    @Column('int')
    devopsProjectId: number;

    @Column({ length: 256 })
    name: string;

    @Column({ length: 256 })
    appName: string;
}
