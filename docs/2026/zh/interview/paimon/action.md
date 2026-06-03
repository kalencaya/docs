# Action

阿里云实时计算已经内置了 Paimon 的 action jar。

## Consumer



```sql

CALL paimon_catalog.sys.reset_consumer('dws.dws_gio_event_filter_attr_log', 'ads_gio_user_sequence999')
;

```



## 参考链接

* [Procedures](https://paimon.apache.org/docs/1.4/flink/procedures/)
