SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- ----------------------------
-- Table structure for Project
-- ----------------------------
DROP TABLE IF EXISTS `Project`;
CREATE TABLE `Project` (
  `id` int NOT NULL AUTO_INCREMENT,
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `name` varchar(256) NOT NULL COMMENT '项目名称',
  `logo` varchar(256) NOT NULL COMMENT '项目logo文件名',
  `url` varchar(1024) NOT NULL COMMENT '待检测地址',
  `loginUrl` varchar(1024) NULL COMMENT '登录页面地址',
  `username` varchar(1024) NULL COMMENT '登录用户名',
  `password` varchar(1024) NULL COMMENT '登录密码',
  `sleep` int NULL DEFAULT 5000 COMMENT '请求后延迟多少毫秒进行下一步',
  `createAt` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目表';


-- ----------------------------
-- Table structure for Record
-- ----------------------------
DROP TABLE IF EXISTS `Record`;
CREATE TABLE `Record` (
  `id` int NOT NULL AUTO_INCREMENT,
  `projectId` int NULL COMMENT '项目id',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `score` varchar(64) NULL COMMENT '检测得分',
  `duration` varchar(64) NULL COMMENT '检测时长，毫秒',
  `resultPath` varchar(256) NULL COMMENT '检测结果html文件路径',
  `isUseful` tinyint(1) NOT NULL DEFAULT 1 COMMENT '记录是否有效 0 无效, 1 有效',
  `createAt` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '检测记录表';


-- ----------------------------
-- Table structure for Performance
-- ----------------------------
DROP TABLE IF EXISTS `Performance`;
CREATE TABLE `Performance` (
  `id` int NOT NULL AUTO_INCREMENT,
  `recordId` int NULL COMMENT '检测记录id',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `weight` varchar(64) NULL COMMENT '单项所占的权重',
  `name` varchar(64) NULL COMMENT '单项名称',
  `score` varchar(64) NULL COMMENT '单项得分',
  `time` varchar(64) NULL COMMENT '单项耗时',
  `createAt` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '检测记录性能详情表';

