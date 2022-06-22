import {Node} from 'butterfly-dag';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import * as _ from 'lodash';
import emptyDom from './empty';

export default class TableNode extends Node {
  constructor(opts) {
    super(opts);
    // 标题高度
    this.TITLE_HEIGHT = 34;
    // 每行高度
    this.ROW_HEIGHT = 26;
    // 每列宽度
    this.COLUMN_WIDTH = 60;

    this.fieldsList = [];

    this.titlesList = [];

    this._renderPromise = Promise.resolve();

    this._isRendering = false;
    
  }
  mounted() {
    // 生成field的endpoint
    this._createNodeEndpoint(true);

    this.width = this.options.width = $(this.dom).width();
    this.height = this.options.height = $(this.dom).height();

  }
  draw(obj) {
    let _dom = obj.dom;
    if (!_dom) {
      _dom = $('<div></div>')
        .attr('class', 'node table-node')
        .attr('id', obj.name);
    }

    const node = $(_dom);

    let classname = _.get(this, 'options.classname');
    if (classname) {
      node.addClass(classname)
    }

    // 计算节点坐标
    if (obj.top !== undefined) {
      node.css('top', obj.top);
    }
    if (obj.left !== undefined) {
      node.css('left', obj.left);
    }


    this._createTableName(node); // 表名
    this._createFields(node); // 字段
    return node[0];
  }
  collapse(state) {
    if (state !== this.options.isCollapse) {
      this.options.isCollapse = state;
      if (!state) {
        this._createFields();
        this._createNodeEndpoint();
      } else {
        this.fieldsList.forEach((item) => {
          $(item.dom).off();
        });
        let rmPointIds = this.endpoints.filter((item) => {
          return !item.options._isNodeSelf;
        }).map((item) => {
          return item.id;
        });
        rmPointIds.forEach((item) => {
          this.removeEndpoint(item);
        });
        $(this.dom).find('.field').remove();
        this.fieldsList = [];
      }
      this.width = this.options.width = $(this.dom).width();
      this.height = this.options.height = $(this.dom).height();
    }
  }
  focus() {
    $(this.dom).addClass('focus');
    this.options.minimapActive = true;
  }

