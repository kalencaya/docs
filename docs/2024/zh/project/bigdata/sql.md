# SQL

* [JSqlParser](https://github.com/JSQLParser/JSqlParser)
* [superior-sql-parser](https://github.com/melin/superior-sql-parser)
* [druid](https://github.com/alibaba/druid)。Druid 是阿里开源的数据库连接池，在数据库连接池的外表下，内置了很多的实用功能。Druid 的 SQL Parser 是手工编写，并未使用 antlr、javacc 之类的工具，性能非常好。Druid 的 SQL Parser 对各种数据语法支持非常完备。
  * [SQL Parser](https://github.com/alibaba/druid/wiki/SQL-Parser)。Durid 使用 SQL Parser 防御 SQL 注入，提供了多种 SQL 解析支持。
    * [SQL AST](https://github.com/alibaba/druid/wiki/Druid_SQL_AST)。AST是Abstract Syntax Tree的缩写，也就是抽象语法树。AST是parser输出的结果。
    * [SQL Visitor](https://github.com/alibaba/druid/wiki/SQL-Parser#43-visitor)。Visitor是遍历AST的手段，是处理AST最方便的模式。
  * [SQL Format](https://github.com/alibaba/druid/wiki/SQL_Format)。
  * [SQL Transform](https://github.com/alibaba/druid/wiki/SQL-Parser#6-sql%E7%BF%BB%E8%AF%91)。Druid 提供了部分类型 SQL 翻译功能，如将 Oracle 翻译成 MySQL。
* [jOOQ](https://github.com/jOOQ/jOOQ)。
* [anyline](https://gitee.com/anyline/anyline)。基于spring生态的D-ORM,兼容各种小众国产数据库。运行时动态注册切换数据源，生成DDL/DML。读写元数据。常用于动态场景的底层支持,如:数据中台、可视化、低代码后台、工作流、自定义表单、异构数据库迁移同步、物联网车联网数据处理、数据清洗、运行时自定义报表/查询条件/数据结构、爬虫数据解析等,只需要一个注解即可与spring完美整合。

## 日志工具

* log4jdbc
* [p6spy](https://github.com/p6spy/p6spy)。

## SQL 框架

* [calcite](https://github.com/apache/calcite)