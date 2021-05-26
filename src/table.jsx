import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import Lineage from './lineage';

const adapter = (data) => {
  return {
    ...data,
    nodes: _.get(data, 'tables', []).map(table => {
      return {
        ...table,
        title: table.name,
        isHide: table.isFold,
        isUnRelItemHidden: table.isUnRelColHide,
        nodeItems: table.columns.map(column => {
          return {
            ...column,
            id: [table.id, column.name].join('@')
          }
        }),
      }
    }),
    edges: _.get(data, 'relations', []).map(relation => {
      const {srcTableId, srcTableColName, tgtTableId, tgtTableColName} = relation;

      return {
        ...relation,
        id: relation.id || [srcTableId, srcTableColName, tgtTableId, tgtTableColName].join('@'),
        srcNodeItemId: [srcTableId, srcTableColName].join('@'),
        tgtNodeItemId: [tgtTableId, tgtTableColName].join('@')
      }
    })
  }
}

// 与表、列相关的概念放在这
const Table = (props) => {

  const p = adapter(props);

  return (
    <Lineage {...p} />
  );
};

Table.propTypes = {
  options: PropTypes.object,
  layout: {
    ranksep: PropTypes.number,                      // 每一层级之间的间距
    nodesep: PropTypes.number,                      // 每一层节点之间上下的距离
  },
  tables: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,                           // 每一个表的 ID
    icon: PropTypes.any,                            // 表头的 icon
    name: PropTypes.string,                         // 表名
    isFold: PropTypes.bool,                         // 是否收起所有列
    isUnRelColHidden: PropTypes.bool,               // 是否收起所有没有关系的列
    columns: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,                       // 列名（英文名，唯一标识）
      icon: PropTypes.string,                       // 列的icon
      title: PropTypes.string,                      // 列的中文名
      onClick: PropTypes.func                       // 点击事件
    })),
    operators: PropTypes.arrayOf(                   
      PropTypes.shape({
        component: PropTypes.element                // 渲染组件
      })
    ),    
  })),
  relations: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,                           // 关系ID，可以没有
    srcTableId: PropTypes.string,                   // 源头表的ID
    tgtTableId: PropTypes.string,                   // 目标表的ID
    srcTableColName: PropTypes.string,              // 源头表列名
    tgtTableColName: PropTypes.string,              // 目标表的列明
  })),
  onTableDoubleClick: PropTypes.func,               // 当某一个表节点被双击时
  onLoaded: PropTypes.func,                         // 当画布加载时，返回发布实例
  onEachFrame: PropTypes.func,                      // 每一帧渲染之后的回调函数
}

export default Table;
