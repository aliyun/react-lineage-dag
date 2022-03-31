import {Node} from 'butterfly-dag';
import * as ReactDOM from 'react-dom';
import $ from 'jquery';
import * as _ from 'lodash';

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
  }
  mounted() {
    // 生成field的endpoint
    this._createNodeEndpoint();
  }
  draw(obj) {
    let _dom = obj.dom;
    if (!_dom) {
      _dom = $('<div></div>')
        .attr('class', 'node table-node')
        .attr('id', obj.name);
    }

    const node = $(_dom);
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
  _createTableName(container = $(this.dom)) {
    let title = _.get(this, 'options.name');
    let titleRender = _.get(this, 'options.titleRender');
    let operator = _.get(this, 'options._operator');
    let titleCom = $('<div class="title-con"></div>');
    let titleDom = null;

    // 渲染title
    if (titleRender) {
      titleDom = $(`<div class="title"></div>`);
      ReactDOM.render(titleRender(title), titleDom[0]);
    } else if (title) {
      titleDom = $(`<div class="title">${title}</div>`);
      titleDom.css({
        'height': this.TITLE_HEIGHT + 'px',
        'line-height': this.TITLE_HEIGHT + 'px'
      });
    }
    titleCom.append(titleDom);

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
    }])

    $(container).append(titleCom);
  }
  _createFields(container = $(this.dom)) {
    let fields = _.get(this, 'options.fields');
    let columns = _.get(this, 'options._columns');
    let isCollapse = _.get(this, 'options.isCollapse');
    let _primaryKey = columns[0].key;
    let result = [];

    if (fields && fields.length) {
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

        let leftPoint = $('<div class="point left-point"></div>');
        let rightPoint = $('<div class="point right-point"></div>');
        fieldDom.append(leftPoint).append(rightPoint);

        if (!isCollapse) {
          container.append(fieldDom);
        }

        result.push({
          id: _field[_primaryKey],
          dom: fieldDom
        });
      });

      this.fieldsList = this.fieldsList.concat(result);
    } else {
      const _emptyContent = _.get(this.options, '_emptyContent');
      const noDataTree = emptyDom({
        content: _emptyContent,
        width: this.options._emptyWidth
      });
      container.append(noDataTree);
      this.height = $(container).outerHeight();
    }

    return result;
  }
  _createNodeEndpoint() {
    // 给节点add endpoint
    this.titlesList.forEach((item) => {
      this.addEndpoint({
        id: item.id,
        orientation: item.type === 'target' ? [-1,0] : [1,0],
        dom: item.dom,
        originId: this.id,
        type: item.type
      });
    });
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
    });
  }
}