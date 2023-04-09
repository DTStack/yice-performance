SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- ----------------------------
-- 子产品项目
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `projectId` int NOT NULL AUTO_INCREMENT,
  `devopsProjectId` int NULL COMMENT 'devops项目id',
  `name` varchar(256) NOT NULL COMMENT '项目名称',
  `appName` varchar(256) NULL COMMENT '项目路径/标识',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `createAt` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`projectId`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目表';


INSERT INTO project (devopsProjectId, name, appName) values (7, '离线', 'batch');
INSERT INTO project (devopsProjectId, name, appName) values (9, '实时', 'stream');
INSERT INTO project (devopsProjectId, name, appName) values (12, '控制台', 'console');
INSERT INTO project (devopsProjectId, name, appName) values (1, 'API', 'dataApi');
INSERT INTO project (devopsProjectId, name, appName) values (13, '资产', 'dataAssets');
INSERT INTO project (devopsProjectId, name, appName) values (3, '标签', 'tag');
INSERT INTO project (devopsProjectId, name, appName) values (2, '指标', 'easyIndex');
INSERT INTO project (devopsProjectId, name, appName) values (16, '数据湖', 'dataLake');
INSERT INTO project (devopsProjectId, name, appName) values (11, 'portal', 'portal');
-- INSERT INTO project (devopsProjectId, name, appName) values (11, '数据源中心', 'dataSource');
INSERT INTO project (name) values ('其他');


-- ----------------------------
-- 子产品项目关联的版本
-- ----------------------------
DROP TABLE IF EXISTS `version`;
CREATE TABLE `version` (
  `versionId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NOT NULL COMMENT '项目id',
  `devopsShiLiId` int NULL COMMENT '绑定的devops实例id',
  `name` varchar(256) NOT NULL COMMENT '版本名称',
  `url` varchar(2048) NOT NULL COMMENT '待检测地址',
  `loginUrl` varchar(2048) NULL COMMENT '登录页面地址',
  `username` varchar(256) NULL COMMENT '登录用户名',
  `password` varchar(256) NULL COMMENT '登录密码',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `createAt` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`versionId`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目版本表';


-- ----------------------------
-- 检测任务
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
  `taskId` int NOT NULL AUTO_INCREMENT,
  `versionId` int NULL COMMENT '版本id',
  `versionName` varchar(256) NULL COMMENT '版本名称',
  `url` varchar(1024) NOT NULL COMMENT '待检测地址',
  `start` bigint NULL COMMENT '检测开始的时间戳',
  `score` int NULL COMMENT '检测得分',
  `duration` int NULL COMMENT '检测耗时，单位毫秒',
  `reportPath` varchar(256) NULL COMMENT '检测结果html文件的相对路径',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '检测任务的状态 0 等待中, 1 检测中, 2 检测失败, 3 检测成功, 4 取消检测',
  `failReason` varchar(10240) NULL COMMENT '检测失败报错信息',
  `triggerType` tinyint(1) NOT NULL DEFAULT 1 COMMENT '任务触发方式 0 系统触发, 1 用户手动触发',
  `isUseful` tinyint(1) NOT NULL DEFAULT 1 COMMENT '任务是否有效 0 无效, 1 有效',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `createAt` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`taskId`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '检测任务表';


-- ----------------------------
-- 检测记录的性能数据
-- ----------------------------
DROP TABLE IF EXISTS `performance`;
CREATE TABLE `performance` (
  `performanceId` int NOT NULL AUTO_INCREMENT,
  `taskId` int NOT NULL COMMENT '检测任务id',
  `weight` int NOT NULL COMMENT '单项所占的权重，单位 %',
  `name` varchar(64) NULL COMMENT '单项名称',
  `score` int NOT NULL COMMENT '单项得分',
  `duration` int NULL COMMENT '单项耗时，单位毫秒',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `createAt` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`performanceId`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '检测记录性能详情表';


-- ----------------------------
-- 子产品分支构建结果，包含构建时间，构建后的文件大小
-- ----------------------------
DROP TABLE IF EXISTS `build`;
CREATE TABLE `build` (
  `buildId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NULL COMMENT '项目id',
  `duration` int NULL COMMENT '构建时长，单位毫秒',
  `fileSize` int NULL COMMENT '构建后的文件大小，单位 KB',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `createAt` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`buildId`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '构建结果表';

