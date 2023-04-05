import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Task extends BaseContent {
    @PrimaryGeneratedColumn()
    taskId: number;

    @Column('int')
    versionId?: number;

    @Column({ length: 256 })
    versionName?: string;

    @Column('int')
    start?: number;

    @Column({ length: 1024 })
    url: string;

    @Column('int')
    score?: number;

    @Column('int')
    duration?: number;

    @Column({ length: 256 })
    reportUrl?: string;

    @Column('int', { default: 0 })
    status: number;

    @Column({ length: 10240 })
    failReason?: string;

    @Column('int', { default: 1 })
    triggerType: number;

    @Column('int', { default: 1 })
    isUseful?: number;
}
