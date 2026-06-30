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

