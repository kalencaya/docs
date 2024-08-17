# 多版本管理

参考文档：

* [数据库模型设计——历史与版本设计](https://developer.aliyun.com/article/350760)
* [如何设计多版本内容管理](https://juejin.cn/post/7095671785336619045)
* 开源方案
  * [apollo](https://github.com/apolloconfig/apollo/blob/master/scripts/sql/profiles/mysql-default/apolloconfigdb.sql)。commit、release、release_history
  * [dolphinscheduler](https://github.com/apache/dolphinscheduler/blob/dev/dolphinscheduler-dao/src/main/resources/sql/dolphinscheduler_mysql.sql)。`t_ds_process_definition` 和 `t_ds_process_definition_log`
  * [gravitino](https://github.com/apache/gravitino/blob/main/scripts/mysql/schema-0.6.0-mysql.sql)。`current_version` 和 `last_version`
  * [sreworks](https://github.com/alibaba/SREWorks/tree/main/paas/appmanager/APP-META-PRIVATE/db)。`am_deploy_config` & `am_deploy_config_history`，`am_dynamic_script` & `am_dynamic_script_history`

* [Mybatis Plus 乐观锁](https://mybatis.plus/guide/interceptor-optimistic-locker.html)
* [文档版本管理系统 数据表设计](https://www.cnblogs.com/DBFocus/archive/2010/09/12/1824321.html)
* [javers](https://github.com/javers/javers)

## 设计思路

多版本实现的方式即是将每次修改记录至数据库中，后续即可查询数据修改记录。实现多版本思路即是如何设计数据库表结构，优化存储和查询。

需支持如下功能（以 job 表为例）

* 查询 job 列表
* 查询 job 修改历史记录
* 删除 job
* 版本信息
  * 比对
  * 回滚
  * 删除

job 表 DDL 如下：

```sql
DROP TABLE IF EXISTS job;

CREATE TABLE job (
	id bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
	project_id bigint NOT NULL COMMENT 'project id',
	job_id varchar(64) NOT NULL,
	job_name varchar(256),
	dag_id bigint NOT NULL,
	creator varchar(32) COMMENT '创建人',
	create_time timestamp DEFAULT current_timestamp COMMENT '创建时间',
	editor varchar(32) COMMENT '修改人',
	update_time timestamp DEFAULT current_timestamp ON UPDATE current_timestamp COMMENT '修改时间',
	PRIMARY KEY (id),
	UNIQUE uniq_job (project_id, job_id)
) ENGINE = innodb COMMENT 'job';
```

### 同一张表

新增 `version` 字段，标记修改版本。

* 创建。初始化 version 为 0
* 修改。新增一条记录，将 version 设置为 max(version) + 1。version 自动加 1 可通过 mybatis plus 乐观锁简单实现
* 删除。删除所有版本数据

```sql
DROP TABLE IF EXISTS job;

CREATE TABLE job (
	id bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
	project_id bigint NOT NULL COMMENT 'project id',
	job_id varchar(64) NOT NULL,
	job_name varchar(256),
	dag_id bigint NOT NULL,
	version int NOT NULL DEFAULT 0 COMMENT 'version',
	creator varchar(32) COMMENT '创建人',
	create_time timestamp DEFAULT current_timestamp COMMENT '创建时间',
	editor varchar(32) COMMENT '修改人',
	update_time timestamp DEFAULT current_timestamp ON UPDATE current_timestamp COMMENT '修改时间',
	PRIMARY KEY (id),
	UNIQUE uniq_job (project_id, job_id, version)
) ENGINE = innodb COMMENT 'job';
```

#### job 操作

```sql
-- 查询 job 列表
SELECT *
FROM (
	SELECT *, row_number() OVER (PARTITION BY project_id, job_id ORDER BY version DESC) AS rn
	FROM job
) t
WHERE rn = 1;

-- 查询 job 历史记录
SELECT *
FROM job
WHERE job_id = #{jobId}
ORDER BY version DESC;

-- 删除 job
DELETE FROM job
WHERE job_id = #{jobId};
```

#### 版本信息

```sql
-- 比对

-- 回滚
-- 复制某个版本数据，并将 version 设置为 max(version) + 1

-- 删除

```

#### 缺点

* 将数据和历史数据放在同一张表中，会导致表中数据量膨胀的很快
* 修改操作时需将新的版本数据 version 设置为 max(version) + 1

### current_version 和 last_version

将 `version` 变更为 `current_version` 和 `last_version` 字段。以便支持版本回退

### 修改历史表

新增历史表，历史表和 job 表字段一致（job 和历史表都新增 version 字段）：

```sql
DROP TABLE IF EXISTS job;

CREATE TABLE job_history (
	id bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
	project_id bigint NOT NULL COMMENT 'project id',
	job_id varchar(64) NOT NULL,
	job_name varchar(256),
	dag_id bigint NOT NULL,
  version int NOT NULL DEFAULT 0 COMMENT 'version',
	creator varchar(32) COMMENT '创建人',
	create_time timestamp DEFAULT current_timestamp COMMENT '创建时间',
	editor varchar(32) COMMENT '修改人',
	update_time timestamp DEFAULT current_timestamp ON UPDATE current_timestamp COMMENT '修改时间',
	PRIMARY KEY (id),
	KEY idx_job (project_id, job_id, version)
) ENGINE = innodb COMMENT 'job history';
```

在 job 表中新增 `vesion` 字段：

```sql
DROP TABLE IF EXISTS job;

CREATE TABLE job (
	id bigint NOT NULL AUTO_INCREMENT COMMENT '自增主键',
	project_id bigint NOT NULL COMMENT 'project id',
	job_id varchar(64) NOT NULL,
	job_name varchar(256),
	dag_id bigint NOT NULL,
	version int NOT NULL DEFAULT 0 COMMENT 'version',
	creator varchar(32) COMMENT '创建人',
	create_time timestamp DEFAULT current_timestamp COMMENT '创建时间',
	editor varchar(32) COMMENT '修改人',
	update_time timestamp DEFAULT current_timestamp ON UPDATE current_timestamp COMMENT '修改时间',
	PRIMARY KEY (id),
	UNIQUE uniq_job (project_id, job_id, version)
) ENGINE = innodb COMMENT 'job';
```

job 表处理：

* 创建。初始化 version 为 0，将数据复制至 job_history 表
* 修改。新增一条记录，将 version 设置为 max(version) + 1，将数据复制至 job_history 表
* 删除。删除所有版本数据，删除 job_history 中所有数据

### 方案优化

* version。version 可系统维护，从 0、1、2、3... 一直增长，也可使用时间戳，免于维护
* 修改和发布。`current_version_id` 和 `lastest_version_id` 字段分别标记当前版本和最新版本