  unfocus() {
    $(this.dom).removeClass('focus');
    this.options.minimapActive = false;
  }
  redrawTitle() {
    // $(this.dom).find('.title').remove();
    $(this.dom).find('.operator').remove();
    this._createTableName($(this.dom), true);
  }
  _addEventListener() {
    // todo 做事件代理的形式
    $(this.dom).on('mousedown', (e) => {
      const LEFT_KEY = 0;
      if (e.button !== LEFT_KEY) {
        return;
      }
      if (!['SELECT', 'INPUT', 'RADIO', 'CHECKBOX', 'TEXTAREA'].includes(e.target.nodeName)) {
        e.preventDefault();
      }
      if (this.draggable) {
        this._isMoving = true;
        this.emit('InnerEvents', {
          type: 'node:dragBegin',
          data: this
        });
      } else {
        // 单纯为了抛错事件给canvas，为了让canvas的dragtype不为空，不会触发canvas:click事件
        this.emit('InnerEvents', {
          type: 'node:mouseDown',
          data: this
        });
      }
    });

    $(this.dom).on('click', (e) => {
      // e.preventDefault();
      // e.stopPropagation();
      this.emit('system.node.click', {
        node: this
      });
      this.emit('events', {
        type: 'node:click',
        node: this
      });
    });

    this.setDraggable(this.draggable);
  }
  _createTableName(container = $(this.dom), isUpdate) {
    let title = _.get(this, 'options.name');
    let titleRender = _.get(this, 'options._titleRender');
    let operator = _.get(this, 'options._operator');
    let titleCom = isUpdate ? $(this.dom).find('.title-con') : $('<div class="title-con"></div>');
    let titleDom = isUpdate ? $(this.dom).find('.title') : $('<div class="title"></div>');

    if (this._isRendering) {
      return false;
    }

    // 渲染title
    if (titleRender) {
      this._isRendering = true;
      (this._canvas ? this._canvas._renderPromise : Promise.resolve()).then(() => {
        this._renderPromise = new Promise((resolve, reject) => {
          ReactDOM.render(titleRender(title, this), titleDom[0], () => {
            if (this.height === 0 || this.width === 0) {
              this.width = this.options.width = $(this.dom).width();
              this.height = this.options.height = $(this.dom).height();
              this.endpoints.forEach((item) => item.updatePos());
              this.emit('custom.edge.redraw', {
                node: this
              })
            } else {
              let points = [];
              this.endpoints.forEach((item) => {
                if (item.options._isNodeSelf) {
                  item.updatePos();
                  points.push(item);
                }
              });
              this.emit('custom.edge.redraw', {
                node: this,
                points
              })
            }
            resolve();
            this._isRendering = false;
          });
        });
      });
    } else if (title) {
      titleDom.css({
        'height': this.TITLE_HEIGHT + 'px',
        'line-height': this.TITLE_HEIGHT + 'px'
      });
    }

    if (!isUpdate) {
      titleCom.append(titleDom);
    }

    // 渲染操作按钮
    let operatorDom = null;
    if (operator) {
      operatorDom = $(`<div class="operator"></div>`);
      operator.forEach((item) => {
        let operatorItemDom = $(`<div class="operator-item"></div>`);
        ReactDOM.render(item.icon, operatorItemDom[0]);
        if (item.onClick) {
          operatorItemDom.on('click', item.onClick.bind(this, this.options, this));
        }
        operatorDom.append(operatorItemDom);
      });
      titleCom.append(operatorDom);
    }

    if (!isUpdate) {
      let leftPoint = $('<div class="point left-point"></div>');
      let rightPoint = $('<div class="point right-point"></div>');
      titleCom.append(leftPoint).append(rightPoint);

      this.titlesList = this.titlesList.concat([{
        id: `${this.id}-left`,
        dom: leftPoint[0],
        type: 'target'
      }, {
        id: `${this.id}-right`,
        dom: rightPoint[0],
        type: 'source'
      }]);

      $(container).append(titleCom);
    }
  }
  _createFields(container = $(this.dom)) {
    let fields = _.get(this, 'options.fields');
    let columns = _.get(this, 'options._columns');
    let isCollapse = _.get(this, 'options.isCollapse');
    let _primaryKey = columns[0].key;
    let result = [];

    if (fields && fields.length) {

      if (isCollapse) {
        return;
      }
      
      fields.forEach((_field, index) => {
        let fieldDom = $('<div class="field"></div>');
        fieldDom.css({
          height: this.ROW_HEIGHT + 'px',
          'line-height': this.ROW_HEIGHT + 'px'
        });
        columns.forEach((_col) => {
          if (_col.render) {
            let fieldItemDom = $(`<span class="field-item"></span>`);
            fieldItemDom.css('width', (_col.width || this.COLUMN_WIDTH) + 'px');
            ReactDOM.render(_col.render(_field[_col.key], _field, index), fieldItemDom[0]);
            fieldDom.append(fieldItemDom);
          } else {
            let fieldItemDom = $(`<span class="field-item">${_field[_col.key]}</span>`);
            fieldItemDom.css('width', (_col.width || this.COLUMN_WIDTH) + 'px');
            fieldDom.append(fieldItemDom);
          }
          if (_col.primaryKey) {
            _primaryKey = _col.key;
          }
        });

        let leftPoint = $('<div class="point left-point hidden"></div>');
        let rightPoint = $('<div class="point right-point hidden"></div>');
        fieldDom.append(leftPoint).append(rightPoint);

        if (this.options._enableHoverChain) {
          $(fieldDom).on('mouseover', (e) => {
            this.emit('custom.field.hover', {
              node: this,
              fieldId: _field[_primaryKey]
            });
          });
      
          $(fieldDom).on('mouseout', (e) => {
            this.emit('custom.field.unHover', {
              node: this,
              fieldId: _field[_primaryKey]
            });
          });
        }

        container.append(fieldDom);

        result.push({
          id: _field[_primaryKey],
          dom: fieldDom
        });
      });

      this.fieldsList = this.fieldsList.concat(result);
    } else {
      const _emptyContent = _.get(this.options, '_emptyContent');
      if (_emptyContent) {
        const noDataTree = emptyDom({
          content: _emptyContent,
          width: this.options._emptyWidth
        });
        container.append(noDataTree);
        this.height = $(container).outerHeight();
      }
    }

    return result;
  }
  _createNodeEndpoint(isInit) {
    // 给节点add endpoint
    if (isInit) {
      this.titlesList.forEach((item) => {
        this.addEndpoint({
          id: item.id,
          orientation: item.type === 'target' ? [-1,0] : [1,0],
          dom: item.dom,
          originId: this.id,
          type: item.type,
          _isNodeSelf: true // 标准是节点上的锚点，不是列上的锚点
        });
      });
    }
    // 给字段add endpoint
    this.fieldsList.forEach((item) => {
      this.addEndpoint({
        id: `${item.id}-left`,
        orientation: [-1,0],
        dom: $(item.dom).find('.left-point')[0],
        originId: this.id,
        type: 'target'
      });
      this.addEndpoint({
        id: `${item.id}-right`,
        orientation: [1,0],
        dom: $(item.dom).find('.right-point')[0],
        originId: this.id,
        type: 'source'
      });
      if (this.options.isCollapse) {
        $(item.dom).css({
          'visibility': 'visible',
          'display': 'none'
        });
      }
    });
  }
}