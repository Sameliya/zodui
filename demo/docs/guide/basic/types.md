# 类型

Zod 支持了许多不同的类型，这些类型可以用来描述数据的基础类型，也可以用来描述自定义类型，ZodUI 则基于这套类型描述系统上通过对应的类型规则选择合适的组件渲染。\
所以在这里我们需要认知到，我们有哪些类型可以用，如果你对 JavaScript 的常见类型有所了解，那么你可以很快的上手 Zod 的类型系统的前半部分。\
如果你对 TypeScript 的类型系统有所了解，那么你可以很快的上手 Zod 的类型系统的后半部分（大概前半部分也是没有问题的），因为 Zod 的类型系统是基于 TypeScript 的类型系统的，所以你可以很快的上手。

## 原始值类型

首先我们认识到我们的底座是在 JavaScript 之上的，所以你需要对 JavaScript 的基础类型有一定的了解，你可以参考阅读 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures)。\
在 Zod 中支持了许多「[原始值类型（Primitive）](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Data_structures#%E5%8E%9F%E5%A7%8B%E5%80%BC)」，你可以通过 `z.<type>` 来获取声明对应的类型校验。并通过传入给 ZodUI 组件时渲染为你需要的视图。\
接下来我们来看看 Zod 支持了哪些原始值类型。

### 字符串

字符串类型，对应 JavaScript 中的 [`string`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String) 类型。

```typescript zodui:preview
[
  z
    .string()
    .label('文本'),
  z
    .string()
    .mode('secret')
    .label('密文')
    .describe('密文模式下，输入框将会隐藏输入内容，你可以通过单击眼睛图标来切换查看模式。'),
  z
    .string()
    .mode('link')
    .label('链接')
    .describe('链接模式下，输入框将会渲染为链接，你可以通过单击输入框右侧的链接按钮来跳转到对应的输入内容所在的地址。'),
  z
    .string()
    .mode('wrap textarea')
    .label('多行文本')
    .describe('多行文本模式下，输入框将会渲染为多行文本框，你可以通过输入换行增加输入框的高度。'),
  // z
  //   .string()
  //   .mode('wrap code-monaco::json')
]
```

### 数字

数字类型，对应 JavaScript 中的 [`number`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number) 类型。

```typescript zodui:preview
[
  z
    .number()
    .label('数字'),
  z
    .number()
    .mode('split')
    .label('分割')
    .describe('分割模式下，输入框将会渲染为一个输入框与左右两个按钮，你可以通过点击按钮来增加或减少输入框的值。'),
  z
    .number()
    .mode('slider')
    .label('滑块')
    .describe('滑块模式下，输入框将会渲染为一个滑块，你可以通过拖动滑块来增加或减少输入框的值。'),
]
```

### 布尔

布尔类型，对应 JavaScript 中的 [`boolean`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Boolean) 类型。

```typescript zodui:preview
z.boolean()
```

### 日期

日期类型，对应 JavaScript 中的 [`Date`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Date) 类型。\
对于日期类型，除了下面的之外，比较常见还有选择时间范围的一种类型，你可以在[组合类型/元组](#元组)中看到这种交互模式应该如何被定义。

```typescript zodui:preview
[
  z.date().label('日期（但是手输）'),
  z.date().mode('date').label('日期'),
  z.date().mode('datetime').label('日期时间'),
  z.date().mode('time').label('时间'),
  z.date().mode('date panel wrap').label('日期')
    .describe('日期模式并且叠加了表盘的情况下，交互区域将会以无须下拉的表盘的形式展示。'),
  z.date().mode('datetime panel wrap').label('日期时间')
    .describe('日期时间模式并且叠加了表盘的情况下，交互区域将会以无须下拉的表盘的形式展示。'),
  z.date().mode('time panel wrap').label('日期时间')
    .describe('时间模式并且叠加了表盘的情况下，交互区域将会以无须下拉的表盘的形式展示。'),
]
```

在这里直接使用 `z.date` 最后由 zod 处理后得到的数据会是一个 `Date` 类型的实例，但是在实际的业务场景中，我们可能需要的是一个 `string` 类型的日期，所以我们可以直接使用 `z.string().mode('date')` 将字符串切换到日期模式的交互模式，并得到字符串格式的结果，同理也可以用于数字类型。

```typescript zodui:preview
[
  z
    .string()
    .mode('date')
    .label('字符串日期'),
  z
    .number()
    .mode('date')
    .label('数字日期/时间戳（Timestamp）')
]
```

## 组合类型

在大部分场景下，单一的元素并不能解决实际的业务问题，有时候我们便需要将多个元素组合在一起来解决实际的业务问题。\
为了适应实际场景中的业务需求，我们可以由一些简单类型通过复合器构造出我们需要的组合类型。

> 除了使用复合器来构造组合类型之外，我们还可以使用复合器来构造运算类型，你可以在[运算类型](#运算类型)中看到这种交互模式应该如何被定义。

### 数组

数组复合器，对应 JavaScript 中的 [`Array`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array) 类型。

```typescript zodui:preview
z.object({
  strings: z.array(z.string()).label('字符串数组'),
  numbers: z.array(z.number()).label('数字数组'),
  objects: z.array(z.object({
    name: z.string().label('姓名'),
    age: z.number().label('年龄')
  })).label('对象数组'),
})
```

### 对象

对象复合器，对应 JavaScript 中的 [`Object`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object) 类型。

```typescript zodui:preview
z.object({
  name: z.string().label('姓名'),
  age: z.number().label('年龄')
})
```

### 图（Map）

图复合器，对应 JavaScript 中的 [`Map`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Map) 类型。

```typescript zodui:preview
z.object({
  stringMap: z.map(z.string(), z.string()).label('字符串 Map'),
  numberMap: z.map(z.string(), z.number()).label('数字 Map'),
  numberKeyMap: z.map(z.number(), z.string()).label('数字 Map').describe('数字作为键的 Map')
})
```

### 集合（Set）

集合复合器，对应 JavaScript 中的 [`Set`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Set) 类型。

```typescript zodui:preview
z.set(z.string())
```

### 字典

字典复合器，在 JavaScript 中并不存在字典类型，但是我们可以通过对象来模拟字典类型，所以在 Zod 中也是如此。在这里我们使用了 Object 来做字典类型的模拟，我们限制了字典的键的类型为字符串，值的类型为用户的输入。

> 在 TC39 的提案中，已经有了字典类型的提案，但是目前的进度缓慢，而且似乎即将被废弃，所以我们在这里并没有使用这个提案中的不可变字典类型。
> 详情可以参考 [TC39/proposal-record-tuple](https://github.com/tc39/proposal-record-tuple)。

```typescript zodui:preview
z.record(z.string())
```

### 元组

元组复合器，在 JavaScript 中并不存在元组类型，与 Record 类似的我们使用了 Array 来做元组类型的模拟，我们限制了元组的长度为用户的输入类型长度，每一位都是由元组定义中固定位置的类型所限制的。

```typescript zodui:preview
z.tuple([
  z.string(),
  z.number()
])
```

[//]: # (TODO link to plugin system)
通过[插件]()，哪怕是简单的元组，我们也可以玩出来一些有趣的东西。

```typescript zodui:preview
z.object({
  t0: z
    .tuple([z.date(), z.date()])
    .mode('date')
    .label('日期范围')
    .describe('日期范围模式下，输入框将会渲染为两个输入框，你可以通过交互来输入对应的内容。'),
  t1: z
    .tuple([z.date(), z.date()])
    .mode('datetime')
    .label('日期时间范围')
    .describe('日期时间范围模式下，输入框与上面的日期范围模式类似，只是在输入框的右侧增加了一个下拉框来选择时间。'),
  // t2: z
  //   .tuple([z.date(), z.date()])
  //   .mode('time')
  //   .label('时间范围')
  //   .describe('日期时间范围模式下，输入框与上面的日期范围模式类似，只是在输入框的右侧增加了一个下拉框来选择时间。'),
  t3: z
    .tuple([z.date(), z.date()])
    .mode('date panel wrap')
    .label('日期范围')
    .describe('日期范围模式并且叠加了表盘的情况下，交互区域将会以无须下拉的表盘的形式展示。'),
  t4: z
    .tuple([z.number(), z.number()])
    .label('数字范围')
    .describe('当数据由固定的俩个数字类型元组构成时，根据插件会渲染成一个 Silder 组件，你可以通过拖拽来选择对应的范围。'),
})
```

### 枚举

没做，感觉现在的有点扭曲，还不想写。

### 递归

Zod 没支持，但是我支持了，但是暂时不想写文档，晚点再写。

## 特殊类型

除了上面的类型之外，Zod 还支持了一些特殊的类型，这些类型在实际的业务场景中也算比较常见。但是实际上来说其中的部分并不是在 JavaScript 中存在的类型，只是在原本的类型语义上进行扩展从而形成的新类型。\
我们来看看这些类型在交互中存在着怎么样的作用。

### 空

没支持😭。

### 谁都行！（Any 和 Unknown）

没支持😭。

### 不存在！（Never）

没支持😭。
