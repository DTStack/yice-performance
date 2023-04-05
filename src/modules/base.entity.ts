import { Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export default class BaseContent {
    @Column({
        type: 'int',
        nullable: false,
        default: 0,
        name: 'isDelete',
        comment: '是否删除 0 未删除, 1 已删除',
    })
    isDelete: number;

    @CreateDateColumn({
        type: 'datetime',
        nullable: false,
        name: 'createAt',
        comment: '创建时间',
    })
    createAt: Date;

    @UpdateDateColumn({
        type: 'datetime',
        nullable: false,
        name: 'updateAt',
        comment: '创建时间',
    })
    updateAt: Date;
}
