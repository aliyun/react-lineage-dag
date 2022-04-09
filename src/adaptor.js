'use strict';
import TableNode from './canvas/node';
import Edge from './canvas/edge';
import * as _ from 'lodash';

// 初始化数据转换
export let transformInitData = (data) => {
  let {
    tables, relations, columns, emptyContent, operator,
    _titleRender, _enableHoverChain
  } = data;

  let result = {
    nodes: tables.map((item) => {
      return _.assign({
        Class: TableNode,
        _columns: columns,
        _emptyContent: emptyContent,
        _operator: operator,
        _titleRender,
        _enableHoverChain
      }, item);
    }),
    edges: relations.map((item) => {
      return {
        id: item.id || `${item.srcTableId}-${item.tgtTableId}-${item.srcTableColName}-${item.tgtTableColName}`,
        type: 'endpoint',
        sourceNode: item.srcTableId,
        targetNode: item.tgtTableId,
        source: item.srcTableColName,
        target: item.tgtTableColName,
        Class: Edge
      }
    })
  };

  return result;
};

// 由于展开收缩会影响到线段，所以需要对线段进行转换
export let transformEdges = (nodes, edges) => {

  edges.forEach((item) => {
    item.source += '-right';
    item.target += '-left';
  })

  nodes.forEach((node) => {
    if (node.isCollapse) {
      let sourceEdges = edges.filter((item) => {
        return node.id === item.sourceNode;
      });
      sourceEdges.forEach((item) => {
        item.source = `${node.id}-right`;
        item.sourceCollaps = true;
      });
      let targetEdges = edges.filter((item) => {
        return node.id === item.targetNode;
      });
      targetEdges.forEach((item) => {
        item.target = `${node.id}-left`;
        item.targetCollaps = true;
      });
    }
  });

  let edgesObj = {};
  let realEdges = [];

  edges.forEach((item) => {
    edgesObj[`${item.sourceNode}-${item.source}-${item.targetNode}-${item.target}`] = item;
  });

  for (let key in edgesObj) {
    realEdges.push(edgesObj[key]);
  }

  return {
    nodes,
    edges: realEdges
  }
}

export let diffPropsData = (newData, oldData) => {
  const isSameNode = (a, b) => a.id === b.id;
  let addNodes = _.differenceWith(newData.nodes, oldData.nodes, isSameNode);
  let rmNodes = _.differenceWith(oldData.nodes, newData.nodes, isSameNode);

  const isSameEdge = (a, b) => {
    return (
      a.sourceNode === b.sourceNode &&
      a.targetNode === b.targetNode &&
      a.source === b.source &&
      a.target === b.target
    );
  }
  let addEdges = _.differenceWith(newData.edges, oldData.edges, isSameEdge);
  let rmEdges = _.differenceWith(oldData.edges, newData.edges, isSameEdge);

  const isCollapseNodesChange = (a, b) => a.id === b.id && a.isCollapse === b.isCollapse;
  let collapseNodes = _.differenceWith(newData.nodes, oldData.nodes, isCollapseNodesChange);
  collapseNodes = _.differenceWith(collapseNodes, addNodes, isSameNode);

  return {
    addNodes,
    rmNodes,
    addEdges,
    rmEdges,
    collapseNodes,
  };
}

// 'use strict';

// import TableNode from './canvas/node';
// import * as _ from 'lodash';

// export let transformInitData = (data) => {
//   let {
//     columns, sourceColumns, targetColumns,
//     sourceData, targetData,
//     mappingData, type, extraPos,
//     sortable, checkable, emptyContent, emptyWidth,
//     sourceClassName, targetClassName
//   } = data;

//   let _sourceColumns = [];
//   let _targetColumns = [];
//   _sourceColumns = sourceColumns ? sourceColumns : columns;
//   _targetColumns = targetColumns ? targetColumns : columns;

//   const _genNodes = (data, nodeType, comType) => {
//     if (comType === 'single' && data.constructor === Object) {
//       return [_.assign({
//         id: nodeType,
//         type: nodeType,
//         _sourceColumns,
//         _targetColumns,
//         _extraPos: extraPos,
//         Class: TableNode,
//         _emptyContent: emptyContent,
//         _emptyWidth: emptyWidth,
//         _sourceClassName: sourceClassName,
//         _targetClassName: targetClassName,
//         sortable,
//         checkable
//       }, data)];
//     } else if (comType === 'mutiply' && data.constructor === Array) {
//       return data.map((item) => {
//         return _.assign({
//           type: nodeType,
//           _sourceColumns,
//           _targetColumns,
//           _extraPos: extraPos,
//           Class: TableNode,
//           _emptyContent: emptyContent,
//           _emptyWidth: emptyWidth,
//           _sourceClassName: sourceClassName,
//           _targetClassName: targetClassName,
//           sortable,
//           checkable
//         }, item);
//       });
//     }
//   }
//   let sourceNodes = _genNodes(sourceData, 'source', type);
//   let targetNodes = _genNodes(targetData, 'target', type);
//   let edges = mappingData.map((item) => {
//     return {
//       id: `${item.source}-${item.target}`,
//       type: 'endpoint',
//       sourceNode: item.sourceNode || sourceNodes[0].id,
//       source: item.source,
//       targetNode: item.targetNode || targetNodes[0].id,
//       target: item.target
//     }
//   });
//   return {
//     nodes: [].concat(sourceNodes).concat(targetNodes),
//     edges: edges
//   };
// };

