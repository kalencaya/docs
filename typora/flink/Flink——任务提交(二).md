# Flink——任务提交(二)

## 任务运行与集群部署

Flink 的任务运行模式有 3 种：

* Application。
* Per-job。
* Session。

Flink 集群部署方式有 3 种：

* Standalone。
* YARN。
* Native Kubernetes。

任务运行和集群部署的支持关系如下：

|                   | Application | Per-job | Session |
| ----------------- | ----------- | ------- | ------- |
| Standalone        | 支持        | 不支持  | 支持    |
| YARN              | 支持        | 支持    | 支持    |
| Native Kubernetes | 支持        | 不支持  | 支持    |

其中 Per-job 和 Session 运行方式的命令行提交命令为 `run`。

## `run` 命令

`FLINK_HOME/bin/flink run` 命令对应的源码如下，方法为`CliFronted#run(String[])`：

```java
public class CliFrontend {

    /**
     * Executions the run action.
     */
    protected void run(String[] args) throws Exception {
        LOG.info("Running 'run' command.");

        final Options commandOptions = CliFrontendParser.getRunCommandOptions();
        final CommandLine commandLine = getCommandLine(commandOptions, args, true);

        // evaluate help flag
        if (commandLine.hasOption(HELP_OPTION.getOpt())) {
            CliFrontendParser.printHelpForRun(customCommandLines);
            return;
        }

        final CustomCommandLine activeCommandLine = validateAndGetActiveCommandLine(checkNotNull(commandLine));

        final ProgramOptions programOptions = ProgramOptions.create(commandLine);

        final List<URL> jobJars = getJobJarAndDependencies(programOptions);

        final Configuration effectiveConfiguration = getEffectiveConfiguration(activeCommandLine, commandLine, programOptions, jobJars);

        LOG.debug("Effective executor configuration: {}", effectiveConfiguration);

        try (PackagedProgram program = getPackagedProgram(programOptions, effectiveConfiguration)) {
            executeProgram(effectiveConfiguration, program);
        }
    }
}
```

处理步骤为：

* 解析参数，生成配置。
  * 获取 `run` 命令支持的参数，执行命令行参数解析。
  * 获取激活的 `CustomCommandLine`。
  * 创建 `ProgramOptions`，将解析后的命令行参数封装。
  * 获取任务 jar 包本身和依赖的 URL。
  * 融合配置。
* 生成 `PackagedProgram`，提交任务。

### 参数解析

```java
public class CliFrontendParser {

    private static Options buildGeneralOptions(Options options) {
        options.addOption(HELP_OPTION);
        // backwards compatibility: ignore verbose flag (-v)
        options.addOption(new Option("v", "verbose", false, "This option is deprecated."));
        return options;
    }

    private static Options getProgramSpecificOptions(Options options) {
        options.addOption(JAR_OPTION);
        options.addOption(CLASS_OPTION);
        options.addOption(CLASSPATH_OPTION);
        options.addOption(PARALLELISM_OPTION);
        options.addOption(ARGS_OPTION);
        options.addOption(DETACHED_OPTION);
        options.addOption(SHUTDOWN_IF_ATTACHED_OPTION);
        options.addOption(YARN_DETACHED_OPTION);
        options.addOption(PY_OPTION);
        options.addOption(PYFILES_OPTION);
        options.addOption(PYMODULE_OPTION);
        options.addOption(PYREQUIREMENTS_OPTION);
        options.addOption(PYARCHIVE_OPTION);
        options.addOption(PYEXEC_OPTION);
        options.addOption(PYCLIENTEXEC_OPTION);
        return options;
    }

    public static Options getRunCommandOptions() {
        return getProgramSpecificOptions(buildGeneralOptions(new Options()))
                .addOption(SAVEPOINT_PATH_OPTION)
                .addOption(SAVEPOINT_ALLOW_NON_RESTORED_OPTION)
                .addOption(SAVEPOINT_RESTORE_MODE);
    }
}

public class CliFrontend {

    public CommandLine getCommandLine(final Options commandOptions, final String[] args, final boolean stopAtNonOptions) throws CliArgsException {
        final Options commandLineOptions = CliFrontendParser.mergeOptions(commandOptions, customCommandLineOptions);
        return CliFrontendParser.parse(commandLineOptions, args, stopAtNonOptions);
    }
}
```

