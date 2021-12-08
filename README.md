# 血缘图

> 用于表示表与表之间，表和其他关联实体之间关系的图

![demo preview](https://img.alicdn.com/imgextra/i4/O1CN01ou8wTq20SQv4AnedD_!!6000000006848-1-tps-1337-761.gif)

## ✨ 特性

- 开箱即用的关系图表
- 支持自定义操作、自定义节点事件
- 优雅、自然的交互设计

## 使用

```shell
$ npm install react-lineage-dag # or (yarn add react-lineage-dag)
```

```jsx
import {LineageTable} from 'react-lineage-dag';

const data = {
  tables: [
    {
      id: '1',
      name: 'table-1',
      columns: [
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
      columns: [
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
      columns: [
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
    <LineageTable {...data} />
  )
}
```

## Props

| 属性名 | 属性类型 | 默认值 |  说明 |
| ---- | ---- | ---- | ---- |
| tables | ITable[] | [] | 具体描述位于表格下方 |
| relations | IRelation[] | [] | 具体描述位于表格下方 |
| onTableDoubleClick | Function | noop | 表格双击事件 |
| onLoaded | Function | noop | butterfly加载完毕时 |
| onEachFrame | Function | noop | butterfly每一次数据绘制完毕时重绘 |

```ts
  interface ITable {
    id: string;                 // 表ID
    icon: JSX.Element;          // 表头icon
    name: string;               // 表名（显示名）
    isHide: boolean;            // 是否折叠所有列
    columns: {
      name: string;             // 列英文名（唯一标识）
      icon: string;             // 列icon
      title: string;            // 列显示名
      onClick: () => void;      // 点击回调函数
    }[],
    operators: {
      compent: JSX.Element      // 操作项渲染
    }[]
  }

  interface IRelation {
    id?: string;                 // 关系ID，非必填，建议填写
    srcTableId: string;          // 源表格ID
    tgtTableId: string;          // 目标表格ID
    srcTableColName: string;     // 源表字段名
    tgtTableColName: string;     // 目标表字段名
  }
```

## Dev

```shell
# clone 本项目后
$ make install && npm start
```
