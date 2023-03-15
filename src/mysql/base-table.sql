SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;


-- ----------------------------
-- Table structure for project
-- ----------------------------
DROP TABLE IF EXISTS `project`;
CREATE TABLE `project` (
  `projectId` int NOT NULL AUTO_INCREMENT,
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `name` varchar(256) NOT NULL COMMENT '项目名称',
  `logo` varchar(256) NOT NULL COMMENT '项目logo文件名',
  `url` varchar(1024) NOT NULL COMMENT '待检测地址',
  `loginUrl` varchar(1024) NULL COMMENT '登录页面地址',
  `username` varchar(256) NULL COMMENT '登录用户名',
  `password` varchar(256) NULL COMMENT '登录密码',
  `sleep` int NULL DEFAULT 5000 COMMENT '请求后延迟多少毫秒进行下一步',
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`projectId`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '项目表';


INSERT INTO project (name, logo, url, loginUrl, username, password) values ('离线-5.3.x', 'batch.png', 'http://portalfront-liantiao-53x-lixiankaifa.base53.devops.dtstack.cn/batch/#/', 'http://uicfront-liantiao-53x-lixiankaifa.base53.devops.dtstack.cn/#/login', 'admin@dtstack.com', 'DrpEco_2020');
INSERT INTO project (name, logo, url, loginUrl, username, password) values ('实时-5.3.x', 'stream.png', 'http://portalfront-default-stream-dev-test53-0214-streamapp.base53.devops.dtstack.cn/stream/#/', 'http://uicfront-default-stream-dev-test53-0214-streamapp.base53.devops.dtstack.cn', 'admin@dtstack.com', 'DrpEco_2020');


-- ----------------------------
-- Table structure for task
-- ----------------------------
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
  `taskId` int NOT NULL AUTO_INCREMENT,
  `projectId` int NULL COMMENT '项目id',
  `projectName` varchar(256) NULL COMMENT '项目名称',
  `url` varchar(1024) NULL COMMENT '待检测地址',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `score` varchar(64) NULL COMMENT '检测得分',
  `duration` int NULL COMMENT '检测时长，毫秒',
  `reportUrl` varchar(256) NULL COMMENT '检测结果html文件路径',
  `isUseful` tinyint(1) NOT NULL DEFAULT 1 COMMENT '任务是否有效 0 无效, 1 有效',
  `status` tinyint(1) NOT NULL DEFAULT 0 COMMENT '检测任务的状态 0 等待中, 1 检测中, 2 检测失败, 3 检测成功, 4 手动置失败',
  `failReason` varchar(10240) NULL COMMENT '检测失败报错信息',
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`taskId`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '检测任务表';


-- ----------------------------
-- Table structure for performance
-- ----------------------------
DROP TABLE IF EXISTS `performance`;
CREATE TABLE `performance` (
  `performanceId` int NOT NULL AUTO_INCREMENT,
  `taskId` int NULL COMMENT '检测任务id',
  `isDelete` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否删除 0 未删除, 1 已删除',
  `weight` varchar(64) NULL COMMENT '单项所占的权重',
  `name` varchar(64) NULL COMMENT '单项名称',
  `score` varchar(64) NULL COMMENT '单项得分',
  `time` varchar(64) NULL COMMENT '单项耗时',
  `createAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updateAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`performanceId`) USING BTREE
) ENGINE = InnoDB DEFAULT CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '检测记录性能详情表';

