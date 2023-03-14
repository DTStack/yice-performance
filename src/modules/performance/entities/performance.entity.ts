import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Performance extends BaseContent {
    @PrimaryGeneratedColumn()
    performanceId: number;

    @Column('int')
    taskId: number;

    @Column({ length: 64, comment: '单项所占的权重' })
    weight: string;

    @Column({ length: 64, comment: '单项名称' })
    name: string;

    @Column({ length: 64, comment: '单项得分' })
    score: string;

    @Column({ length: 64, comment: '单项耗时' })
    time: string;
}
