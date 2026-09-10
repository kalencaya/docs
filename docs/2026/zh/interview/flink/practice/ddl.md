# DDL

## ODPS

```sql
CREATE TEMPORARY TABLE sink_ods_order_di
(
  id          STRING
  ,order_name STRING
  ,ds         STRING
)
WITH (
  'connector' = 'odps'
  ,'endpoint' = 'http://service.cn-hangzhou.maxcompute.aliyun-inc.com/api'
  ,'project' = 'dataware'
  ,'tableName' = 'ods_order_di'
  ,'accessId' = '${secret_values.odps_accessId}'
  ,'accessKey' = '${secret_values.odps_accessKey}'
  ,'partition' = 'ds'
)
;
```

## Doris

```sql
CREATE TEMPORARY TABLE sink_selectdb_ods_order
(
    id          VARCHAR(255)
    ,order_name STRING
    ,ds         VARCHAR(255)
    ,PRIMARY KEY (id) NOT ENFORCED
)
WITH (
    'connector' = 'doris'
    ,'fenodes' = '${secret_values.doris_fenodes}'
    ,'jdbc-url' = '${secret_values.doris_jdbc_url}'
    ,'username' = '${secret_values.doris_username}'
    ,'password' = '${secret_values.doris_password}'
    ,'table.identifier' = 'ods.ods_order'
    ,'sink.properties.format' = 'json'
    ,'sink.properties.read_json_by_line' = 'true'
    ,'sink.properties.partial_columns' = 'true'
    ,'sink.buffer-flush.max-rows' = '60000'
    ,'sink.buffer-flush.max-bytes' = '30MB'
    ,'sink.buffer-flush.interval' = '5s'
    ,'sink.enable.batch-mode' = 'true'
    ,'sink.max-retries' = '10'
)
;
```

