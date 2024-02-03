# Github 认证

## token

在用户名/密码方式在废弃后，需要使用 token 访问

配置 token 方式：

* gitconfig。通用
* 钥匙串访问。在 macOS 提供的 `钥匙串访问工具` 上存储 token 信息

### 钥匙串访问

参考：[更新 OSX 密钥链中的凭据](https://docs.github.com/zh/get-started/getting-started-with-git/updating-credentials-from-the-macos-keychain)

```shell
# git credential-osxkeychain <get|store|erase>

# 查看
git credential-osxkeychain get

# 添加
echo "\
protocol=https
host=github.com
username=$NAME
password=$PASSWD" | git credential-osxkeychain store

# 删除
git credential-osxkeychain erase
```

## 2FA 认证

双因素认证

TOTP Authenticator
