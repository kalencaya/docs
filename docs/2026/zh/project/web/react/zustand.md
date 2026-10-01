# Zustand

## 基本用法

创建 store

```jsx
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))
```

在 React 组件中使用 store：

```jsx
function Counter() {
  // 不推荐，任一状态发生变化都会触发重渲染
  const store = useStore()
  const {count, increment, decrement, reset} = useStore()
  
  // 推荐， 选择器只订阅关注的状态
  const count = useStore((state) => state.count)
  // 选择器也支持函数
  const increment = useStore((state) => state.increment)
  const decrement = useStore((state) => state.decrement)
  const reset = useStore((state) => state.reset)

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  )
}
```

在 React 组件外如工具类中使用 store：

```typescript
useStore.getState().increment()
useStore.subscribe((state) => console.log(state))
```

使用浅比较，避免引用变化导致多余渲染

```jsx
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

const useMeals = create(() => ({
  papaBear: 'large porridge-pot',
  mamaBear: 'middle-size porridge pot',
  littleBear: 'A little, small, wee pot',
}))

export const BearNames = () => {
  const names = useMeals(useShallow((state) => Object.keys(state)))

  return <div>{names.join(', ')}</div>
}
```

选择器也可以同时指定多个属性：

```jsx
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'

// Bear store with explicit types
interface BearState {
  bears: number
  food: number
}

const useBearStore = create<BearState>()(() => ({
  bears: 2,
  food: 10,
}))

// In components, you can use both stores safely
function MultipleSelectors() {
  // 指定多个属性
  const { bears, food } = useBearStore(
    useShallow((state) => ({ bears: state.bears, food: state.food })),
  )

  return (
    <div>
      We have {food} units of food for {bears} bears
    </div>
  )
}
```

有些状态不需要单独有个字段存储，可以使用现有状态计算出来：

```jsx
import { create } from 'zustand'

interface BearState {
  bears: number
  foodPerBear: number
}

const useBearStore = create<BearState>()(() => ({
  bears: 3,
  foodPerBear: 2,
}))

function TotalFood() {
  // 计算状态，无需有个属性存储
  const totalFood = useBearStore((s) => s.bears * s.foodPerBear)

  return <div>We need ${totalFood} jars of honey</div>
}
```

状态也可以支持异步：

```typescript
interface UserState {
  user: User | null;
  loading: boolean;
  fetchUser: (id: string) => Promise<void>;
}

const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: false,
  fetchUser: async (id) => {
    set({ loading: true });
    try {
      const user = await api.getUser(id);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },
}));
```

## Combine

在 state 中既有属性又有方法时，代码会混在一起：

```jsx
import { create } from 'zustand'

interface StoreState {
  count: number
}

interfact StoreAction {
  increment: (state) => void;
  decrement: (state) => void;
  reset: (state) => void;
}

const useStore = create<StoreState&StoreAction>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}))

// State + actions are separated
export const useBearStore = create<StoreState & StoreAction>()(
  combine(
    { bears: 0 },
    (set) => ({
      increase: () => set((s) => ({ bears: s.bears + 1 })),
    })),
)
```



## 持久化

如果不想页面刷新一下数据就没了，比如登陆信息，需要把数据持久化。

默认是持久化到 `localStorage`，可以调整到 `sessionStorage`，可以自己实现如把一些页面查询参数持久化到 url 中：[Connect State with URL Hash](https://zustand.docs.pmnd.rs/learn/guides/connect-to-state-with-url-hash.html)

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface BearState {
  bears: number
  increase: () => void
}

export const useBearStore = create<BearState>()(
  persist(
    (set) => ({
      bears: 0,
      increase: () => set((s) => ({ bears: s.bears + 1 })),
    }),
    { name: 'bear-storage' }, // localStorage key
  ),
)
```

## 不可变数据

对于嵌套对象：

```typescript
type State = {
  deep: {
    nested: {
      obj: { count: number }
    }
  }
}
```

更新属性的时候，需要展开所有层级：

```typescript
  normalInc: () =>
    set((state) => ({
      deep: {
        ...state.deep,
        nested: {
          ...state.deep.nested,
          obj: {
            ...state.deep.nested.obj,
            count: state.deep.nested.obj.count + 1
          }
        }
      }
    })),
```

可以使用 immer 更新嵌套对象：

```typescript
import { immer } from 'zustand/middleware/immer';

const useStore = create(
  immer((set) => ({
    user: { name: 'John', age: 30 },
    updateAge: (newAge) =>
      set((state) => {
        state.user.age = newAge; // 直接修改，Immer会处理不可变性
      }),
  }))
);
```

对于非嵌套对象，`set` 会自动 merge 状态，不需要手动展开

```typescript
import { create } from 'zustand'

const useCountStore = create((set) => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
//  inc: () => set((state) => ({ ...state, count: state.count + 1 })) 不需要手动展开 ...state
}))
```

如果想要禁用 `set` 的自动 merge，添加一个 `replace` 参数即可：

```typescript
set((state) => newState, true)
```

## devtools

如果想观察 zustand 状态变更，可以使用 devtools：

```typescript
import { devtools } from 'zustand/middleware'

const useStore = create(
  devtools((set) => ({ /* ... */ }))
)
```

## 参考链接

* [Documentation](https://zustand.docs.pmnd.rs/)
* [中文站点](https://zustand.site/zh/)