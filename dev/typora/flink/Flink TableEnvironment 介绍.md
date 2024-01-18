# Flink TableEnvironment 介绍

`TableEnvironment` 是用来创建 Table & SQL 程序的上下文执行环境，也是 Table & SQL 程序的入口，Table & SQL 程序的所有功能都是围绕 `TableEnvironment` 这个核心类展开的。

`TableEnvironment` 的主要职能包括：

* 对接外部系统
* 表及元数据的注册和检索
* 执行SQL语句
* 提供更详细的配置选项

`TableEnvironment` 实现类 `TableEnvironmentImpl` 构造过程：

```java
@Internal
public class TableEnvironmentImpl implements TableEnvironmentInternal {

    public static TableEnvironmentImpl create(Configuration configuration) {
        return create(EnvironmentSettings.newInstance().withConfiguration(configuration).build());
    }

    public static TableEnvironmentImpl create(EnvironmentSettings settings) {
        final MutableURLClassLoader userClassLoader =
                FlinkUserCodeClassLoaders.create(
                        new URL[0], settings.getUserClassLoader(), settings.getConfiguration());

        final ExecutorFactory executorFactory =
                FactoryUtil.discoverFactory(
                        userClassLoader, ExecutorFactory.class, ExecutorFactory.DEFAULT_IDENTIFIER);
        final Executor executor = executorFactory.create(settings.getConfiguration());

        final CatalogStoreFactory catalogStoreFactory =
                TableFactoryUtil.findAndCreateCatalogStoreFactory(
                        settings.getConfiguration(), userClassLoader);
        final CatalogStoreFactory.Context context =
                TableFactoryUtil.buildCatalogStoreFactoryContext(
                        settings.getConfiguration(), userClassLoader);
        catalogStoreFactory.open(context);
        final CatalogStore catalogStore =
                settings.getCatalogStore() != null
                        ? settings.getCatalogStore()
                        : catalogStoreFactory.createCatalogStore();

        // use configuration to init table config
        final TableConfig tableConfig = TableConfig.getDefault();
        tableConfig.setRootConfiguration(executor.getConfiguration());
        tableConfig.addConfiguration(settings.getConfiguration());

        final ResourceManager resourceManager =
                new ResourceManager(settings.getConfiguration(), userClassLoader);
        final ModuleManager moduleManager = new ModuleManager();
        final CatalogManager catalogManager =
                CatalogManager.newBuilder()
                        .classLoader(userClassLoader)
                        .config(tableConfig)
                        .defaultCatalog(
                                settings.getBuiltInCatalogName(),
                                new GenericInMemoryCatalog(
                                        settings.getBuiltInCatalogName(),
                                        settings.getBuiltInDatabaseName()))
                        .catalogModificationListeners(
                                TableFactoryUtil.findCatalogModificationListenerList(
                                        settings.getConfiguration(), userClassLoader))
                        .catalogStoreHolder(
                                CatalogStoreHolder.newBuilder()
                                        .catalogStore(catalogStore)
                                        .factory(catalogStoreFactory)
                                        .config(tableConfig)
                                        .classloader(userClassLoader)
                                        .build())
                        .build();

        final FunctionCatalog functionCatalog =
                new FunctionCatalog(tableConfig, resourceManager, catalogManager, moduleManager);

        final Planner planner =
                PlannerFactoryUtil.createPlanner(
                        executor,
                        tableConfig,
                        userClassLoader,
                        moduleManager,
                        catalogManager,
                        functionCatalog);

        return new TableEnvironmentImpl(
                catalogManager,
                moduleManager,
                resourceManager,
                tableConfig,
                executor,
                functionCatalog,
                planner,
                settings.isStreamingMode());
    }
}
```

`StreamTableEnvironment` 构造过程。与 `TableEnvironmentImpl` 区别是 `Executor` 的构造，`StreamTableEnvironment` 使用的是 `org.apache.flink.table.delegation.StreamExecutorFactory#create(StreamExecutionEnvironment)`，`TableEnvironmentImpl` 使用的是 `org.apache.flink.table.delegation.ExecutorFactory#create(Configuration)`。

