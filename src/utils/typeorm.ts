/**
 * 统一处理 where 的 isDelete
 */
export const getWhere = (where = {}) => {
    return { ...where, isDelete: 0 };
};
