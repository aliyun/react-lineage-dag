import {Canvas, Layout} from 'butterfly-dag';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import * as _ from 'lodash';

export default class LineageCanvas extends Canvas {
  constructor(opts) {
    super(opts);
    this._renderPromise = Promise.resolve();
    this._focusItem = null;
    this._enableHoverChain = opts.data.enableHoverChain;
    this.attachEvent();
  }
  attachEvent() {
    if (this._enableHoverChain) {
      this.on('custom.field.hover', (data) => {
        this.focusChain(data.node.id, data.fieldId, 'hover-chain');
      });
      this.on('custom.field.unHover', (data) => {
        this.unfocusChain(data.node.id, data.fieldId, 'hover-chain');
      });
    }
    this.on('custom.edge.redraw', (data) => {
      let node = data.node;
      let points = data.points;
      let edges = [];
      if (points) {
        points.forEach((_point) => {
          edges = edges.concat(this.getNeighborEdgesByEndpoint(node.id, _point.id));
        });
      } else {
        edges = this.getNeighborEdges(node.id);
      }
      edges.forEach((edge) => edge.redraw());
    });
  }
  focus(nodeId) {
    this.unfocus();
    let node = this._focusItem = this.getNode(nodeId);
    node && node.focus();
  }
  unfocus() {
    if (this._focusItem) {
      this._focusItem.unfocus();
      this._focusItem = null;
    }
  }
  focusChain(nodeId, fieldId, addClass) {
    let chain = this._findChain(nodeId, fieldId);
    chain.edges.forEach((item) => {
      item.focusChain(addClass);
    });
    chain.fileds.forEach((item) => {
      $(item).addClass(addClass);
    });
  }
  unfocusChain(nodeId, fieldId, rmClass) {
    let chain = this._findChain(nodeId, fieldId);
    chain.edges.forEach((item) => {
      item.unfocusChain(rmClass);
    });
    chain.fileds.forEach((item) => {
      $(item).removeClass(rmClass);
    });
  }
  _findChain(nodeId, fieldId) {
    let resultEdges = [];
    let resultFields = [];

    let queue = [{nodeId, fieldId, type: 'both'}];
    while(queue.length > 0) {
      let item = queue.pop();
      let node = this.getNode(item.nodeId);
      if (node.options.isCollapse) {
        continue;
      }
      let field = _.find(node.fieldsList, (_item) => {
        return _item.id === item.fieldId; 
      });
      resultFields.push(field.dom);
      let edges = this.getNeighborEdges(node.id);
      let sourceEdges = [], targetEdges = [];
      if (item.type === 'both' || item.type === 'source') {
        sourceEdges = edges.filter((_item) => {
          return _item.options.sourceNode === node.id && _item.options.source === `${item.fieldId}-right`;
        });
      }
      if (item.type === 'both' || item.type === 'target') {
        targetEdges = edges.filter((_item) => {
          return _item.options.targetNode === node.id && _item.options.target === `${item.fieldId}-left`;
        });
      }

      resultEdges = resultEdges.concat(sourceEdges).concat(targetEdges);
      
      sourceEdges.forEach((_item) => {
        queue.push({
          nodeId: _item.options.targetNode,
          fieldId: _item.options.target.replace('-left', ''),
          type: 'source'
        });
      });

      targetEdges.forEach((_item) => {
        queue.push({
          nodeId: _item.options.sourceNode,
          fieldId: _item.options.source.replace('-right', ''),
          type: 'target'
        });
      });
    }

    return {
      edges: resultEdges,
      fileds: resultFields
    }
  }
  _precollide = (nodes, nodestep, rankstep) => {
    const rank = {};
    let rankKeys = [];
    const after = {};
  
    for (let node of nodes) {
      if (!rank[node.left]) {
        rank[node.left] = [];
        rank[node.left].push(node);
      } else {
        rank[node.left].push(node);
      }
    }

    rankKeys = Object.keys(rank).sort((a, b) => parseInt(a) - parseInt(b));
  
    // 保证统一层级上的节点，排序是不变的，利用order进行从大到小排序
    rankKeys.forEach(level => {
      let rnodes = rank[level];
      const xys = rnodes.sort((a, b) => a.top - b.top).map(n => [n.left, n.top]);
  
      rnodes = rnodes.sort((a, b) => a.order - b.order)
  
      rank[level].forEach((node, ind) => {
        node.left = xys[ind][0];
        node.top = xys[ind][1];
      });
    });
    
    let maxRank = {};
    // 同一个x轴上的节点
    rankKeys.forEach(level => {

      let rnodes = rank[level];
      maxRank[level] = 0;

      for(let i = 0; i < rnodes.length; i++) {
        maxRank[level] = Math.max(maxRank[level], rnodes[i].left + rnodes[i].width + rankstep);
      }

      if (rnodes.length === 1) {
        return;
      }
  
      // 从小到大排序，调整上下位置
      rnodes = rnodes.sort((a, b) => a.top - b.top);
  
      for (let i = 0; i < rnodes.length - 1; i++) {
        
        const current = rnodes[i];
        const next = rnodes[i + 1];
  
        if ((current.top + current.height) >= next.top) {
          next.top = (current.top + current.height) + nodestep;
        }
  
        if((current.top + current.height + nodestep) < next.top) {
          next.top = current.top + current.height + nodestep;
        }
      }
    });

    // 调整左右位置  
    for(let i = 0; i < rankKeys.length - 1; i++) {
      let currentKey = rankKeys[i];
      let nextKey = rankKeys[i + 1];
      let nextLeft = _.get(rank, [nextKey, 0, 'left'], nextKey);
      if (nextLeft - maxRank[currentKey] < rankstep) {
        rank[nextKey].forEach(function (item) {
          item.left = maxRank[currentKey] + rankstep;
        });
        let _tmpGap = maxRank[currentKey] + rankstep - nextLeft;
        maxRank[nextKey] += _tmpGap;
      }
    }
  
    rankKeys.forEach(level => {
      const ns = rank[level];
      ns.forEach(n => {
        after[n.id] = n;
      });
    });

    return after;
  }
  _fixCenterNode(nodesData, centerNodeId) {
    let node = this.getNode(centerNodeId);
    if (!node) {
      return;
    }
    let targetNode = _.find(nodesData, (item) => item.id === centerNodeId);
    let gapX =  targetNode.left - node.left;
    let gapY = targetNode.top - node.top;
    nodesData.forEach((item) => {
      item.left -= gapX;
      item.top -= gapY;
    })
  }
  relayout(options, isInit) {
    let nodes = this.nodes;
    let edges = this.edges;
    let nodesData = nodes.map((item, index) => {
      return _.assign({
        left: item.left,
        top: item.top,
        order: index,
      } , item.options);
    });
    let edgesData = [];
    if (isInit) {
      edgesData = options.edges || [];
    } else {
      edgesData = edges.map((item) => {
        return {
          source: item.sourceNode.id,
          target: item.targetNode.id
        }
      });
    }

    const NODESTEP = 50;
    const RANKSTEP = 70;

    Layout.dagreLayout({
      rankdir: 'LR',
      nodesep:  NODESTEP,
      ranksep:  RANKSTEP,
      data: {
        nodes: nodesData,
        edges: edgesData
      }
    });

    // 调整darge后的位置
    this._precollide(nodesData, NODESTEP, RANKSTEP);

    // 调整相对节点的坐标
    if (options && options.centerNodeId) {
      this._fixCenterNode(nodesData, options.centerNodeId);
    }

    if (!isInit && edges.length > 30) {
      $(this.svg).css('visibility', 'hidden');
    }

    this.nodes.forEach((item, index) => {
      let newLeft = nodesData[index].left;
      let newTop = nodesData[index].top;
      if (item.top !== newTop || item.left !== newLeft) {
        item.options.top = newTop;
        item.options.left = newLeft;
        item.moveTo(newLeft, newTop);
      }
    });


    if (!isInit && edges.length > 30) {
      $(this.svg).css('visibility', 'visible');
    }
  }
  addNodes(nodes, isNotEventEmit) {
    let _addNodes = super.addNodes(nodes, isNotEventEmit);
    _addNodes.forEach((node) => {
      node._canvas = this;
    });
    return _addNodes;
  }
}