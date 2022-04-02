import {Canvas, Layout} from 'butterfly-dag';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import * as _ from 'lodash';

export default class LineageCanvas extends Canvas {
  constructor(opts) {
    super(opts);
  }
  _precollide = (nodes, nodestep) => {
    
    const rank = {};
    const after = {};
  
    for (let node of nodes) {
      if (!rank[node.left]) {
        rank[node.left] = [];
        rank[node.left].push(node);
      } else {
        rank[node.left].push(node);
      }
    }
  
    // 保证统一层级上的节点，排序是不变的，利用order进行从大到小排序
    Object.keys(rank).forEach(level => {
      let rnodes = rank[level];
      const xys = rnodes.sort((a, b) => a.top - b.top).map(n => [n.left, n.top]);
  
      rnodes = rnodes.sort((a, b) => a.order - b.order)
  
      rank[level].forEach((node, ind) => {
        node.left = xys[ind][0];
        node.top = xys[ind][1];
      });
    });
  
    // 同一个x轴上的节点
    Object.keys(rank).forEach(level => {
      let rnodes = rank[level];
      if (rnodes.length === 1) {
        return;
      }
  
      // 从小到大排序
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
  
    Object.keys(rank).forEach(level => {
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
  relayout(options) {
    let nodes = this.nodes;
    let edges = this.edges;
    let nodesData = nodes.map((item, index) => {
      return _.assign({
        left: item.left,
        top: item.top,
        order: index,
      } , item.options);
    });
    let edgesData = edges.map((item) => {
      return {
        source: item.sourceNode.id,
        target: item.targetNode.id
      }
    });

    const NODESTEP = 50;

    Layout.dagreLayout({
      rankdir: 'LR',
      nodesep:  NODESTEP,
      ranksep:  70,
      data: {
        nodes: nodesData,
        edges: edgesData
      }
    });

    // 调整darge后的位置
    this._precollide(nodesData, NODESTEP);

    // 调整相对节点的坐标
    if (options && options.centerNodeId) {
      this._fixCenterNode(nodesData, options.centerNodeId);
    }

    if (edges.length > 30) {
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


    if (edges.length > 30) {
      $(this.svg).css('visibility', 'visible');
    }
  }
}