# 血缘图

> 用于表示表与表之间，表和其他关联实体之间关系的图

![demo preview](https://img.alicdn.com/imgextra/i4/O1CN01ou8wTq20SQv4AnedD_!!6000000006848-1-tps-1337-761.gif)

[English](./README.en-US.md) | 简体中文

## ✨ 特性

- 开箱即用的关系图表
- 支持自定义操作、自定义节点事件
- 优雅、自然的交互设计

## 使用

```shell
$ npm install react-lineage-dag@2.x
```


```jsx

import LineageDag from 'react-lineage-dag';
// 需要引入样式
import 'react-lineage-dag/dist/index.css';

const data = {
  tables: [
    {
      id: '1',
      name: 'table-1',
      fields: [
        {
          name: 'id',
          title: 'id'
        },
        {
          name: 'age',
          title: 'age'
        }
      ]
    },
    {
      id: '2',
      name: 'table-2',
      fields: [
        {
          name: 'id',
          title: 'id'
        },
        {
          name: 'age',
          title: 'age'
        }
      ]      
    },
    {
      id: '3',
      name: 'table-3',
      fields: [
        {
          name: 'id',
          title: 'id'
        },
        {
          name: 'age',
          title: 'age'
        }
      ]      
    }    
  ],
  relations: [
    {
      srcTableId: '1',
      tgtTableId: '2',
      srcTableColName: 'id',
      tgtTableColName: 'age'
    },
    {
      srcTableId: '1',
      tgtTableId: '3',
      srcTableColName: 'id',
      tgtTableColName: 'age'
    }
  ]
}

const App = () => {
  return (
    <LineageDag {...data} />
  )
}
```

## Props

| 属性名 | 属性类型 | 默认值 |  说明 |
| ---- | ---- | ---- | ---- |
| width | number | 100% | 画布宽度 |
| height | number | 100% | 画布高度 |
| tables | ITable[] | [] | 节点数据，具体描述位于表格下方 |
| relations | IRelation[] | [] | 线段数据，具体描述位于表格下方 |
| column | column[] | [] | 列的属性配置(和antd table的column概念相似)，具体描述位于表格下方 |
| centerId | string | undefined | 中心点，当中心点发生变化时，画布会聚焦此中心点 |
| operator | operator[] | [] | 每个节点上的操作按钮渲染配置，具体描述位于表格下方 |
| className | string | undefined | 画布类名 |
| actionMenu | action[] | [] | 右上角操作按钮(放大、缩小、居中)，具体描述位于表格下方 |
| config | config | {} | 画布配置，具体描述位于表格下方 |
| onLoaded | Function | noop | butterfly加载完毕时 |

```ts
  interface ITable {
    id: string;                 // 表ID
    name: string;               // 表名（显示名）
    isCollapse: boolean;        // 是否折叠所有列
    fields: []                  // 列数据
  }

  interface IRelation {
    id?: string;                 // 关系ID，非必填，建议填写
    srcTableId: string;          // 源表格ID
    tgtTableId: string;          // 目标表格ID
    srcTableColName: string;     // 源表字段名
    tgtTableColName: string;     // 目标表字段名
  }

  interface operator {
    id: string;                  // 按钮唯一标识
    name: string;                // 按钮中文名
    icon: JSX.Element            // 操作项渲染
    onClick: (node: any): void   // 按钮点击事件
  }

  interface column {
    key: string,                                              // 列的唯一标识
    width?: number,                                           // 列的宽度
    primaryKey: boolean,                                      // 这列的key对应的value是否作为键值对,与antd中的column的primaryKey概念对应
    render?(text: any, record: any, index: number): void      // 列渲染的方法
  }

  interface config {
    delayDraw: number; // 延迟渲染，此组件一定要确保画布容器渲染(包括动画执行)完毕才能渲染,否则坐标都产生偏移,如：antd的
    titleRender?: (title: string, node:any) => void; // 自定义节点的title render
    showActionIcon?: boolean,                        // 是否展示操作icon：放大，缩小，聚焦
    enableHoverChain: boolean,                       // 是否开启hover高亮链路
    enableHoverAnimate: boolean,                     // 是否开启hover高亮血缘链路带动画
    minimap?: {                                      // 是否开启缩略图
      enable: boolean,
      config: {
        nodeColor: any
      }
    }
  }
```

## Dev

```shell
# clone 本项目后
$ npm install
$ cd example
$ npm install
$ npm start
```