# DDL

```sql
-- 修改生命周期
-- 单位为 天。-1 为永久保存
ALTER TABLE <table_name> SET LIFECYCLE 50;

-- 修改表备注
ALTER TABLE <table_name> SET COMMENT '<new_comment>';

-- 修改列备注
ALTER TABLE <table_name> CHANGE COLUMN <col_name> COMMENT '<col_comment>';
```

## 删减字段

增加字段

```sql
-- 增加字段
ALTER TABLE <table_name> ADD COLUMNS (
    `age` BIGINT COMMENT '年龄'
    ,`name` STRING COMMENT '姓名'
)
;
```

删除字段

```sql
-- 创建备份表，备份原表数据
CREATE TABLE IF NOT EXISTS user_backup(
	id BIGINT COMMENT 'id',
	 nickname STRING COMMENT '用户昵称',
	 password STRING COMMENT '用户密码',
	 avatar STRING COMMENT '头像',
	 sex STRING COMMENT '性别',
) COMMENT '用户表 备份'
PARTITIONED BY (ds STRING)
LIFECYCLE 30;

-- 将原表的数据复制到备份表
SET odps.sql.allow.fullscan = true
;
INSERT OVERWRITE user_backup PARTITION (ds)
SELECT  id,
  nickname,
  password,
  avatar,
  sex,
  ds
FROM    user
;

-- 删除原表，并重建原表
DROP TABLE IF EXISTS user
;
CREATE TABLE IF NOT EXISTS user(
	id BIGINT COMMENT 'id',
	 nickname STRING COMMENT '用户昵称',
	 avatar STRING COMMENT '头像',
	 sex STRING COMMENT '性别',
) COMMENT '用户表'
PARTITIONED BY (ds STRING)
LIFECYCLE 30;

-- 将数据从备份表恢复至原表
SET odps.sql.allow.fullscan = true
;
INSERT OVERWRITE user PARTITION (ds)
SELECT  id,
  nickname,
  avatar,
  sex,
  ds
FROM    user_backup
;

-- 删除备份表
DROP TABLE IF EXISTS user_backup
;
```

