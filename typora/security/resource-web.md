# resource-web

web 页面的权限管控，为了实现用户没有某个菜单、页面或者操作按钮权限的时候，对用户隐藏对应的功能，需要对前端页面权限进行管控。



要实现类似功能，需要在前端实现权限校验。

因为现代的 vue 和 react 框架，都有路由的概念：

* [vue-router](https://router.vuejs.org/zh/)
* [react-router-dom](https://reactrouter.com/en/main)

通过在路由中添加权限控制，即可实现在用户无权限时无法访问某个页面，或者对用户隐藏无权限的菜单、页面。

部分在 github 上的项目可以参考：

* [vhr](https://github.com/lenve/vhr)
* [ruoyi-vue-pro](https://github.com/YunaiV/ruoyi-vue-pro)

scaleph 使用 react 和 antd 作为前端框架，那么要实现前端框架，就需要了解 react 和 antd 的路由功能：

* [umi-路由](https://umijs.org/docs/guides/routes)
* [umi-路由数据加载](https://umijs.org/docs/guides/client-loader)
* [umimax-布局与菜单](https://umijs.org/docs/max/layout-menu)
* [umimax-权限](https://umijs.org/docs/max/access)
* [antd pro-布局](https://beta-pro.ant.design/docs/layout-cn)
* [antd pro-权限管理](https://beta-pro.ant.design/docs/authority-management-cn)