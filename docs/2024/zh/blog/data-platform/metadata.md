# 元数据



数据资产

数据目录

元数据采集



## 元数据存储

hive metastore



### Flink

```java
public interface Catalog {

    // ------ databases ------
    @Nullable
    String getDefaultDatabase() throws CatalogException;
    List<String> listDatabases() throws CatalogException;
    CatalogDatabase getDatabase(String databaseName) throws DatabaseNotExistException, CatalogException;
    boolean databaseExists(String databaseName) throws CatalogException;
    void createDatabase(String name, CatalogDatabase database, boolean ignoreIfExists) throws DatabaseAlreadyExistException, CatalogException;
    void dropDatabase(String name, boolean ignoreIfNotExists) throws DatabaseNotExistException, DatabaseNotEmptyException, CatalogException;
    void dropDatabase(String name, boolean ignoreIfNotExists, boolean cascade) throws DatabaseNotExistException, DatabaseNotEmptyException, CatalogException;
    void alterDatabase(String name, CatalogDatabase newDatabase, boolean ignoreIfNotExists) throws DatabaseNotExistException, CatalogException;

    // ------ tables and views ------
    List<String> listTables(String databaseName) throws DatabaseNotExistException, CatalogException;
    List<String> listViews(String databaseName) throws DatabaseNotExistException, CatalogException;
    CatalogBaseTable getTable(ObjectPath tablePath) throws TableNotExistException, CatalogException;
    CatalogBaseTable getTable(ObjectPath tablePath, long timestamp) throws TableNotExistException, CatalogException;
    boolean tableExists(ObjectPath tablePath) throws CatalogException;
    void dropTable(ObjectPath tablePath, boolean ignoreIfNotExists) throws TableNotExistException, CatalogException;
    void renameTable(ObjectPath tablePath, String newTableName, boolean ignoreIfNotExists) throws TableNotExistException, TableAlreadyExistException, CatalogException;
    void createTable(ObjectPath tablePath, CatalogBaseTable table, boolean ignoreIfExists) throws TableAlreadyExistException, DatabaseNotExistException, CatalogException;
    void alterTable(ObjectPath tablePath, CatalogBaseTable newTable, boolean ignoreIfNotExists) throws TableNotExistException, CatalogException;
    void alterTable(ObjectPath tablePath, CatalogBaseTable newTable, List<TableChange> tableChanges, boolean ignoreIfNotExists) throws TableNotExistException, CatalogException;

    // ------ partitions ------
    List<CatalogPartitionSpec> listPartitions(ObjectPath tablePath) throws TableNotExistException, TableNotPartitionedException, CatalogException;
    List<CatalogPartitionSpec> listPartitions(ObjectPath tablePath, CatalogPartitionSpec partitionSpec) throws TableNotExistException, TableNotPartitionedException, PartitionSpecInvalidException, CatalogException;
    List<CatalogPartitionSpec> listPartitionsByFilter(ObjectPath tablePath, List<Expression> filters) throws TableNotExistException, TableNotPartitionedException, CatalogException;
    CatalogPartition getPartition(ObjectPath tablePath, CatalogPartitionSpec partitionSpec) throws PartitionNotExistException, CatalogException;
    boolean partitionExists(ObjectPath tablePath, CatalogPartitionSpec partitionSpec) throws CatalogException;
    void createPartition(ObjectPath tablePath, CatalogPartitionSpec partitionSpec, CatalogPartition partition, boolean ignoreIfExists) throws TableNotExistException, TableNotPartitionedException, PartitionSpecInvalidException, PartitionAlreadyExistsException, CatalogException;
    void dropPartition(ObjectPath tablePath, CatalogPartitionSpec partitionSpec, boolean ignoreIfNotExists) throws PartitionNotExistException, CatalogException;
    void alterPartition(ObjectPath tablePath, CatalogPartitionSpec partitionSpec, CatalogPartition newPartition, boolean ignoreIfNotExists) throws PartitionNotExistException, CatalogException;

    // ------ functions ------
    List<String> listFunctions(String dbName) throws DatabaseNotExistException, CatalogException;
    List<String> listProcedures(String dbName) throws DatabaseNotExistException, CatalogException;
    CatalogFunction getFunction(ObjectPath functionPath) throws FunctionNotExistException, CatalogException;
    Procedure getProcedure(ObjectPath procedurePath) throws ProcedureNotExistException, CatalogException;
    boolean functionExists(ObjectPath functionPath) throws CatalogException;
    void createFunction(ObjectPath functionPath, CatalogFunction function, boolean ignoreIfExists) throws FunctionAlreadyExistException, DatabaseNotExistException, CatalogException;
    void alterFunction(ObjectPath functionPath, CatalogFunction newFunction, boolean ignoreIfNotExists) throws FunctionNotExistException, CatalogException;
    void dropFunction(ObjectPath functionPath, boolean ignoreIfNotExists) throws FunctionNotExistException, CatalogException;

    // ------ statistics ------
    CatalogTableStatistics getTableStatistics(ObjectPath tablePath) throws TableNotExistException, CatalogException;
    CatalogColumnStatistics getTableColumnStatistics(ObjectPath tablePath) throws TableNotExistException, CatalogException;
    CatalogTableStatistics getPartitionStatistics(ObjectPath tablePath, CatalogPartitionSpec partitionSpec) throws PartitionNotExistException, CatalogException;
    List<CatalogTableStatistics> bulkGetPartitionStatistics(ObjectPath tablePath, List<CatalogPartitionSpec> partitionSpecs) throws PartitionNotExistException, CatalogException;
    CatalogColumnStatistics getPartitionColumnStatistics(ObjectPath tablePath, CatalogPartitionSpec partitionSpec) throws PartitionNotExistException, CatalogException;
    List<CatalogColumnStatistics> bulkGetPartitionColumnStatistics(ObjectPath tablePath, List<CatalogPartitionSpec> partitionSpecs) throws PartitionNotExistException, CatalogException;
    void alterTableStatistics(ObjectPath tablePath, CatalogTableStatistics tableStatistics, boolean ignoreIfNotExists) throws TableNotExistException, CatalogException;
    void alterTableColumnStatistics(ObjectPath tablePath, CatalogColumnStatistics columnStatistics, boolean ignoreIfNotExists) throws TableNotExistException, CatalogException, TablePartitionedException;
    void alterPartitionStatistics(ObjectPath tablePath, CatalogPartitionSpec partitionSpec, CatalogTableStatistics partitionStatistics, boolean ignoreIfNotExists) throws PartitionNotExistException, CatalogException;
    void alterPartitionColumnStatistics(ObjectPath tablePath, CatalogPartitionSpec partitionSpec, CatalogColumnStatistics columnStatistics, boolean ignoreIfNotExists) throws PartitionNotExistException, CatalogException;
}
```

