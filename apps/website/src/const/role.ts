// 易测的角色 1 管理员 2 用户
export enum YICE_ROLE {
    ADMIN = '1',
    USER = '2',
}

// 管理员的权限点：批量删除，编辑版本，删除版本，编辑 cron
export const ADMIN_ROLE = ['patch-delete', 'edit-version', 'delete-version', 'edit-cron'];
