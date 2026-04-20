# blockcraftjson

一个可以复用的 Vue3 组件,通过类似 Scratch 的积木块的拖拽方式编辑 JSON 数据,可以导入导出,实时预览 JSON 数据内容。

## 安装

先将源代码中的components目录复制到项目中

## 快速开始

```vue
<template>
  <BlockCraft
    :block="blockConfig"
    :theme="themeConfig"
    :authority="authorityConfig"
    v-model="formData"
  />
</template>

<script setup>
import { BlockCraft } from 'blockcraftjson'

const blockConfig = {
  block: [
    { key: 'name', name: '姓名', type: 'string' },
    { key: 'age', name: '年龄', type: 'number' },
    { key: 'sex', name: '性别', type: 'select', options: ['男', '女'] }
  ]
}

const formData = ref({})
</script>
```

## 组件属性

| 属性名     | 类型   | 必填 | 默认值                      | 描述             |
| ---------- | ------ | ---- | --------------------------- | ---------------- |
| block      | Object | 否   | { block: [], subBlock: [] } | 配置积木块的属性 |
| theme      | Object | 否   | {}                          | 主题色配置       |
| authority  | Object | 否   | {}                          | 权限配置         |
| modelValue | Object | 否   | {}                          | 双向绑定的数据   |

## block 配置

配置可以操作的积木块属性：

```js
{
  block: [
    {
      key: 'name',        // 字段唯一标识
      name: '姓名',       // 显示名称
      type: 'string',     // 类型
      unique: true        // 是否唯一(只能添加一次)
    },
    {
      key: 'class',
      name: '班级',
      type: 'string',
    },
    {
      key: 'age',
      name: '年龄',
      type: 'number',
    },
    {
      key: 'sex',
      name: '性别',
      type: 'select', 
      options: ['男', '女']  // 下拉选项
    },
    {
      key: 'birthday',
      name: '生日',
      type: 'date',
      options: { format: 'YYYY-MM-DD' }
    },
    {
      key: 'address',
      name: '地址',
      type: 'textarea',
      options: { rows: 5 }  // 行数
    },
    {
      key: 'hobby',
      name: '爱好',
      type: 'checkbox',
      options: ['吃饭', '睡觉', '打豆豆']
    },
    {
      key: 'isStudent',
      name: '是否学生',
      type: 'radio',
      options: ['是', '否']
    },
    {
      key: 'family',
      name: '家庭成员',
      type: 'array',
      options: ['s_name', 's_relation']  // 关联 subBlock 的 key
    },
    {
      key: 'tags',
      name: '标签',
      type: 'keyvalue'
    },
  ],
  subBlock: [
    {
      key: 's_name',
      name: '姓名',
      type: 'string',
    },
    {
      key: 's_relation',
      name: '关系',
      type: 'select',
      options: ['父子', '母子', '兄弟', '姐妹']
    }
  ]
}
```

### 支持的类型

| type     | 描述     | options 参数                                             |
| -------- | -------- | -------------------------------------------------------- |
| string   | 文本输入 | -                                                        |
| number   | 数字输入 | -                                                        |
| select   | 下拉选择 | `options: ['选项1', '选项2']`                            |
| date     | 日期选择 | `options: { format: 'YYYY-MM-DD' }`                      |
| textarea | 多行文本 | `options: { rows: 5 }`                                   |
| checkbox | 多选     | `options: ['选项1', '选项2']`                            |
| radio    | 单选     | `options: ['选项1', '选项2']`                            |
| array    | 数组     | `options: ['子字段key1', '子字段key2']`，需配合 subBlock |
| keyvalue | 键值对   | -                                                        |

### 积木块属性

| 属性名  | 类型         | 描述                   |
| ------- | ------------ | ---------------------- |
| key     | string       | 字段唯一标识           |
| name    | string       | 显示名称               |
| type    | string       | 类型                   |
| options | Array/Object | 类型选项               |
| unique  | boolean      | 是否唯一(只能添加一次) |

## theme 主题配置

```js
{
  blockColor: '#4a90d9',      // 积木块背景色
  blockTextColor: '#ffffff', // 积木块文字色
  canvasBg: '#f5f5f5',       // 画布背景色
  errorBg: '#ffebee',        // 错误提示背景色
  buttonColor: '#4a90d9',    // 按钮背景色
  buttonTextColor: '#ffffff',// 按钮文字色
  isDark: false              // 是否暗色主题
}
```

## authority 权限配置

```js
{
  showImport: true,   // 显示导入按钮
  showExport: true,  // 显示导出按钮
  showPreview: true, // 显示预览按钮
  showConfig: true   // 显示底部配置区域
}
```

## 事件

| 事件名            | 参数              | 描述           |
| ----------------- | ----------------- | -------------- |
| update:modelValue | (data: Object)    | 数据变化时触发 |
| change            | (data: Object)    | 数据变化时触发 |
| themeChange       | (isDark: boolean) | 主题切换时触发 |

## 导出方式

### 全量导入
```js
import { BlockCraft } from 'blockcraftjson'

export default {
  components: { BlockCraft }
}
```

### 插件方式
```js
import BlockCraft from 'blockcraftjson'
import { createApp } from 'vue'

const app = createApp(App)
app.use(BlockCraft)
app.mount('#app')
```

然后在模板中使用 `<BlockCraft />`