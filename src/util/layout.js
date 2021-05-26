import $ from 'jquery';
import dagre from 'dagre';

const defaultParams = {
  rankdir: 'LR',
  ranksep: 150,
  graph: 'tight-tree',
  height: 10000,
  width: 10000,
};

const DEFAULT_NODE_SEP = 50;

/**
 * y轴防碰撞检测，由于dagre算法要求的节点高度是固定的
 * 所以计算的时候，对于同一个y轴上的节点，可能会出现节点碰撞的问题
 * @param {Object} _nodes graph 输出的节点
 *                - x {Number}
 *                - y {Number}
 *                - height {Number}
 *                - width {Number}
 * @param {Number} nodestep 每个节点之间的距离
 */
const precollide = (_nodes, nodestep) => {
  const nodes = [];
  const rank = {};
  const after = {};

  Object.keys(_nodes).forEach(key => {
    nodes.push({
      id: key,
      ..._nodes[key]
    });
  });

  for (let node of nodes) {
    if (!rank[node.x]) {
      rank[node.x] = [];
      rank[node.x].push(node);
    } else {
      rank[node.x].push(node);
    }
  }

  // 保证统一层级上的节点，排序是不变的，利用order进行从大到小排序
  Object.keys(rank).forEach(level => {
    let rnodes = rank[level];
    const xys = rnodes.sort((a, b) => a.y - b.y).map(n => [n.x, n.y]);

    rnodes = rnodes.sort((a, b) => a.order - b.order)

    rank[level].forEach((node, ind) => {
      node.x = xys[ind][0];
      node.y = xys[ind][1];
    });
  });

  // 同一个x轴上的节点
  Object.keys(rank).forEach(level => {
    let rnodes = rank[level];
    if (rnodes.length === 1) {
      return;
    }

    // 从小到大排序
    rnodes = rnodes.sort((a, b) => a.y - b.y);

    for (let i = 0; i < rnodes.length - 1; i++) {
      const current = rnodes[i];
      const next = rnodes[i + 1];

      if ((current.y + current.height) >= next.y) {
        next.y = (current.y + current.height) + nodestep;
      }

      if((current.y + current.height + nodestep) < next.y) {
        next.y = current.y + current.height + nodestep;
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
};

// drage布局
const drageLayout = (parmas) => ({height, width, data}) => {
  const {nodesep = DEFAULT_NODE_SEP} = parmas;
  const graphParams = Object.assign(
    {},
    defaultParams,
    {
      ranksep: parmas.ranksep || 150
    }
  );

  graphParams.center = [width / 2, height / 2];

  const edges = data.edges;
  const curnode = data.nodes;

  const nodes = curnode.map((item) => {
    return {
      id: item.id,
      top: item.top,
      left: item.left,
      size: item.dom ? [$(item.dom).width(), $(item.dom).height()] : [40, 40]
    };
  });

  // 形成新数组后布局失效
  if (!nodes) {
    return;
  }
  

  const g = new dagre.graphlib.Graph();

  nodes.forEach((node, index) => {
    const size = node.size;

    const width = size[0];
    const height = size[1];
    g.setNode(node.id, {
      width,
      height,
      x: node.left,
      y: node.top,
      order: index
    });
  });

  edges.forEach(edge => {
    // dagrejs Wiki https://github.com/dagrejs/dagre/wiki#configuring-the-layout
    g.setEdge(
      edge.sourceNode.id,
      edge.targetNode.id,
      {
        weight: edge.weight || 1
      }
    );
  });

  g.setGraph(graphParams);
  dagre.layout(g);
  let coord;

  g._nodes = precollide(g._nodes, nodesep);

  // 重新布局时g.nodes()可能为undefined
  g.nodes().forEach((node) => {
    coord = g.node(node);
    if (!coord) {
      return;
    }

    const i = nodes.findIndex(it => it.id === node);
    nodes[i].left = coord.x;
    nodes[i].top = coord.y;
  });

  // 将数据挂载到原有数据上，以触发布局
  nodes.forEach((item, index) => {
    curnode[index].left = item.left;
    curnode[index].top = item.top;
  });
}

export default drageLayout;

