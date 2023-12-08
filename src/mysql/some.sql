-- 版本表添加 note 字段用于存储调度配置时的备注
ALTER TABLE version add COLUMN note varchar(256) NULL COMMENT '备注';



-- 任务表添加 previewImg 字段用于存储检测结果的首屏图片预览
ALTER TABLE task add COLUMN previewImg LONGTEXT NULL COMMENT '结果的首屏图片预览';
