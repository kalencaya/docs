# Ant Design



## Antd 6.0

### 样式

新版的 antd 6.0 彻底移除对 less 的支持，同时也提供了暗色算法，可一键切换至暗模式

#### 全局样式

支持 3 种 css 方案：

* Tailwind Css v4
* antd-style v4。消费 design token 的 css in js 方案
* module css

同时启用 antd CSS 变量模式（cssVar）

##### token

```jsx
import React from 'react';
import { Button, theme } from 'antd';

const MyComponent = () => {
  // 获取 antd 内置 Token（对应 v4 Less 变量）
  const { token } = theme.useToken();

  return (
    <Button 
      type="primary"
      style={{ 
        backgroundColor: token.colorPrimary, // 对应 v4 @primary-color
        borderRadius: token.borderRadius,    // 对应 v4 @border-radius-base
        fontSize: token.fontSizeLG           // 对应 v4 @font-size-lg
      }}
    >
      基于 Token 的自定义样式
    </Button>
  );
};

export default MyComponent;
```







样式覆盖也有了更简单的方式：

#### 全局修改

通过顶层的 `ConfigProvider` 修改：

例如单独修改 `Button` 组件：

```jsx
const btnClassNames: ButtonProps['classNames'] = ({ props }) => {
  switch (props.type) {
    case 'primary':
      return { ... };
    default:
      return { ... };
  }
};

<ConfigProvider button={{ classNames: btnClassNames }}>
  <App />
</ConfigProvider>
```

也可以通过 `theme` 中的 token 配置来修改：

```jsx
<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#000'  // 主色
    },
    algorithm: theme.defaultAlgorithm, // 可选：切换暗色算法 theme.darkAlgorithm
  }}
>
  {children}
</ConfigProvider>
```

也可修改单个组件的 token：

```jsx
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: '#00b96b',
            algorithm: true, // Enable algorithm
          },
          Input: {
            colorPrimary: '#eb2f96',
            algorithm: true, // Enable algorithm
          },
        },
      }}
    >
      <Space>
        <div style={{ fontSize: 14 }}>Algorithm Enabled:</div>
        <Input placeholder="Please Input" />
        <Button type="primary">Submit</Button>
      </Space>
    </ConfigProvider>
```



#### 组件修改

v6 完成了所有组件的 DOM 语义化改造，它引入了 `classNames` 和 `styles` 属性，允许你精准地把样式注入到组件的内部结构中。

在组件中，传入特定的 `className` 来修改：

```jsx
<Button
  classNames={{
    root: 'rounded-tr-xl rounded-bl-xl',
    icon: 'rotate-30',
  }}
  icon={<SmileOutlined />}
>
  Ant Design
</Button>
```

