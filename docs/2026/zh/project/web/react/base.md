# 基础知识

## 组件定义

### 函数式

```jsx
import React from 'react';

{/* return 语句添加 () 包裹是为了避免 js 自动在语句后增加 ; 导致异常 */}
{/* <></> 是 <React.Fragment></React.Fragment> 的语法糖，因为 return 返回的内容需有一个根元素 */}
{/* 为了避免频繁使用 <div></div> 包裹返回内容，造成 div 嵌套地狱，React 提供了 React.Fragment 组件优化  */}
const MyFunComponent1: React.FC = () => {
  return (
    <>
      <div>函数式组件1</div>
    </>
  );
};

const MyFunComponent2 = () => {
  return (
    <>
      <div>函数式组件2</div>
    </>
  );
};
export default MyFunComponent2;

export default function MyFunComponent3(props: any) {
  return (
    <>
      <div>函数式组件3</div>
    </>
  )
}
```

### 类

todo

## 组件状态

### props

```jsx
import React from 'react';

export interface IProps {
  a: string
}

const MyFunComponent1: React.FC<IProps> = (props) => {
  const {a} = props
  return (
    <>
      <div>函数式组件参数1: {a}</div>
    </>
  );
};

const MyFunComponent2: React.FC<IProps> = ({a}) => {
  return (
    <>
      <div>函数式组件参数2: {a}</div>
    </>
  );
};
```

#### children

主要用在组件封装里面

### state



### context



### 组件间数据共享

#### 父传子

属性钻取

#### 子传父

回调

#### 相邻组件

状态提升

## 导出方式

默认导出，命名导出

## CSS 

## 参考链接

* [React基础快速入门（一）：JSX语法和规则](https://mp.weixin.qq.com/s/T2c9ACAgZPS9gLm2SsameA)
* [React基础快速入门（二）：函数组件与 Props属性传参](https://mp.weixin.qq.com/s/C8P-X_WTA8C1eTaj8k0Bvw)
* [React基础快速入门（三）：组件状态与 useState](https://mp.weixin.qq.com/s/iO3-RzslLwUqiTdiXh3Kbw)
* [React基础快速入门（四）：Hooks全面解析与函数组件生命周期](https://mp.weixin.qq.com/s/3uh_fHGLFEYSG9Rt3pDkPQ)
* [React基础快速入门（五）：父子组件通信与组件设计最佳实践](https://mp.weixin.qq.com/s/JbbpUHwwTselJ-94KSPgaw)
* [React基础快速入门（六）：useEffect执行机制与副作用原理](https://mp.weixin.qq.com/s/aDTc3SWqwjjbmOxHZjLFrA)
* [React基础快速入门（七）：样式CSS、CSS Modules、CSS-in-JS该如何选择？](https://mp.weixin.qq.com/s/eSucOoUQSynQi9tLEXlCnA)

