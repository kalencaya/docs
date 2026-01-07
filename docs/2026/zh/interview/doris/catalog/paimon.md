# Paimon

## 创建



```sql
SHOW CATALOGS;

SWITCH CATALOGS;

-- oss
DROP CATALOG IF EXISTS paimon_oss_catalog;
CREATE CATALOG IF NOT EXISTS paimon_oss_catalog PROPERTIES (
    'type' = 'paimon',
    'paimon.catalog.type' = 'filesystem',
    'warehouse' = 'oss://doris/paimon/',
    'oss.region' = 'cn-hangzhou',
    'oss.endpoint' = 'oss-cn-hangzhou-internal.aliyuncs.com',
    'oss.access_key' = '<access_key>',
    'oss.secret_key' = '<secret_key>'
);

-- minio
DROP CATALOG IF EXISTS paimon_s3_catalog;
CREATE CATALOG IF NOT EXISTS paimon_s3_catalog PROPERTIES (
    'type' = 'paimon',
    'paimon.catalog.type' = 'filesystem',
    'warehouse' = 's3://doris/paimon/',
    'fs.minio.support' = 'true',
    'minio.endpoint' = 'http://localhost:9000',
    'minio.access_key' = 'admin',
    'minio.secret_key' = 'password',
    'minio.use_path_style' = 'true'
);
```

## 查询

```sql
-- 查询
select * from `paimon_s3_catalog`.`default`.`word_count` limit 100;
```

