'use strict';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import './index.less';
import 'butterfly-dag/dist/index.css';
import * as _ from 'lodash';
import LineageCanvas from './canvas/canvas';
import {transformInitData, transformEdges, diffPropsData, updateCanvasData, diffActionMenuData} from './adaptor';
import ActionMenu, {action} from './component/action-menu';

interface ComProps {
  width?: number | string,
  height?: number | string,
  tables: Array<ITable>,
  relations: Array<IRelation>,
  className?: string,
  actionMenu: action[],                              // action菜单
  config?: {
    titleRender: (node:ITable) => void,              // 自定义节点的title render
    showActionIcon?: boolean,                        // 是否展示操作icon：放大，缩小，聚焦
    enableHoverChain: boolean,                       // 是否开启hover高亮血缘链路
    minimap?: {                                      // 是否开启缩略图
      enable: boolean,
      config: {
        nodeColor: any
      }
    },
    gridMode: {
      isAdsorb: boolean,
      theme: {
        shapeType: string,                          // 展示的类型，支持line & circle
        gap: number,                                // 网格间隙
        lineWidth: 1,                               // 线段粗细
        lineColor: string,                          // 线段颜色
        circleRadiu: number,                        // 圆点半径
        circleColor: string                         // 圆点颜色
      }
    },
    butterfly: any;                                 // 小蝴蝶的画布配置，参考：https://github.com/alibaba/butterfly/blob/dev/v4/docs/zh-CN/canvas.md
  },
  emptyContent?: string | JSX.Element,
  emptyWidth?: number | string,
  centerId?: string,
  onChange(data: any): void,
  onLoaded(canvas: any): void
}

interface ITable {
  id: string;                    // 表ID
  name: string;                  // 表名（显示名）
  isCollapse: boolean;           // 是否折叠所有列
  fields: Array<columns>         // colums
}

interface IRelation {
  id?: string;                 // 关系ID，非必填，建议填写
  srcTableId: string;          // 源表格ID
  tgtTableId: string;          // 目标表格ID
  srcTableColName: string;     // 源表字段名
  tgtTableColName: string;     // 目标表字段名
}

// 跟antd的table的column的概念类似
interface columns {
  key: string,
  width?: number,
  primaryKey: boolean,
  render?(text: any, record: any, index: number): void
}


