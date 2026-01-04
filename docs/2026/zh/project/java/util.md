# 工具类

* [agrona](https://github.com/real-logic/agrona)。High Performance data structures and utility methods for Java
* [hutool](https://github.com/dromara/hutool)
* [guava](https://github.com/google/guava)
* [vavr](https://github.com/vavr-io/vavr)
* [jOOL](https://github.com/jOOQ/jOOL)
* [Java8 Steam流太难用了？那你可以试试 JDFrame](https://mp.weixin.qq.com/s/cf7mMEl5HEwX_40i92mZ9A)
* [redisson](https://github.com/redisson/redisson)
* [camellia](https://github.com/netease-im/camellia)
* [apache commons](https://commons.apache.org/)
  * [commons-lang](https://github.com/apache/commons-lang)
  * [commons-collections](https://github.com/apache/commons-collections)
* [java-util](https://github.com/jdereg/java-util)。Rare, hard-to-write utilities that are thoroughly tested

## Graph

* [guava](https://github.com/google/guava)。guava Graph
* [jgrapht](https://github.com/jgrapht/jgrapht)。[jgrapht.org/guide](https://jgrapht.org/guide/UserOverview)
* [commons-graph](https://github.com/apache/commons-graph)。Apache Commons Graph
* [jung](https://github.com/jrtom/jung)。
* [graphviz](https://graphviz.org/)。

## Bean Copy

* [mapstruct](https://github.com/mapstruct/mapstruct)

## 反射



## Format

* sql。

  * [sql-formatter](https://github.com/sql-formatter-org/sql-formatter)
  * [sql-formatter](https://github.com/vertical-blank/sql-formatter)
  * [druid](https://github.com/alibaba/druid)

* 日期&时间

  * [prettytime](https://github.com/ocpsoft/prettytime)

  * [commons-lang](https://github.com/apache/commons-lang)。

    ```
    public class Test {
    
        public static void main(String[] args) {
            Duration duration = Duration.ofSeconds(61);
            // 1 minute 1 second
            System.out.println(DurationFormatUtils.formatDurationWords(duration.toMillis(), true, true));
            // 0天0小时1分钟1秒
            System.out.println(DurationFormatUtils.formatDuration(duration.toMillis(), "d'天'H'小时'm'分钟's'秒'"));
            // 00天00小时01分钟01秒
            System.out.println(DurationFormatUtils.formatDuration(duration.toMillis(), "dd天HH小时mm分钟ss秒"));
        }
    }
    ```

* 金钱

  * [joda-money](https://github.com/JodaOrg/joda-money)

* 数字

  * jdk。`NumberFormat`、`DecimalFormat`

