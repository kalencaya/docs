# 元数据



数据资产

数据目录

元数据采集



## 元数据存储

### Hive

```java
public interface IMetaStoreClient {
  
    void createCatalog(Catalog catalog) throws AlreadyExistsException, InvalidObjectException, MetaException, TException;
    void alterCatalog(String catalogName, Catalog newCatalog) throws NoSuchObjectException, InvalidObjectException, MetaException, TException;
    Catalog getCatalog(String catName) throws NoSuchObjectException, MetaException, TException;
    List<String> getCatalogs() throws MetaException, TException;
    void dropCatalog(String catName) throws NoSuchObjectException, InvalidOperationException, MetaException, TException;

    List<String> getAllDatabases() throws MetaException, TException;
    List<String> getAllDatabases(String catName) throws MetaException, TException;
    List<String> getDatabases(String databasePattern) throws MetaException, TException;
    List<String> getDatabases(String catName, String databasePattern) throws MetaException, TException;
    Database getDatabase(String databaseName) throws NoSuchObjectException, MetaException, TException;
    Database getDatabase(String catalogName, String databaseName) throws NoSuchObjectException, MetaException, TException;
    void createDatabase(Database db) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    void dropDatabase(String name) throws NoSuchObjectException, InvalidOperationException, MetaException, TException;
    void dropDatabase(String name, boolean deleteData, boolean ignoreUnknownDb) throws NoSuchObjectException, InvalidOperationException, MetaException, TException;
    void dropDatabase(String name, boolean deleteData, boolean ignoreUnknownDb, boolean cascade) throws NoSuchObjectException, InvalidOperationException, MetaException, TException;
    void dropDatabase(String catName, String dbName, boolean deleteData, boolean ignoreUnknownDb, boolean cascade) throws NoSuchObjectException, InvalidOperationException, MetaException, TException;
    void dropDatabase(String catName, String dbName, boolean deleteData, boolean ignoreUnknownDb) throws NoSuchObjectException, InvalidOperationException, MetaException, TException;
    void dropDatabase(String catName, String dbName) throws NoSuchObjectException, InvalidOperationException, MetaException, TException;
    void alterDatabase(String name, Database db) throws NoSuchObjectException, MetaException, TException;
    void alterDatabase(String catName, String dbName, Database newDb) throws NoSuchObjectException, MetaException, TException;

    List<String> getAllTables(String dbName) throws MetaException, TException, UnknownDBException;
    List<String> getAllTables(String catName, String dbName) throws MetaException, TException, UnknownDBException;
    List<String> getTables(String dbName, String tablePattern) throws MetaException, TException, UnknownDBException;
    List<String> getTables(String catName, String dbName, String tablePattern) throws MetaException, TException, UnknownDBException;
    List<String> getTables(String dbName, String tablePattern, TableType tableType) throws MetaException, TException, UnknownDBException;
    List<String> getTables(String catName, String dbName, String tablePattern, TableType tableType) throws MetaException, TException, UnknownDBException;
    Table getTable(String dbName, String tableName) throws MetaException, TException, NoSuchObjectException;
    Table getTable(String catName, String dbName, String tableName) throws MetaException, TException;
    void insertTable(Table table, boolean overwrite) throws MetaException;
    void createTable(Table tbl) throws AlreadyExistsException, InvalidObjectException, MetaException, NoSuchObjectException, TException;
    void alter_table(String databaseName, String tblName, Table table) throws InvalidOperationException, MetaException, TException;
    void alter_table(String catName, String dbName, String tblName, Table newTable) throws InvalidOperationException, MetaException, TException;
    void alter_table(String catName, String dbName, String tblName, Table newTable, EnvironmentContext envContext) throws InvalidOperationException, MetaException, TException;
    @Deprecated
    void alter_table(String defaultDatabaseName, String tblName, Table table, boolean cascade) throws InvalidOperationException, MetaException, TException;
    void alter_table_with_environmentContext(String databaseName, String tblName, Table table, EnvironmentContext environmentContext) throws InvalidOperationException, MetaException, TException;
    void dropTable(String dbname, String tableName, boolean deleteData, boolean ignoreUnknownTab) throws MetaException, TException, NoSuchObjectException;
    void dropTable(String dbname, String tableName, boolean deleteData, boolean ignoreUnknownTab, boolean ifPurge) throws MetaException, TException, NoSuchObjectException;
    void dropTable(String dbname, String tableName) throws MetaException, TException, NoSuchObjectException;
    void dropTable(String catName, String dbName, String tableName, boolean deleteData, boolean ignoreUnknownTable, boolean ifPurge) throws MetaException, NoSuchObjectException, TException;
    void dropTable(String catName, String dbName, String tableName, boolean deleteData, boolean ignoreUnknownTable) throws MetaException, NoSuchObjectException, TException;
    void dropTable(String catName, String dbName, String tableName) throws MetaException, NoSuchObjectException, TException;
    void truncateTable(String dbName, String tableName, List<String> partNames) throws MetaException, TException;
    void truncateTable(String catName, String dbName, String tableName, List<String> partNames) throws MetaException, TException;
    boolean tableExists(String databaseName, String tableName) throws MetaException, TException, UnknownDBException;
    boolean tableExists(String catName, String dbName, String tableName) throws MetaException, TException, UnknownDBException;

    void updateCreationMetadata(String dbName, String tableName, CreationMetadata cm) throws MetaException, TException;
    void updateCreationMetadata(String catName, String dbName, String tableName, CreationMetadata cm) throws MetaException, TException;

    List<Partition> listPartitions(String db_name, String tbl_name, short max_parts) throws NoSuchObjectException, MetaException, TException;
    List<Partition> listPartitions(String catName, String db_name, String tbl_name, int max_parts) throws NoSuchObjectException, MetaException, TException;
    List<Partition> listPartitions(String db_name, String tbl_name, List<String> part_vals, short max_parts) throws NoSuchObjectException, MetaException, TException;
    List<Partition> listPartitions(String catName, String db_name, String tbl_name, List<String> part_vals, int max_parts) throws NoSuchObjectException, MetaException, TException;
    List<String> listPartitionNames(String db_name, String tbl_name, short max_parts) throws NoSuchObjectException, MetaException, TException;
    List<String> listPartitionNames(String catName, String db_name, String tbl_name, int max_parts) throws NoSuchObjectException, MetaException, TException;
    List<String> listPartitionNames(String db_name, String tbl_name, List<String> part_vals, short max_parts) throws MetaException, TException, NoSuchObjectException;
    List<String> listPartitionNames(String catName, String db_name, String tbl_name, List<String> part_vals, int max_parts) throws MetaException, TException, NoSuchObjectException;

    Partition appendPartition(String dbName, String tableName, List<String> partVals) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    Partition appendPartition(String catName, String dbName, String tableName, List<String> partVals) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    Partition appendPartition(String dbName, String tableName, String name) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    Partition appendPartition(String catName, String dbName, String tableName, String name) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    Partition add_partition(Partition partition) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    int add_partitions(List<Partition> partitions) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    List<Partition> add_partitions(List<Partition> partitions, boolean ifNotExists, boolean needResults) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    Partition getPartition(String dbName, String tblName, List<String> partVals) throws NoSuchObjectException, MetaException, TException;
    Partition getPartition(String catName, String dbName, String tblName, List<String> partVals) throws NoSuchObjectException, MetaException, TException;
    Partition getPartition(String dbName, String tblName, String name) throws MetaException, UnknownTableException, NoSuchObjectException, TException;
    Partition getPartition(String catName, String dbName, String tblName, String name) throws MetaException, UnknownTableException, NoSuchObjectException, TException;
    Partition exchange_partition(Map<String, String> partitionSpecs, String sourceDb, String sourceTable, String destdb, String destTableName) throws MetaException, NoSuchObjectException, InvalidObjectException, TException;
    Partition exchange_partition(Map<String, String> partitionSpecs, String sourceCat, String sourceDb, String sourceTable, String destCat, String destdb, String destTableName) throws MetaException, NoSuchObjectException, InvalidObjectException, TException;
    List<Partition> exchange_partitions(Map<String, String> partitionSpecs, String sourceDb, String sourceTable, String destdb, String destTableName) throws MetaException, NoSuchObjectException, InvalidObjectException, TException;
    List<Partition> exchange_partitions(Map<String, String> partitionSpecs, String sourceCat, String sourceDb, String sourceTable, String destCat, String destdb, String destTableName) throws MetaException, NoSuchObjectException, InvalidObjectException, TException;

    List<Partition> listPartitionsByFilter(String db_name, String tbl_name, String filter, short max_parts) throws MetaException, NoSuchObjectException, TException;
    List<Partition> listPartitionsByFilter(String catName, String db_name, String tbl_name, String filter, int max_parts) throws MetaException, NoSuchObjectException, TException;
    boolean listPartitionsByExpr(String db_name, String tbl_name, byte[] expr, String default_partition_name, short max_parts, List<Partition> result) throws TException;
    boolean listPartitionsByExpr(String catName, String db_name, String tbl_name, byte[] expr, String default_partition_name, int max_parts, List<Partition> result) throws TException;

    List<Partition> listPartitionsWithAuthInfo(String dbName, String tableName, short maxParts, String userName, List<String> groupNames) throws MetaException, TException, NoSuchObjectException;
    List<Partition> listPartitionsWithAuthInfo(String catName, String dbName, String tableName, int maxParts, String userName, List<String> groupNames) throws MetaException, TException, NoSuchObjectException;
    List<Partition> listPartitionsWithAuthInfo(String dbName, String tableName, List<String> partialPvals, short maxParts, String userName, List<String> groupNames) throws MetaException, TException, NoSuchObjectException;
    List<Partition> listPartitionsWithAuthInfo(String catName, String dbName, String tableName, List<String> partialPvals, int maxParts, String userName, List<String> groupNames) throws MetaException, TException, NoSuchObjectException;
    Partition getPartitionWithAuthInfo(String dbName, String tableName, List<String> pvals, String userName, List<String> groupNames) throws MetaException, UnknownTableException, NoSuchObjectException, TException;
    Partition getPartitionWithAuthInfo(String catName, String dbName, String tableName, List<String> pvals, String userName, List<String> groupNames) throws MetaException, UnknownTableException, NoSuchObjectException, TException;

    int getNumPartitionsByFilter(String dbName, String tableName, String filter) throws MetaException, NoSuchObjectException, TException;
    int getNumPartitionsByFilter(String catName, String dbName, String tableName, String filter) throws MetaException, NoSuchObjectException, TException;
    List<Partition> getPartitionsByNames(String db_name, String tbl_name, List<String> part_names) throws NoSuchObjectException, MetaException, TException;
    List<Partition> getPartitionsByNames(String catName, String db_name, String tbl_name, List<String> part_names) throws NoSuchObjectException, MetaException, TException;
    void validatePartitionNameCharacters(List<String> partVals) throws TException, MetaException;

    PartitionSpecProxy listPartitionSpecs(String dbName, String tableName, int maxParts) throws TException;
    PartitionSpecProxy listPartitionSpecs(String catName, String dbName, String tableName, int maxParts) throws TException;
    PartitionSpecProxy listPartitionSpecsByFilter(String db_name, String tbl_name, String filter, int max_parts) throws MetaException, NoSuchObjectException, TException;
    PartitionSpecProxy listPartitionSpecsByFilter(String catName, String db_name, String tbl_name, String filter, int max_parts) throws MetaException, NoSuchObjectException, TException;
    int add_partitions_pspec(PartitionSpecProxy partitionSpec) throws InvalidObjectException, AlreadyExistsException, MetaException, TException;
    PartitionValuesResponse listPartitionValues(PartitionValuesRequest request) throws MetaException, TException, NoSuchObjectException;

    boolean dropPartition(String db_name, String tbl_name, List<String> part_vals, boolean deleteData) throws NoSuchObjectException, MetaException, TException;
    boolean dropPartition(String catName, String db_name, String tbl_name, List<String> part_vals, boolean deleteData) throws NoSuchObjectException, MetaException, TException;
    boolean dropPartition(String db_name, String tbl_name, List<String> part_vals, PartitionDropOptions options) throws NoSuchObjectException, MetaException, TException;
    boolean dropPartition(String catName, String db_name, String tbl_name, List<String> part_vals, PartitionDropOptions options) throws NoSuchObjectException, MetaException, TException;
    boolean dropPartition(String db_name, String tbl_name, String name, boolean deleteData) throws NoSuchObjectException, MetaException, TException;
    boolean dropPartition(String catName, String db_name, String tbl_name, String name, boolean deleteData) throws NoSuchObjectException, MetaException, TException;
    List<Partition> dropPartitions(String dbName, String tblName, List<ObjectPair<Integer, byte[]>> partExprs, boolean deleteData, boolean ifExists) throws NoSuchObjectException, MetaException, TException;
    List<Partition> dropPartitions(String catName, String dbName, String tblName, List<ObjectPair<Integer, byte[]>> partExprs, boolean deleteData, boolean ifExists) throws NoSuchObjectException, MetaException, TException;
    @Deprecated
    List<Partition> dropPartitions(String dbName, String tblName, List<ObjectPair<Integer, byte[]>> partExprs, boolean deleteData, boolean ifExists, boolean needResults) throws NoSuchObjectException, MetaException, TException;
    List<Partition> dropPartitions(String catName, String dbName, String tblName, List<ObjectPair<Integer, byte[]>> partExprs, boolean deleteData, boolean ifExists, boolean needResults) throws NoSuchObjectException, MetaException, TException;
    List<Partition> dropPartitions(String dbName, String tblName, List<ObjectPair<Integer, byte[]>> partExprs, PartitionDropOptions options) throws NoSuchObjectException, MetaException, TException;
    List<Partition> dropPartitions(String catName, String dbName, String tblName, List<ObjectPair<Integer, byte[]>> partExprs, PartitionDropOptions options) throws NoSuchObjectException, MetaException, TException;
    void alter_partition(String dbName, String tblName, Partition newPart) throws InvalidOperationException, MetaException, TException;
    void alter_partition(String catName, String dbName, String tblName, Partition newPart) throws InvalidOperationException, MetaException, TException;
    void alter_partition(String dbName, String tblName, Partition newPart, EnvironmentContext environmentContext) throws InvalidOperationException, MetaException, TException;
    void alter_partition(String catName, String dbName, String tblName, Partition newPart, EnvironmentContext environmentContext) throws InvalidOperationException, MetaException, TException;
    void alter_partitions(String dbName, String tblName, List<Partition> newParts) throws InvalidOperationException, MetaException, TException;
    void alter_partitions(String dbName, String tblName, List<Partition> newParts, EnvironmentContext environmentContext) throws InvalidOperationException, MetaException, TException;
    void alter_partitions(String catName, String dbName, String tblName, List<Partition> newParts) throws InvalidOperationException, MetaException, TException;
    void alter_partitions(String catName, String dbName, String tblName, List<Partition> newParts, EnvironmentContext environmentContext) throws InvalidOperationException, MetaException, TException;
    void renamePartition(final String dbname, final String tableName, final List<String> part_vals, final Partition newPart) throws InvalidOperationException, MetaException, TException;
    void renamePartition(String catName, String dbname, String tableName, List<String> part_vals, Partition newPart) throws InvalidOperationException, MetaException, TException;

    void markPartitionForEvent(String db_name, String tbl_name, Map<String, String> partKVs, PartitionEventType eventType) throws MetaException, NoSuchObjectException, TException, UnknownTableException, UnknownDBException, UnknownPartitionException, InvalidPartitionException;
    void markPartitionForEvent(String catName, String db_name, String tbl_name, Map<String, String> partKVs, PartitionEventType eventType) throws MetaException, NoSuchObjectException, TException, UnknownTableException, UnknownDBException, UnknownPartitionException, InvalidPartitionException;
    boolean isPartitionMarkedForEvent(String db_name, String tbl_name, Map<String, String> partKVs, PartitionEventType eventType) throws MetaException, NoSuchObjectException, TException, UnknownTableException, UnknownDBException, UnknownPartitionException, InvalidPartitionException;
    boolean isPartitionMarkedForEvent(String catName, String db_name, String tbl_name, Map<String, String> partKVs, PartitionEventType eventType) throws MetaException, NoSuchObjectException, TException, UnknownTableException, UnknownDBException, UnknownPartitionException, InvalidPartitionException;
    
    List<FieldSchema> getFields(String db, String tableName) throws MetaException, TException, UnknownTableException, UnknownDBException;
    List<FieldSchema> getFields(String catName, String db, String tableName) throws MetaException, TException, UnknownTableException, UnknownDBException;

    List<FieldSchema> getSchema(String db, String tableName) throws MetaException, TException, UnknownTableException, UnknownDBException;
    List<FieldSchema> getSchema(String catName, String db, String tableName) throws MetaException, TException, UnknownTableException, UnknownDBException;

    String getConfigValue(String name, String defaultValue) throws TException, ConfigValSecurityException;

    List<String> partitionNameToVals(String name) throws MetaException, TException;
    Map<String, String> partitionNameToSpec(String name) throws MetaException, TException;

    boolean updateTableColumnStatistics(ColumnStatistics statsObj) throws NoSuchObjectException, InvalidObjectException, MetaException, TException, InvalidInputException;
    boolean updatePartitionColumnStatistics(ColumnStatistics statsObj) throws NoSuchObjectException, InvalidObjectException, MetaException, TException, InvalidInputException;
    List<ColumnStatisticsObj> getTableColumnStatistics(String dbName, String tableName, List<String> colNames) throws NoSuchObjectException, MetaException, TException;
    List<ColumnStatisticsObj> getTableColumnStatistics(String catName, String dbName, String tableName, List<String> colNames) throws NoSuchObjectException, MetaException, TException;
    Map<String, List<ColumnStatisticsObj>> getPartitionColumnStatistics(String dbName, String tableName, List<String> partNames, List<String> colNames) throws NoSuchObjectException, MetaException, TException;
    Map<String, List<ColumnStatisticsObj>> getPartitionColumnStatistics(String catName, String dbName, String tableName, List<String> partNames, List<String> colNames) throws NoSuchObjectException, MetaException, TException;
    boolean deletePartitionColumnStatistics(String dbName, String tableName, String partName, String colName) throws NoSuchObjectException, MetaException, InvalidObjectException, TException, InvalidInputException;
    boolean deletePartitionColumnStatistics(String catName, String dbName, String tableName, String partName, String colName) throws NoSuchObjectException, MetaException, InvalidObjectException, TException, InvalidInputException;
    boolean deleteTableColumnStatistics(String dbName, String tableName, String colName) throws NoSuchObjectException, MetaException, InvalidObjectException, TException, InvalidInputException;
    boolean deleteTableColumnStatistics(String catName, String dbName, String tableName, String colName) throws NoSuchObjectException, MetaException, InvalidObjectException, TException, InvalidInputException;

    AggrStats getAggrColStatsFor(String dbName, String tblName, List<String> colNames, List<String> partName) throws NoSuchObjectException, MetaException, TException;
    AggrStats getAggrColStatsFor(String catName, String dbName, String tblName, List<String> colNames, List<String> partNames) throws NoSuchObjectException, MetaException, TException;

    boolean create_role(Role role) throws MetaException, TException;
    boolean drop_role(String role_name) throws MetaException, TException;
    List<String> listRoleNames() throws MetaException, TException;
    boolean grant_role(String role_name, String user_name, PrincipalType principalType, String grantor, PrincipalType grantorType, boolean grantOption) throws MetaException, TException;
    boolean revoke_role(String role_name, String user_name, PrincipalType principalType, boolean grantOption) throws MetaException, TException;
    List<Role> list_roles(String principalName, PrincipalType principalType) throws MetaException, TException;

    PrincipalPrivilegeSet get_privilege_set(HiveObjectRef hiveObject, String user_name, List<String> group_names) throws MetaException, TException;
    List<HiveObjectPrivilege> list_privileges(String principal_name, PrincipalType principal_type, HiveObjectRef hiveObject) throws MetaException, TException;
    boolean grant_privileges(PrivilegeBag privileges) throws MetaException, TException;
    boolean revoke_privileges(PrivilegeBag privileges, boolean grantOption) throws MetaException, TException;
    boolean refresh_privileges(HiveObjectRef objToRefresh, String authorizer, PrivilegeBag grantPrivileges) throws MetaException, TException;

    GetPrincipalsInRoleResponse get_principals_in_role(GetPrincipalsInRoleRequest getPrincRoleReq) throws MetaException, TException;
    GetRoleGrantsForPrincipalResponse get_role_grants_for_principal(GetRoleGrantsForPrincipalRequest getRolePrincReq) throws MetaException, TException;

    String getDelegationToken(String owner, String renewerKerberosPrincipalName) throws MetaException, TException;
    long renewDelegationToken(String tokenStrForm) throws MetaException, TException;
    void cancelDelegationToken(String tokenStrForm) throws MetaException, TException;

    String getTokenStrForm() throws IOException;
    boolean addToken(String tokenIdentifier, String delegationToken) throws TException;
    boolean removeToken(String tokenIdentifier) throws TException;
    String getToken(String tokenIdentifier) throws TException;
    List<String> getAllTokenIdentifiers() throws TException;

    int addMasterKey(String key) throws MetaException, TException;
    void updateMasterKey(Integer seqNo, String key) throws NoSuchObjectException, MetaException, TException;
    boolean removeMasterKey(Integer keySeq) throws TException;
    String[] getMasterKeys() throws TException;

    void createFunction(Function func) throws InvalidObjectException, MetaException, TException;
    void alterFunction(String dbName, String funcName, Function newFunction) throws InvalidObjectException, MetaException, TException;
    void alterFunction(String catName, String dbName, String funcName, Function newFunction) throws InvalidObjectException, MetaException, TException;
    void dropFunction(String dbName, String funcName) throws MetaException, NoSuchObjectException, InvalidObjectException, InvalidInputException, TException;
    void dropFunction(String catName, String dbName, String funcName) throws MetaException, NoSuchObjectException, InvalidObjectException, InvalidInputException, TException;

    Function getFunction(String dbName, String funcName) throws MetaException, TException;
    Function getFunction(String catName, String dbName, String funcName) throws MetaException, TException;
    List<String> getFunctions(String dbName, String pattern) throws MetaException, TException;
    List<String> getFunctions(String catName, String dbName, String pattern) throws MetaException, TException;
    GetAllFunctionsResponse getAllFunctions() throws MetaException, TException;

    GetOpenTxnsInfoResponse showTxns() throws TException;
    ValidTxnList getValidTxns() throws TException;
    ValidTxnList getValidTxns(long currentTxn) throws TException;
    long openTxn(String user) throws TException;
    List<Long> replOpenTxn(String replPolicy, List<Long> srcTxnIds, String user) throws TException;
    OpenTxnsResponse openTxns(String user, int numTxns) throws TException;
    void rollbackTxn(long txnid) throws NoSuchTxnException, TException;
    void replRollbackTxn(long srcTxnid, String replPolicy) throws NoSuchTxnException, TException;
    void commitTxn(long txnid) throws NoSuchTxnException, TxnAbortedException, TException;
    void replCommitTxn(long srcTxnid, String replPolicy) throws NoSuchTxnException, TxnAbortedException, TException;
    void abortTxns(List<Long> txnids) throws TException;

    ValidWriteIdList getValidWriteIds(String fullTableName) throws TException;
    List<TableValidWriteIds> getValidWriteIds(List<String> tablesList, String validTxnList) throws TException;
    long allocateTableWriteId(long txnId, String dbName, String tableName) throws TException;
    void replTableWriteIdState(String validWriteIdList, String dbName, String tableName, List<String> partNames) throws TException;
    List<TxnToWriteId> allocateTableWriteIdsBatch(List<Long> txnIds, String dbName, String tableName) throws TException;
    List<TxnToWriteId> replAllocateTableWriteIdsBatch(String dbName, String tableName, String replPolicy, List<TxnToWriteId> srcTxnToWriteIdList) throws TException;

    LockResponse lock(LockRequest request) throws NoSuchTxnException, TxnAbortedException, TException;
    LockResponse checkLock(long lockid) throws NoSuchTxnException, TxnAbortedException, NoSuchLockException, TException;
    void unlock(long lockid) throws NoSuchLockException, TxnOpenException, TException;
    @Deprecated
    ShowLocksResponse showLocks() throws TException;
    ShowLocksResponse showLocks(ShowLocksRequest showLocksRequest) throws TException;

    void heartbeat(long txnid, long lockid) throws NoSuchLockException, NoSuchTxnException, TxnAbortedException, TException;
    HeartbeatTxnRangeResponse heartbeatTxnRange(long min, long max) throws TException;

    @Deprecated
    void compact(String dbname, String tableName, String partitionName, CompactionType type) throws TException;
    @Deprecated
    void compact(String dbname, String tableName, String partitionName, CompactionType type, Map<String, String> tblproperties) throws TException;
    CompactionResponse compact2(String dbname, String tableName, String partitionName, CompactionType type, Map<String, String> tblproperties) throws TException;
    ShowCompactResponse showCompactions() throws TException;

    void addDynamicPartitions(long txnId, long writeId, String dbName, String tableName, List<String> partNames) throws TException;
    void addDynamicPartitions(long txnId, long writeId, String dbName, String tableName, List<String> partNames, DataOperationType operationType) throws TException;

    NotificationEventResponse getNextNotification(long lastEventId, int maxEvents, NotificationFilter filter) throws TException;
    CurrentNotificationEventId getCurrentNotificationEventId() throws TException;
    NotificationEventsCountResponse getNotificationEventsCount(NotificationEventsCountRequest rqst) throws TException;
    FireEventResponse fireListenerEvent(FireEventRequest request) throws TException;

    boolean setPartitionColumnStatistics(SetPartitionsStatsRequest request) throws NoSuchObjectException, InvalidObjectException, MetaException, TException, InvalidInputException;

    void flushCache();

    Iterable<Entry<Long, ByteBuffer>> getFileMetadata(List<Long> fileIds) throws TException;
    Iterable<Entry<Long, MetadataPpdResult>> getFileMetadataBySarg(List<Long> fileIds, ByteBuffer sarg, boolean doGetFooters) throws TException;
    void clearFileMetadata(List<Long> fileIds) throws TException;
    void putFileMetadata(List<Long> fileIds, List<ByteBuffer> metadata) throws TException;

    boolean isSameConfObj(Configuration c);

    boolean cacheFileMetadata(String dbName, String tableName, String partName, boolean allParts) throws TException;

    List<SQLPrimaryKey> getPrimaryKeys(PrimaryKeysRequest request) throws MetaException, NoSuchObjectException, TException;
    List<SQLForeignKey> getForeignKeys(ForeignKeysRequest request) throws MetaException, NoSuchObjectException, TException;
    List<SQLUniqueConstraint> getUniqueConstraints(UniqueConstraintsRequest request) throws MetaException, NoSuchObjectException, TException;
    List<SQLNotNullConstraint> getNotNullConstraints(NotNullConstraintsRequest request) throws MetaException, NoSuchObjectException, TException;
    List<SQLDefaultConstraint> getDefaultConstraints(DefaultConstraintsRequest request) throws MetaException, NoSuchObjectException, TException;
    List<SQLCheckConstraint> getCheckConstraints(CheckConstraintsRequest request) throws MetaException, NoSuchObjectException, TException;
    void createTableWithConstraints(org.apache.hadoop.hive.metastore.api.Table tTbl, List<SQLPrimaryKey> primaryKeys, List<SQLForeignKey> foreignKeys, List<SQLUniqueConstraint> uniqueConstraints, List<SQLNotNullConstraint> notNullConstraints, List<SQLDefaultConstraint> defaultConstraints, List<SQLCheckConstraint> checkConstraints) throws AlreadyExistsException, InvalidObjectException, MetaException, NoSuchObjectException, TException;
    void dropConstraint(String dbName, String tableName, String constraintName) throws MetaException, NoSuchObjectException, TException;
    void dropConstraint(String catName, String dbName, String tableName, String constraintName) throws MetaException, NoSuchObjectException, TException;
    void addPrimaryKey(List<SQLPrimaryKey> primaryKeyCols) throws MetaException, NoSuchObjectException, TException;
    void addForeignKey(List<SQLForeignKey> foreignKeyCols) throws MetaException, NoSuchObjectException, TException;
    void addUniqueConstraint(List<SQLUniqueConstraint> uniqueConstraintCols) throws MetaException, NoSuchObjectException, TException;
    void addNotNullConstraint(List<SQLNotNullConstraint> notNullConstraintCols) throws MetaException, NoSuchObjectException, TException;
    void addDefaultConstraint(List<SQLDefaultConstraint> defaultConstraints) throws MetaException, NoSuchObjectException, TException;
    void addCheckConstraint(List<SQLCheckConstraint> checkConstraints) throws MetaException, NoSuchObjectException, TException;

    String getMetastoreDbUuid() throws MetaException, TException;

    void createResourcePlan(WMResourcePlan resourcePlan, String copyFromName) throws InvalidObjectException, MetaException, TException;
    WMFullResourcePlan getResourcePlan(String resourcePlanName) throws NoSuchObjectException, MetaException, TException;
    List<WMResourcePlan> getAllResourcePlans() throws NoSuchObjectException, MetaException, TException;
    void dropResourcePlan(String resourcePlanName) throws NoSuchObjectException, MetaException, TException;
    WMFullResourcePlan alterResourcePlan(String resourcePlanName, WMNullableResourcePlan resourcePlan, boolean canActivateDisabled, boolean isForceDeactivate, boolean isReplace) throws NoSuchObjectException, InvalidObjectException, MetaException, TException;
    WMFullResourcePlan getActiveResourcePlan() throws MetaException, TException;
    WMValidateResourcePlanResponse validateResourcePlan(String resourcePlanName) throws NoSuchObjectException, InvalidObjectException, MetaException, TException;

    void createWMTrigger(WMTrigger trigger) throws InvalidObjectException, MetaException, TException;
    void alterWMTrigger(WMTrigger trigger) throws NoSuchObjectException, InvalidObjectException, MetaException, TException;
    void dropWMTrigger(String resourcePlanName, String triggerName) throws NoSuchObjectException, MetaException, TException;
    List<WMTrigger> getTriggersForResourcePlan(String resourcePlan) throws NoSuchObjectException, MetaException, TException;

    void createWMPool(WMPool pool) throws NoSuchObjectException, InvalidObjectException, MetaException, TException;
    void alterWMPool(WMNullablePool pool, String poolPath) throws NoSuchObjectException, InvalidObjectException, TException;
    void dropWMPool(String resourcePlanName, String poolPath) throws TException;

    void createOrUpdateWMMapping(WMMapping mapping, boolean isUpdate) throws TException;
    void dropWMMapping(WMMapping mapping) throws TException;
    void createOrDropTriggerToPoolMapping(String resourcePlanName, String triggerName, String poolPath, boolean shouldDrop) throws AlreadyExistsException, NoSuchObjectException, InvalidObjectException, MetaException, TException;

    void createISchema(ISchema schema) throws TException;
    void alterISchema(String catName, String dbName, String schemaName, ISchema newSchema) throws TException;
    ISchema getISchema(String catName, String dbName, String name) throws TException;
    void dropISchema(String catName, String dbName, String name) throws TException;

    void addSchemaVersion(SchemaVersion schemaVersion) throws TException;
    SchemaVersion getSchemaVersion(String catName, String dbName, String schemaName, int version) throws TException;
    SchemaVersion getSchemaLatestVersion(String catName, String dbName, String schemaName) throws TException;
    List<SchemaVersion> getSchemaAllVersions(String catName, String dbName, String schemaName) throws TException;
    void dropSchemaVersion(String catName, String dbName, String schemaName, int version) throws TException;

    FindSchemasByColsResp getSchemaByCols(FindSchemasByColsRqst rqst) throws TException;

    void mapSchemaVersionToSerde(String catName, String dbName, String schemaName, int version, String serdeName) throws TException;
    void setSchemaVersionState(String catName, String dbName, String schemaName, int version, SchemaVersionState state) throws TException;

    void addSerDe(SerDeInfo serDeInfo) throws TException;
    SerDeInfo getSerDe(String serDeName) throws TException;

    void addRuntimeStat(RuntimeStat stat) throws TException;
    List<RuntimeStat> getRuntimeStats(int maxWeight, int maxCreateTime) throws TException;

}
```

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