export default class LineageDag extends React.Component<ComProps, any> {
  props: any;
  protected canvas: any;
  protected canvasData: any;
  protected originEdges: any;
  constructor(props: ComProps) {
    super(props);
    this.canvas = null;
    this.canvasData = null;
    this.originEdges = [];
  }
  componentDidMount() {
    let root = ReactDOM.findDOMNode(this) as HTMLElement;

    let enableHoverChain = _.get(this.props, 'config.enableHoverChain', true);
    let titleRender = _.get(this.props, 'config.titleRender');

    let result = transformInitData({
      tables: this.props.tables,
      relations: this.props.relations,
      columns: this.props.columns,
      operator: this.props.operator,
      _titleRender: titleRender,
      _enableHoverChain: enableHoverChain,
      _emptyContent: this.props.emptyContent,
      _emptyWidth: this.props.emptyWidth
    });

    this.originEdges = result.edges;

    result = transformEdges(result.nodes, _.cloneDeep(result.edges));
    this.canvasData = {
      nodes: result.nodes,
      edges: result.edges
    };

    let canvasObj = {
      root: root,
      disLinkable: false,
      linkable: false,
      draggable: false,
      zoomable: true,
      moveable: true,
      theme: {
        edge: {
          type: 'endpoint',
          // shapeType: 'AdvancedBezier', 
          arrow: true,
          isExpandWidth: true,
          arrowPosition: 1,
          arrowOffset: -13
        },
        endpoint: {
          limitNum: undefined,
          expandArea: {
            left: 0,
            right: 0,
            top: 0,
            botton: 0
          }
        }
      },
      data: {
        enableHoverChain: enableHoverChain
      }
    };

    this.canvas = new LineageCanvas(canvasObj);
    
    setTimeout(() => {
      let tmpEdges = result.edges;
      result.edges = [];
      // this.canvas.wrapper.style.visibility = 'hidden';
      this.canvas.draw(result, () => {
        this.canvas.relayout({
          edges: tmpEdges.map((item) => {
            return {
              source: item.sourceNode,
              target: item.targetNode
            }
          })
        }, true);
        // this.canvas.wrapper.style.visibility = 'visible';
        this.canvas.addEdges(tmpEdges, true);

        let minimap = _.get(this, 'props.config.minimap', {});

        const minimapCfg = _.assign({}, minimap.config, {
          events: [
            'system.node.click',
            'system.canvas.click'
          ]
        });

        if (minimap && minimap.enable) {
          this.canvas.setMinimap(true, minimapCfg);
        }

        if (_.get(this, 'props.config.gridMode')) {
          this.canvas.setGridMode(true, _.assign({}, _.get(this, 'props.config.gridMode', {})))
        }

        this.canvas.focusCenterWithAnimate();

        this.forceUpdate();
        this.props.onLoaded && this.props.onLoaded(this.canvas);
      });
      this.canvas.on('system.node.click', (data) => {
        let node = data.node;
        this.canvas.focus(node.id);
      });
      this.canvas.on('system.canvas.click', () => {
        this.canvas.unfocus();
      });
    }, _.get(this.props, 'config.delayDraw', 0));

  }
  shouldComponentUpdate (newProps: ComProps, newState: any) {

    let enableHoverChain = _.get(newProps, 'config.enableHoverChain', true);
    let titleRender = _.get(this.props, 'config.titleRender');

    let result = transformInitData({
      tables: newProps.tables,
      relations: newProps.relations,
      columns: this.props.columns,
      operator: this.props.operator,
      _titleRender: titleRender,
      _enableHoverChain: enableHoverChain,
      _emptyContent: this.props.emptyContent,
      _emptyWidth: this.props.emptyWidth
    });

    this.originEdges = result.edges;

    result = transformEdges(result.nodes, _.cloneDeep(result.edges));
    let diffInfo = diffPropsData(result, this.canvasData);
    let isNeedRelayout = false;

    if (diffInfo.rmEdges.length > 0) {
      this.canvas.removeEdges(diffInfo.rmEdges.map(edge => edge.id));
      isNeedRelayout = true;
    }

    if (diffInfo.rmNodes.length > 0) {
      this.canvas.removeNodes(diffInfo.rmNodes.map((item) => item.id));
    }

    if (diffInfo.addNodes.length > 0) {
      this.canvas.addNodes(diffInfo.addNodes);
    }

    if (diffInfo.collapseNodes.length > 0) {
      diffInfo.collapseNodes.forEach((item) => {
        let node = this.canvas.getNode(item.id);
        node.collapse(item.isCollapse);
      });
      isNeedRelayout = true;
    }

    if (diffInfo.addEdges.length > 0) {
      this.canvas.addEdges(diffInfo.addEdges);
      isNeedRelayout = true;
    }

    if (isNeedRelayout) {
      this.canvas.relayout({
        centerNodeId: newProps.centerId
      });
      setTimeout(() => {
        if (newProps.centerId) {
          this.canvas.focusNodeWithAnimate(newProps.centerId, 'node' , {
            keepPreZoom: true
          });
          this.canvas.focus(newProps.centerId);
        }  
      }, 50);
    } 

    this.canvasData = result;

    updateCanvasData(result.nodes, this.canvas.nodes);

    // action菜单有更新需要react的update机制更新
    let isNeedUpdate = diffActionMenuData(newProps.actionMenu, this.props.actionMenu);

    return isNeedUpdate;
  }
  render() {
    const {canvas} = this;
    const {actionMenu = []} = this.props;
    const actionMenuVisible = _.get(this, 'props.config.showActionIcon', true);

    return (
      <div
        className={this._genClassName()}
      >
        <ActionMenu 
          canvas={canvas}
          actionMenu={actionMenu}
          visible={actionMenuVisible}
        />
      </div>
    )
  }
  _genClassName() {
    let classname = '';
    if (this.props.className) {
      classname = this.props.className + ' butterfly-lineage-dag';
    } else {
      classname = 'butterfly-lineage-dag';
    }
    return classname;
  }
}