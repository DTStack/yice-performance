/**
 * 统一处理 where 的 isDelete
 */
export const getWhere = (where = {}) => {
    return { isDelete: 0, ...where };
};
