-- 版本表添加 note 字段用于存储调度配置时的备注
ALTER TABLE version add COLUMN note varchar(256) NULL COMMENT '备注';



-- 任务表添加 previewImg 字段用于存储检测结果的首屏图片预览
ALTER TABLE task add COLUMN previewImg LONGTEXT NULL COMMENT '结果的首屏图片预览';



-- 产品表添加 emails 字段用于接收数据周报邮件
ALTER TABLE project add COLUMN emails varchar(256) NULL COMMENT '子产品相关人员邮箱，用于接收数据周报邮件';




-- 版本表添加 sort 字段用于版本排序
ALTER TABLE version add COLUMN sort int NULL DEFAULT 1 COMMENT '排序序号';

