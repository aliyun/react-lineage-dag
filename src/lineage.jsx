import React, {useState, useEffect, useRef} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import ReactButterfly from 'butterfly-react';

import dagreLayout from './util/layout';
import focusNode from './util/focus_node';
import {NodeTypes, EdgeTypes} from './util/props';
import {toNodes, toEdges, getActiveThings} from './util/util';

import './index.less';

const defaultOptions = {
  theme: {
    edge: {
      arrow: false
    }
  }
};

const constOption = {
  disLinkable: false, // 可删除连线
  linkable: false,    // 可连线
  draggable: false,   // 可拖动
  zoomable: true,    // 可放大
  moveable: true,    // 可平移
  ranker: 'tight-tree'
};

const noop = () => null;
let baseZIndex = 10;

const LineageDag = (props) => {
  const {
    nodes = [], edges = [], onNodeDoubleClick = noop,
    onNodeItemDoubleClick = noop, onLoaded = noop, layout = {},
    onEndpointClick = noop
  } = props;
  const canvasRef = useRef(null);
  const [btfEdges, setBtfEdges] = useState([]);
  const [btfNodes, setBtfNodes] = useState([]);
  const [relayout, setRelayout] = useState(false);

  const options = _.merge(
    {},
    defaultOptions,
    props.options,
    constOption,
    {
      layout: dagreLayout({
        ranksep: layout.ranksep,
        nodesep: layout.nodesep,
      }),
    }
  );

  // 画布初始化
  const onCvsLoaded = (canvas) => {
    canvasRef.current = canvas;
    onLoaded(canvas);

    canvas.focusNode = (nodeId, options) => {
      const node = canvas.getNode(nodeId);
      focusNode(node, options, canvas);
    };

    setTimeout(() => {
      canvas.relayout();
      canvas.focusCenterWithAnimate();
    }, 100);
  };

  /**
   * 响应边和item的高亮时间
   * @param {String} itemId item的id
   */
  const onItemActive = _.debounce((itemId) => {
    const canvas = canvasRef.current;
    const {activeEdgeIds, activeNodeItemIds} = getActiveThings({
      edges,
      activeItemId: itemId
    });

    setBtfNodes(
      toNodes(
        {
          ...nodeOptions,
          activeNodeItemIds,
          onEndpointClick,
        }
      )
    );

    const btfEdges = toEdges(
      {
        ...edgeOptions,
        activeEdgeIds
      }
    );

    const activeEdges = [];
    btfEdges.forEach(edge => {
      const edgeId = edge.id;
      if (edge.isActive) {
        const e = canvas.getEdge(edgeId);
        if (e) {
          activeEdges.push(e);
        }
      }
    });

    canvas.setEdgeZIndex(activeEdges, baseZIndex);
    baseZIndex++;

    setBtfEdges(btfEdges);
  }, 100);

  /**
   * 节点展开收起逻辑
   *   收起某一个节点时：
   *    1. 只收起当前节点
   *   展开某一个节点时：
   *    1. 一个节点展开时，其他两侧的节点也需要展开
   *    2. 一个节点展开时，我们只计算他的item的边，收起只计算他的node的边
   */
  const nodeOptions = {
    nodes,
    edges,
    onItemActive,
    onNodeDoubleClick,
    onNodeItemDoubleClick,
    onEndpointClick,
  };

  const edgeOptions = {
    edges,
    nodes,
  };

  useEffect(() => {
    if (nodes.length === 0) {
      return;
    }

    setBtfNodes(toNodes(nodeOptions));
    setBtfEdges(toEdges(edgeOptions));
  }, [nodes, edges, nodes.length, edges.length]);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    setRelayout(true);
  }, [nodes.length]);

  if (nodes.length === 0 || btfNodes.length === 0) {
    return null;
  }

  return (
    <div className="lineage_dag">
      <ReactButterfly
        nodes={btfNodes}
        edges={btfEdges}
        options={options}
        onLoaded={onCvsLoaded}
        onEachFrame={() => {
          if (relayout) {
            canvasRef.current.relayout();
            setRelayout(false);
          }

          props.onEachFrame();
        }}
      />
    </div>
  );
};

LineageDag.propTypes = {
  options: PropTypes.object,                // 小蝴蝶画布属性，参考：https://github.com/alibaba/butterfly/blob/master/docs/zh-CN/canvas.md#%E5%B1%9E%E6%80%A7
  layout: {
    ranksep: PropTypes.number,
    radius: PropTypes.number
  },
  nodes: PropTypes.arrayOf(NodeTypes),      // 节点
  edges: PropTypes.arrayOf(EdgeTypes),      // 边类型
  onNodeDoubleClick: PropTypes.func,        // 双击某个节点
  onNodeItemDoubleClick: PropTypes.func,    // 双击某个字段
  onLoaded: PropTypes.func,                 // 小蝴蝶加载完时调用
  onEachFrame: PropTypes.func,              // 每一帧画完之后
  onEndpointClick: PropTypes.func,          // 锚点单击事件
};

export default LineageDag;

