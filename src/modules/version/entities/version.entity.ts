import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import BaseContent from '../../base.entity';

@Entity()
export class Version extends BaseContent {
    @PrimaryGeneratedColumn()
    versionId: number;

    @Column('int')
    projectId: number;

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
}