### SeaTunnel

```java
public interface Catalog extends AutoCloseable {

    String name();

    String getDefaultDatabase() throws CatalogException;
    boolean databaseExists(String databaseName) throws CatalogException;
    List<String> listDatabases() throws CatalogException;
    void createDatabase(TablePath tablePath, boolean ignoreIfExists) throws DatabaseAlreadyExistException, CatalogException;
    void dropDatabase(TablePath tablePath, boolean ignoreIfNotExists) throws DatabaseNotExistException, CatalogException;

    List<String> listTables(String databaseName) throws CatalogException, DatabaseNotExistException;
    boolean tableExists(TablePath tablePath) throws CatalogException;
    CatalogTable getTable(TablePath tablePath) throws CatalogException, TableNotExistException;
    List<CatalogTable> getTables(ReadonlyConfig config) throws CatalogException;
    void createTable(TablePath tablePath, CatalogTable table, boolean ignoreIfExists) throws TableAlreadyExistException, DatabaseNotExistException, CatalogException;
    void dropTable(TablePath tablePath, boolean ignoreIfNotExists) throws TableNotExistException, CatalogException;
    void truncateTable(TablePath tablePath, boolean ignoreIfNotExists) throws TableNotExistException, CatalogException;
}
```

### Paimon

```java
public interface Catalog extends AutoCloseable {

    List<String> listDatabases();
    boolean databaseExists(String databaseName);
    void createDatabase(String name, boolean ignoreIfExists) throws DatabaseAlreadyExistException;
    void createDatabase(String name, boolean ignoreIfExists, Map<String, String> properties) throws DatabaseAlreadyExistException;
    Map<String, String> loadDatabaseProperties(String name) throws DatabaseNotExistException;
    void dropDatabase(String name, boolean ignoreIfNotExists, boolean cascade) throws DatabaseNotExistException, DatabaseNotEmptyException;

    Table getTable(Identifier identifier) throws TableNotExistException;
    List<String> listTables(String databaseName) throws DatabaseNotExistException;
    boolean tableExists(Identifier identifier);
    void dropTable(Identifier identifier, boolean ignoreIfNotExists) throws TableNotExistException;
    void createTable(Identifier identifier, Schema schema, boolean ignoreIfExists) throws TableAlreadyExistException, DatabaseNotExistException;
    void renameTable(Identifier fromTable, Identifier toTable, boolean ignoreIfNotExists) throws TableNotExistException, TableAlreadyExistException;
    void alterTable(Identifier identifier, List<SchemaChange> changes, boolean ignoreIfNotExists) throws TableNotExistException, ColumnAlreadyExistException, ColumnNotExistException;

    void dropPartition(Identifier identifier, Map<String, String> partitions) throws TableNotExistException, PartitionNotExistException;
    void alterTable(Identifier identifier, SchemaChange change, boolean ignoreIfNotExists) throws TableNotExistException, ColumnAlreadyExistException, ColumnNotExistException;
}
```

## 元数据采集

存储系统大致分为如下几类：

* DRMS。关系型数据库
* 消息队列。
* NoSQL。
  * Redis
  * MongoDB
  * Elasticsearch
* 文件系统。
* OLAP。

其中有些存储有 schema，如 DRMS、OLAP，有些存储则是 schemaless，如消息队列、文件系统。

支持 schema 的系统以 JDBC 协议为主，但是也有部分不支持如 MongoDB 和 Elasticsearch。

### Schema

JDBC

### Schemaless

schemaless 存储需要用户自己定义存储数据的 schema，计算引擎 Flink 提供了 format 功能，支持如下格式：

* raw
* csv
* json
* protobuf
* avro
  * confluent avro
* orc
* parquet
* cdc
  * debezium
  * canal
  * maxwell
  * ogg

针对消息队列中数据的 schema，有对应的 schema registry 用于管理消息队列数据 schema 变更：

* [schema-registry](https://github.com/confluentinc/schema-registry)
* [aws glue schema registry](https://docs.aws.amazon.com/glue/latest/dg/schema-registry.html)
* [spring-cloud-schema-registry](https://github.com/spring-cloud/spring-cloud-schema-registry)