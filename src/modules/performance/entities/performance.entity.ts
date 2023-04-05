import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Performance extends BaseContent {
    @PrimaryGeneratedColumn()
    performanceId: number;

    @Column('int')
    taskId: number;

    @Column('int')
    weight: number;

    @Column({ length: 64, comment: '单项名称' })
    name?: string;

    @Column('int')
    score: number;

    @Column('int')
    duration?: number;
}
