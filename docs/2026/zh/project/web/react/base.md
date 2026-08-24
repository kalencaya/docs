# 基础知识

## 组件定义

### 函数式

```jsx
import React from 'react';

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

## 组件参数

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

### children

主要用在组件封装里面

