import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import calcPath from './calc_path';
import {NodeTypes, EdgeTypes} from './props';
import NodeComponent from '../com/node-component';

const noop = () => null;

/**
 * 获取锚点和edge的映射
 * @param {EdgeTypes[]} edges
 */
const getEpEdgeMap = (edges) => {
  const map = {};
  for (let edge of edges) {
    const {srcNodeItemId, tgtNodeItemId} = edge;

    map[`${srcNodeItemId}-right`] = true;
    map[`${tgtNodeItemId}-left`] = true;
  }

  return map;
};

/**
 * 从用户传入的数据转换为butterfly-react支持的数据格式
 * @param {NodeTypes} nodes 用户节点
 * @param {String} string activeItemId
 * @return {INode} ref: https://github.com/alibaba/butterfly/blob/master/docs/zh-CN/react.md#%E5%B1%9E%E6%80%A7
 */
export const toNodes = ({
  nodes,
  activeNodeItemIds = [],
  onItemActive = noop,
  onNodeClick = noop,
  onNodeDoubleClick = noop,
  onNodeItemDoubleClick = noop,
  edges = [],
  onEndpointClick = noop,
}) => {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const btfNodes = [];
  const epEdgeMap = getEpEdgeMap(edges);
  PropTypes.checkPropTypes(NodeTypes, nodes[0]);

  nodes.forEach(node => {
    const {nodeItems, id: _id} = node;
    let id = _id;
    if (!id) {
      id = nodeItems[0].info.id;
    }

    if (!nodeItems || nodeItems.length === 0) {
      return;
    }

    btfNodes.push({
      id: id,
      render() {
        return (
          <NodeComponent
            node={node}
            isUnRelItemHidden={node.isUnRelItemHidden}
            onMouseMethod={this.onMouseMethod}
            onDoubleClick={this.onNodeDoubleClick}
            activeNodeItemIds={activeNodeItemIds}
            onItemActive={onItemActive}
            isHidden={node.isHide}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeItemDoubleClick={onNodeItemDoubleClick}
            endpointEdge={epEdgeMap}
            onEndpointClick={onEndpointClick}
          />
        );
      },
    });
  });

  return btfNodes;
};

/**
 * 得到item和node的银蛇
 * @param {NodeTypes} nodes 用户节点
 */
const getItemIdMap = (nodes) => {
  if (!nodes) {
    return {};
  }

  const map = {};

  for (let node of nodes) {
    const {id, nodeItems} = node;

    if (!nodeItems || nodeItems.length === 0) {
      continue;
    }

    for (let item of nodeItems) {
      map[item.id] = id;
    }
  }

  return map;
};

const getNodeIdMap = (nodes) => {
  const nodeIdMap = {};

  for (let node of nodes) {
    nodeIdMap[node.id] = node;
  }

  return nodeIdMap;
};

/**
 * 将用户传入的节点属性转换为ButterflyReact可识别的类型
 * @param {EdgeTypes} edges 用户边
 * @param {NodeTypes} nodes 用户节点
 * @param {String} id 当前active的item的id
 * @return {IEdge} ref: https://github.com/alibaba/butterfly/blob/master/docs/zh-CN/react.md#%E5%B1%9E%E6%80%A7
 */
export const toEdges = ({
  edges,
  nodes,
  activeEdgeIds = [],
}) => {
  if (!edges || edges.length === 0) {
    return [];
  }

  const btfEdges = [];
  const itemNodeMap = getItemIdMap(nodes);
  const nodeIdMap = getNodeIdMap(nodes);

  PropTypes.checkPropTypes(EdgeTypes, edges[0]);

  edges.forEach(edge => {
    let {srcNodeItemId, tgtNodeItemId, isHide} = edge;
    const sourceNodeId = itemNodeMap[srcNodeItemId];
    const targetNodeId = itemNodeMap[tgtNodeItemId];
    if (!edge.id) {
      edge.id = `${srcNodeItemId}@@${tgtNodeItemId}`;
    }

    const sourceNode = nodeIdMap[sourceNodeId];
    const targetNode = nodeIdMap[targetNodeId];

    if (!targetNodeId || !sourceNodeId) {
      console.warn(`边(${srcNodeItemId}->${targetNodeId})找不到对应节点，无法渲染！`);
      return;
    }

    // 隐藏的节点将线直接连到节点上
    if (sourceNode.isHide) {
      srcNodeItemId = sourceNodeId;
    }

    if (targetNode.isHide) {
      tgtNodeItemId = targetNodeId;
    }

    let isActive = activeEdgeIds.includes(edge.id) || edge.isActive;

    const edgeItem = {
      id: srcNodeItemId + tgtNodeItemId,
      sourceNode: sourceNodeId,
      targetNode: targetNodeId,
      source: srcNodeItemId + '-right',
      target: tgtNodeItemId + '-left',
      isActive,
      type: 'endpoint',
      calcPath,
      className: classnames({
        'lineage-edge-hover-active': isActive,
        'lineage-edge-content': !!isActive,
        'lineage-edge-hide': isHide
      }),
      labelRender: () => null
    };

    btfEdges.push(edgeItem);
  });

  return btfEdges;
};

/**
 * 算出所有被激活的边和点
 * @param {NodeTypes[]} nodes
 * @param {NodeTypes[]} edges
 * @param {String} activeItemId
 */
export const getActiveThings = ({
  edges, activeItemId
}) => {
  const activeNodeItemIds = [activeItemId];
  const activeEdgeIds = [];

  if (!activeItemId) {
    return {
      activeNodeItemIds: [],
      activeEdgeIds
    };
  }

  const findBefore = (activeId) => {
    for (let edge of edges) {
      if (edge.tgtNodeItemId === activeId) {
        activeNodeItemIds.push(edge.srcNodeItemId);
        activeEdgeIds.push(edge.id);
        findBefore(edge.srcNodeItemId);
      }
    }
  };

  const findAfter = (activeId) => {
    for (let edge of edges) {
      if (edge.srcNodeItemId === activeId) {
        activeNodeItemIds.push(edge.tgtNodeItemId);
        activeEdgeIds.push(edge.id);

        findAfter(edge.tgtNodeItemId);
      }
    }
  };

  findBefore(activeItemId);
  findAfter(activeItemId);

  return {
    activeNodeItemIds,
    activeEdgeIds
  };
};