// export let transformChangeData = (data, comType) => {
//   let result = {
//     mappingData: [],
//     sourceData: [],
//     targetData: []
//   };
//   let sourceNodes = data.nodes.filter((item) => {
//     return item.options.type === 'source';
//   });
//   let targetNodes = data.nodes.filter((item) => {
//     return item.options.type === 'target';
//   });
//   if (comType === 'single') {
//     let _sourceNode = sourceNodes[0];
//     let _targetNode = targetNodes[0];
//     result.mappingData = data.edges.map((item) => {
//       return {
//         source: item.sourceEndpoint.originId,
//         target: item.targetEndpoint.originId
//       }
//     });
//     result.sourceData = {
//       id: _sourceNode.id,
//       title: _.get(_sourceNode, 'options.title'),
//       fields: _.get(_sourceNode, 'options.fields')
//     };
//     result.targetData = {
//       id: _targetNode.id,
//       title: _.get(_targetNode, 'options.title'),
//       fields: _.get(_targetNode, 'options.fields')
//     };
//   } else if (comType === 'mutiply') {
//     result.mappingData = data.edges.map((item) => {
//       return {
//         sourceNode: item.sourceNode.id,
//         targetNode: item.targetNode.id,
//         source: item.sourceEndpoint.originId,
//         target: item.targetEndpoint.originId
//       }
//     });
//     result.sourceData = sourceNodes.map((item) => {
//       return {
//         id: item.id,
//         title: _.get(item, 'options.title'),
//         fields: _.get(item, 'options.fields')
//       };
//     });
//     result.targetData = targetNodes.map((item) => {
//       return {
//         id: item.id,
//         title: _.get(item, 'options.title'),
//         fields: _.get(item, 'options.fields')
//       };
//     });
//   }
//   return _.cloneDeep(result);
// };

// const getPrimaryKey = (nodeData) => {
//   let primaryKey = nodeData._sourceColumns.filter((obj) => {
//     return obj.primaryKey === true;
//   }).key;

//   // fallback if no primary key set, use first entry
//   if (!primaryKey) {
//     primaryKey = nodeData._sourceColumns[0].key;
//   }
//   return primaryKey;
// };

// export let diffPropsData = (newData, oldData) => {
//   const primaryKey = getPrimaryKey(newData.nodes[0]);

//   const isSameId = (a, b) => a[primaryKey] === b[primaryKey];
//   const isSameCheck = (a, b) => a.id === b.id && a.checked === b.checked;

//   let addNodes = _.differenceWith(newData.nodes, oldData.nodes, isSameId);
//   let rmNodes = _.differenceWith(oldData.nodes, newData.nodes, isSameId);
  

//   let addFields = [];
//   let rmFields = [];
//   let checkedFields = [];
//   newData.nodes.forEach((_newNode) => {
//     let _oldNode = _.find(oldData.nodes, _node => _node.id === _newNode.id);
//     if (_oldNode) {

//       let addResult = _.differenceWith(_newNode.fields, _.get(_oldNode, 'options.fields'), isSameId);
//       let checkResult = _.differenceWith(_newNode.fields, _.get(_oldNode, 'options.fields'), isSameCheck);
//       if (checkResult.length > 0) {
//         checkedFields.push({
//           id: _newNode.id,
//           type: _newNode.type,
//           fields: checkResult
//         });
//       }
//       if (addResult.length > 0) {
//         addFields.push({
//           id: _newNode.id,
//           type: _newNode.type,
//           fields: addResult
//         });
//       }
//     }
//   });
  
//   oldData.nodes.forEach((_oldNode) => {
//     let _newNode = _.find(newData.nodes, _node => _node.id === _oldNode.id);
//     if (_newNode) {
//       let result = _.differenceWith(_.get(_oldNode, 'options.fields'), _newNode.fields, isSameId);
//       if (result.length > 0) {
//         rmFields.push({
//           id: _newNode.id,
//           type: _newNode.type,
//           fields: result
//         });
//       }
//     }
//   });

//   const isSameEdge = (a, b) => {
//     return (
//       a.sourceNode === b.sourceNode &&
//       a.targetNode === b.targetNode &&
//       a.source === b.source &&
//       a.target === b.target
//     );
//   }

//   let addEdges = _.differenceWith(newData.edges, oldData.edges, isSameEdge);
//   let rmEdges = _.differenceWith(oldData.edges, newData.edges, isSameEdge);

//   let result = {
//     addEdges,
//     rmEdges,
//     addNodes,
//     rmNodes,
//     addFields,
//     rmFields,
//     checkedFields
//   };

//   return result;
// };