从命令行中解析出来的参数最后会封装成 `CommandLine` 对象，通过 `CommandLine` 可以获取到激活的 `CustomCommandLine`，确定任务的运行方式，在将 `CommandLine` 封装成 `ProgramOptions`。

从 jar 包中获取依赖的过程是读取 jar 包中 `lib` 目录下的文件实现的。

`Configuration` 的最后生成是多方 merge 的结果：

```java
public class CliFrontend {

    private <T> Configuration getEffectiveConfiguration(
            final CustomCommandLine activeCustomCommandLine,
            final CommandLine commandLine,
            final ProgramOptions programOptions,
            final List<T> jobJars)
            throws FlinkException {

        final Configuration effectiveConfiguration = getEffectiveConfiguration(activeCustomCommandLine, commandLine);

        final ExecutionConfigAccessor executionParameters = ExecutionConfigAccessor.fromProgramOptions(checkNotNull(programOptions), checkNotNull(jobJars));

        executionParameters.applyToConfiguration(effectiveConfiguration);

        LOG.debug("Effective configuration after Flink conf, custom commandline, and program options: {}", effectiveConfiguration);
        return effectiveConfiguration;
    }

    private <T> Configuration getEffectiveConfiguration(final CustomCommandLine activeCustomCommandLine, final CommandLine commandLine) throws FlinkException {

        final Configuration effectiveConfiguration = new Configuration(configuration);

        final Configuration commandLineConfiguration = checkNotNull(activeCustomCommandLine).toConfiguration(commandLine);

        effectiveConfiguration.addAll(commandLineConfiguration);

        return effectiveConfiguration;
    }
}
```

* `FLINK_HOME/conf` 目录配置文件。
* `ProgramOptions` 包含的命令行参数。
* `CustomCommandLine` 包含的命令行参数。
* 任务 jar 包和其依赖 jar 包作为 `PipelineOptions#JARS` 配置项。

### 任务提交

`PackagedProgram` 代表一个用户以 jar 包形式提交的任务。构建过程如下：

```java
public class CliFrontend {

    private PackagedProgram getPackagedProgram(ProgramOptions programOptions, Configuration effectiveConfiguration) throws ProgramInvocationException, CliArgsException {
        PackagedProgram program;
        try {
            LOG.info("Building program from JAR file");
            program = buildProgram(programOptions, effectiveConfiguration);
        } catch (FileNotFoundException e) {
            throw new CliArgsException("Could not build the program from JAR file: " + e.getMessage(), e);
        }
        return program;
    }

    /**
     * Creates a Packaged program from the given command line options and the
     * effectiveConfiguration.
     */
    PackagedProgram buildProgram(final ProgramOptions runOptions, final Configuration configuration) throws FileNotFoundException, ProgramInvocationException, CliArgsException {
        runOptions.validate();

        String[] programArgs = runOptions.getProgramArgs();
        String jarFilePath = runOptions.getJarFilePath();
        List<URL> classpaths = runOptions.getClasspaths();

        // Get assembler class
        String entryPointClass = runOptions.getEntryPointClassName();
        File jarFile = jarFilePath != null ? getJarFile(jarFilePath) : null;

        return PackagedProgram.newBuilder()
                .setJarFile(jarFile)
                .setUserClassPaths(classpaths)
                .setEntryPointClassName(entryPointClass)
                .setConfiguration(configuration)
                .setSavepointRestoreSettings(runOptions.getSavepointRestoreSettings())
                .setArguments(programArgs)
                .build();
    }
}
```

