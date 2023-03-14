import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Task extends BaseContent {
    @PrimaryGeneratedColumn()
    taskId: number;

    @Column('int')
    projectId?: number;

    @Column({ length: 256 })
    projectName?: string;

    @Column({ length: 256 })
    url?: string;

    @Column({ length: 64 })
    score?: string;

    @Column('int')
    duration?: number;

    @Column({ length: 256 })
    reportUrl?: string;

    @Column('int', { default: 1 })
    isUseful?: number;

    @Column('int', { default: 0 })
    status?: number;

    @Column({ length: 10240 })
    failReason?: string;
}
