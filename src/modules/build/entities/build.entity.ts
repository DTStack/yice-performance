import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Build extends BaseContent {
    @PrimaryGeneratedColumn()
    buildId: number;

    @Column('int')
    projectId: number;

    @Column('int')
    duration?: number;

    @Column('int')
    fileSize?: number;
}