因为 antd 6.0 支持了 Tailwind Css，可以直接传入 Tailwind Css 的类名。其次 Button 的 root 和 icon 可以查阅 antd 的 [Semantic DOM](https://ant-design.antgroup.com/components/button-cn#semantic-dom)

```jsx
<Card
  title="Hello World"
  classNames={{
    root: "bg-green-300/10 text-green-500 border-green-500 rounded-none [box-shadow:0_0_8px_theme(colors.green.500)]",
    header: "rounded-none border-green-500 [box-shadow:inset_0_0_8px_theme(colors.green.500)]",
    title:
      "text-green-500 [text-shadow:0_0_12px_theme(colors.green.400)] overflow-visible",
      body: "rounded-none [text-shadow:0_0_8px_theme(colors.green.400)] [box-shadow:inset_0_0_12px_theme(colors.green.500)]"
  }}
>
  Ant Design loves you!~ (=^・ω・^)
</Card>
```

antd-style 方式开发样式：

```jsx
import { useState } from "react";
import { Button, Flex, Modal, Card, Image, Typography, Space } from "antd";
import type { ModalProps } from "antd";
import { createStyles } from "antd-style";
const { Title, Text } = Typography;

// 使用 antd-style 的 createStyles 定义样式
const useStyles = createStyles(({ token }) => ({
  // 用于模态框容器的基础样式
  container: {
    borderRadius: token.borderRadiusLG * 1.5,
    overflow: "hidden",
  },
}));

// 示例用的共享内容
const sharedContent = (
  <Card size="small" bordered={false}>
    <Image
      height={300}
      src="https://gw.alipayobjects.com/zos/antfincdn/LlvErxo8H9/photo-1503185912284-5271ff81b9a8.webp"
      alt="示例图片"
      preview={false}
      className="mx-auto!"
    />
    <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
      Ant Design 6.0 默认的模糊背景与 antd-style
      定制的毛玻璃面板相结合，营造出深邃而富有层次的视觉体验。
    </Text>
  </Card>
);

export default () => {
  const [blurModalOpen, setBlurModalOpen] = useState(false);
  const [gradientModalOpen, setGradientModalOpen] = useState(false);
  const { styles: classNames } = useStyles();
  
  // 场景1：背景玻璃模糊效果（朦胧美学）
  const blurModalStyles: ModalProps["styles"] = {
    body: {
      padding: 24,
    },
  };
  // 场景2：渐变色背景模态框（无模糊效果）
  const gradientModalStyles: ModalProps["styles"] = {
    mask: {
      backgroundImage: `linear-gradient(
        135deg, 
        rgba(99, 102, 241, 0.8) 0%, 
        rgba(168, 85, 247, 0.6) 50%, 
        rgba(236, 72, 153, 0.8) 100%
      )`,
    },
    body: {
      padding: 24,
    },
    header: {
      background: "linear-gradient(to right, #6366f1, #a855f7)",
      color: "#fff",
      borderBottom: "none",
    },
    footer: {
      borderTop: "1px solid #e5e7eb",
      textAlign: "center",
    },
  };
  // 共享配置
  const sharedProps: ModalProps = {
    centered: true,
    classNames,
  };

  return (
    <div className="w-full h-[100vh] overflow-auto p-[24px] space-y-5">
      <Card
        title="Ant Design 6 模态框样式示例"
        bordered={false}
        extra={
          <Text type="secondary" className="text-sm">
            朦胧美学 + 渐变背景，高级感拉满！
          </Text>
        }
      >
        <Flex
          gap="middle"
          align="center"
          justify="center"
          style={{ padding: 40, minHeight: 300 }}
        >
          <Button
            type="primary"
            size="large"
            onClick={() => setBlurModalOpen(true)}
          >
            🌫️ 背景玻璃模糊效果
          </Button>
          <Button size="large" onClick={() => setGradientModalOpen(true)}>
            🎨 渐变色背景模态框
          </Button>
          {/* 模态框 1：背景玻璃模糊效果（朦胧美学） */}
          <Modal
            {...sharedProps}
            title="背景玻璃模糊效果"
            styles={blurModalStyles}
            open={blurModalOpen}
            onOk={() => setBlurModalOpen(false)}
            onCancel={() => setBlurModalOpen(false)}
            okText="太美了"
            cancelText="关闭"
            mask={{ enabled: true, blur: true }}
            width={600}
          >
            {sharedContent}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "rgba(255, 255, 255, 0.6)",
                borderRadius: 8,
                backdropFilter: "blur(10px)",
              }}
            >
              <Text type="secondary">
                <strong>💡 设计亮点：</strong>
                启用了 mask=&#123;&#123; blur: true &#125;&#125;，
                背景会自动应用模糊效果，营造出朦胧美学的高级质感。
              </Text>
            </div>
          </Modal>
          {/* 模态框 2：渐变色背景（无模糊效果） */}
          <Modal
            {...sharedProps}
            title="渐变色背景模态框"
            styles={gradientModalStyles}
            open={gradientModalOpen}
            onOk={() => setGradientModalOpen(false)}
            onCancel={() => setGradientModalOpen(false)}
            okText="好看"
            cancelText="关闭"
            mask={{ enabled: true, blur: false }}
            width={600}
          >
            {sharedContent}
            <div
              style={{
                marginTop: 16,
                padding: 16,
                background: "linear-gradient(135deg, #fef3c7 0%, #fce7f3 100%)",
                borderRadius: 8,
                border: "1px solid rgba(168, 85, 247, 0.2)",
              }}
            >
              <Text type="secondary">
                <strong>🎨 设计亮点：</strong>
                通过 styles.mask 设置渐变背景色，同时 styles.header
                应用了渐变头部，打造独特的视觉体验。
              </Text>
            </div>
          </Modal>
        </Flex>
        <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-purple-200">
          <Title level={5} className="mb-3">
            📚 技术要点
          </Title>
          <Space direction="vertical" size="small" className="w-full">
            <Text>
              • <strong>玻璃模糊：</strong>使用 mask=&#123;&#123; blur: true &#125;&#125; 启用原生模糊效果
            </Text>
            <Text>
              • <strong>渐变背景：</strong>通过 styles.mask.backgroundImage 设置渐变色
            </Text>
            <Text>
              • <strong>语义化定制：</strong>使用 styles.header/body/footer 精准控制各部分样式
            </Text>
            <Text>
              • <strong>antd-style 集成：</strong>使用 createStyles 定义可复用的样式类名
            </Text>
          </Space>
        </div>
      </Card>
    </div>
  );
};
```

## 参考链接

* [Vite + TypeScript 从零搭建 React 18 通用后台管理系统：工程化基建到 Monorepo 升级实战（生产收藏级）](https://mp.weixin.qq.com/s/1bGQoHH5brWTVWvn4K5IFg)
* [从零搭建React19+Vite+Antd6中后台管理系统（一）-环境准备和创建项目](https://mp.weixin.qq.com/s/4rQpW0uw5ZuS8ddrgf1BlA)
* [从零搭建React19+Vite+Antd6中后台管理系统（二）-配置代码规范](https://mp.weixin.qq.com/s/HdAGi1usUk6BTo8lfocdKg)
* [从零搭建React19+Vite+Antd6中后台管理系统（三）-配置代码提交规范](https://mp.weixin.qq.com/s/diYkKvkKQN833p-ZwgLj6Q)
* [从零搭建React19+Vite+Antd6中后台管理系统（四）-安装Antd编写布局](https://mp.weixin.qq.com/s/9DdhaAcxWhzfQX3XbXb6hA)
* [从零搭建React19+Vite+Antd6中后台管理系统（五）-配置路由React Router](https://mp.weixin.qq.com/s/dEUri8g_H8EfviOLTwwybQ)
* [从零搭建React19+Vite+Antd6中后台管理系统（六）-配置状态管理Redux](https://mp.weixin.qq.com/s/tiwfFCNXN2cqskA0pEdJsw)
* [从零搭建React19+Vite+Antd6中后台管理系统（七）-配置Mock和Axios](https://mp.weixin.qq.com/s/E6SzLz6uQYOdyCeFSvO_JQ)
* [antd-admin：轻量级后台管理系统的务实起点](https://mp.weixin.qq.com/s/041Czzt4zhStBwVTDkbDuw)
* [south-admin-react](https://github.com/southliu/south-admin-react)
* [one-admin-react](https://gitee.com/maoxiaojiu9/one-admin-react)
* [让你 React 组件水平暴增的 5 个技巧](https://mp.weixin.qq.com/s/K2TbPPcLjot1BFcE9gGePQ)
* [React + Antd 主题系统改造全景指南](https://mp.weixin.qq.com/s/_rJWsjm1FTMNuAqxSKvtFw)
* [Ant Design 实战开发技巧全攻略](https://mp.weixin.qq.com/s/_a7HpnSF8ZrFaWnaTFkTLg)
* [Antd5一出，治好了我组件库选择内耗，我直接搭配React18+Vite+Ts做了一个管理后台](https://mp.weixin.qq.com/s/ogXGvrhCtVfj83Wzwhp8pg)