```java
@Internal
public abstract class AbstractStreamTableEnvironmentImpl extends TableEnvironmentImpl {

    protected final StreamExecutionEnvironment executionEnvironment;

    public AbstractStreamTableEnvironmentImpl(
            CatalogManager catalogManager,
            ModuleManager moduleManager,
            ResourceManager resourceManager,
            TableConfig tableConfig,
            Executor executor,
            FunctionCatalog functionCatalog,
            Planner planner,
            boolean isStreamingMode,
            StreamExecutionEnvironment executionEnvironment) {
        super(
                catalogManager,
                moduleManager,
                resourceManager,
                tableConfig,
                executor,
                functionCatalog,
                planner,
                isStreamingMode);
        this.executionEnvironment = executionEnvironment;
    }

    public static Executor lookupExecutor(
            ClassLoader classLoader, StreamExecutionEnvironment executionEnvironment) {
        final ExecutorFactory executorFactory;
        try {
            executorFactory =
                    FactoryUtil.discoverFactory(
                            classLoader, ExecutorFactory.class, ExecutorFactory.DEFAULT_IDENTIFIER);
        } catch (Exception e) {
            throw new TableException(
                    "Could not instantiate the executor. Make sure a planner module is on the classpath",
                    e);
        }
        if (executorFactory instanceof StreamExecutorFactory) {
            return ((StreamExecutorFactory) executorFactory).create(executionEnvironment);
        } else {
            throw new TableException(
                    "The resolved ExecutorFactory '"
                            + executorFactory.getClass()
                            + "' doesn't implement StreamExecutorFactory.");
        }
    }
}

@Internal
public final class StreamTableEnvironmentImpl extends AbstractStreamTableEnvironmentImpl
        implements StreamTableEnvironment {

    public StreamTableEnvironmentImpl(
            CatalogManager catalogManager,
            ModuleManager moduleManager,
            ResourceManager resourceManager,
            FunctionCatalog functionCatalog,
            TableConfig tableConfig,
            StreamExecutionEnvironment executionEnvironment,
            Planner planner,
            Executor executor,
            boolean isStreamingMode) {
        super(
                catalogManager,
                moduleManager,
                resourceManager,
                tableConfig,
                executor,
                functionCatalog,
                planner,
                isStreamingMode,
                executionEnvironment);
    }

    public static StreamTableEnvironment create(
            StreamExecutionEnvironment executionEnvironment, EnvironmentSettings settings) {
        final MutableURLClassLoader userClassLoader =
                FlinkUserCodeClassLoaders.create(
                        new URL[0], settings.getUserClassLoader(), settings.getConfiguration());
        final Executor executor = lookupExecutor(userClassLoader, executionEnvironment);

        final TableConfig tableConfig = TableConfig.getDefault();
        tableConfig.setRootConfiguration(executor.getConfiguration());
        tableConfig.addConfiguration(settings.getConfiguration());

        final ResourceManager resourceManager =
                new ResourceManager(settings.getConfiguration(), userClassLoader);
        final ModuleManager moduleManager = new ModuleManager();

        final CatalogStoreFactory catalogStoreFactory =
                TableFactoryUtil.findAndCreateCatalogStoreFactory(
                        settings.getConfiguration(), userClassLoader);
        final CatalogStoreFactory.Context catalogStoreFactoryContext =
                TableFactoryUtil.buildCatalogStoreFactoryContext(
                        settings.getConfiguration(), userClassLoader);
        catalogStoreFactory.open(catalogStoreFactoryContext);
        final CatalogStore catalogStore =
                settings.getCatalogStore() != null
                        ? settings.getCatalogStore()
                        : catalogStoreFactory.createCatalogStore();

        final CatalogManager catalogManager =
                CatalogManager.newBuilder()
                        .classLoader(userClassLoader)
                        .config(tableConfig)
                        .defaultCatalog(
                                settings.getBuiltInCatalogName(),
                                new GenericInMemoryCatalog(
                                        settings.getBuiltInCatalogName(),
                                        settings.getBuiltInDatabaseName()))
                        .executionConfig(executionEnvironment.getConfig())
                        .catalogModificationListeners(
                                TableFactoryUtil.findCatalogModificationListenerList(
                                        settings.getConfiguration(), userClassLoader))
                        .catalogStoreHolder(
                                CatalogStoreHolder.newBuilder()
                                        .classloader(userClassLoader)
                                        .config(tableConfig)
                                        .catalogStore(catalogStore)
                                        .factory(catalogStoreFactory)
                                        .build())
                        .build();

        final FunctionCatalog functionCatalog =
                new FunctionCatalog(tableConfig, resourceManager, catalogManager, moduleManager);

        final Planner planner =
                PlannerFactoryUtil.createPlanner(
                        executor,
                        tableConfig,
                        userClassLoader,
                        moduleManager,
                        catalogManager,
                        functionCatalog);

        return new StreamTableEnvironmentImpl(
                catalogManager,
                moduleManager,
                resourceManager,
                functionCatalog,
                tableConfig,
                executionEnvironment,
                planner,
                executor,
                settings.isStreamingMode());
    }
}
```

