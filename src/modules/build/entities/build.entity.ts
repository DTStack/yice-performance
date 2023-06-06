import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Build extends BaseContent {
    @PrimaryGeneratedColumn()
    buildId: number;

    @Column('int')
    projectId: number;

    @Column({ length: 64, comment: '仓库名' })
    repository?: string;

    @Column({ length: 256, comment: '分支名' })
    branch?: string;

    @Column({ length: 64, comment: '数栈版本' })
    version?: string;

    @Column('int')
    duration?: number;

    @Column('int')
    fileSize?: number;
}
