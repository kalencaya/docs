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
      <div>函数式组件</div>
    </>
  );
};

const MyFunComponent2 = () => {
  return (
    <>
      <div>函数式组件</div>
    </>
  );
};

export default MyFunComponent2;
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

