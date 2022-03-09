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

* 获取 `run` 命令支持的参数。
* 执行命令行参数解析。
* 获取激活的 `CustomCommandLine`。
* 创建 `ProgramOptions`，将解析后的命令行参数封装。
* 获取任务 jar 包本身和依赖的 URL。
* 融合配置。
* 创建 `PackagedProgram`，提交任务。