# Java

## JDK

1. 下载 [JDK](https://adoptium.net/zh-CN/temurin/archive/)。可选择 JDK 11、17、21 等长期支持版本。下载分为**二进制**和**安装器**，Mac 和 Windows 用户可选择**安装器**下载

2. 安装。

3. 配置多版本管理。在 `.bash_profile` 中添加如下配置，设置 `JAVA_HOME` 和快速切换 JDK 版本命令

   ```shell
   ## 配置环境变量
   export JAVA_11_HOME=$(/usr/libexec/java_home -v11)
   export JAVA_17_HOME=$(/usr/libexec/java_home -v17)
   
   ## JAVA_HOME
   export JAVA_HOME=$JAVA_11_HOME
   
   ## 切换 JDK 版本命令
   alias java11="export JAVA_HOME=$JAVA_11_HOME"
   alias java17="export JAVA_HOME=$JAVA_17_HOME"
   
   ## 验证。使用 java -version 查看当前生效的 JDK 信息
   java -version
   ```

## Maven

1. 下载 [maven](https://maven.apache.org/download.cgi)。

2. 安装。将下载的安装包解压，放在某个目录即可。需记住存放路径：`/path/to/your_maven`

3. 配置环境变量。

   ```shell
   ## 配置环境变量
   export M2_HOME=/path/to/your_maven
   export PATH=$PATH:$M2_HOME/bin
   
   ## 验证
   mvn -v
   ```

4. 配置 maven。编辑 `$user_home/.m2/settings.xml` 文件

   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <settings xmlns="http://maven.apache.org/SETTINGS/1.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
     <!-- 在本地指定文件目录，存储本地 jar 包。可不指定，默认存储在 $user_home/.m2/repository  -->
     <localRepository>/path/to/local_repository</localRepository>
   
     <!-- 配置阿里云 maven 仓库镜像  -->
     <mirrors>
       <mirror>
         <id>nexus-aliyun</id>
         <mirrorOf>central</mirrorOf>
         <name>Nexus aliyun</name>
         <url>https://maven.aliyun.com/repository/central</url>
       </mirror>
     </mirrors>
   </settings>
   ```
