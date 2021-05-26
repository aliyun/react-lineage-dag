import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {Tooltip} from 'antd';

import Icons from '../icons';
import {Endpoint} from 'butterfly-react';
import {NodeTypes} from '../../util/props';

import './index.less';

const noop = () => null;

/**
 * 获取一个锚点
 * @param {String} nodeId 节点的ID
 * @param {String} id 唯一ID
 * @param {String} direction 方向
 * @param {Boolean} visible 是否可见
 */
const getEndpoint = (
  nodeId, id,
  direction, visible = false,
  endpointClassName = '',
  onEndpointClick = noop,
) => {
  return (
    <span
      className={classnames(
        'item-endpoint',
        `item-endpoint-${direction}`,
        {visible},
        `${endpointClassName}`,
      )}
      onClick={() => visible && onEndpointClick(nodeId, direction)}
    >
      <Endpoint
        nodeId={nodeId}
        id={id + `-${direction}`}
        orientation={direction === 'left' ? [-1, 0] : [1, 0]}
      />
    </span>
  );
};


const NodeComponent = (props) => {
  const {
    node,
    onItemActive,
    activeNodeItemIds = [],
    isHidden = false,
    onNodeClick = noop,
    onItemClick = noop,
    onNodeDoubleClick = noop,
    endpointEdge = {},
    isUnRelItemHidden = false,
    onNodeItemDoubleClick = noop,
    onEndpointClick = noop,
  } = props;

  const {
    nodeIcon = <Icons.Table />,
    nodeItems, title, id,
    operators = [],
    isHideEndpoint = false,
    endpointClassName = '',
    nodeClassName = '',
  } = node;

  return (
    <div
      className={`component ${nodeClassName}`}
      key={id}
    >
      <div
        className="field"
      >
        <div
          className="field-title field-item"
          onClick={() => onNodeClick(id)}
          onDoubleClick={() => onNodeDoubleClick(id)}
        >
          {
            <div className="node-icon">{nodeIcon}</div>
          }
          <div className="filed-title-name">
            <Tooltip title={title}>
              {title}
            </Tooltip>
          </div>
          {getEndpoint(id, id, 'left', isHideEndpoint, endpointClassName, onEndpointClick)}
          {getEndpoint(id, id, 'right', isHideEndpoint, endpointClassName, onEndpointClick)}
          <div className="operators">
            {
              operators.map(({component}, index) => {
                return (
                  <span className="op-item" key={index}>
                    {component}
                  </span>
                );
              })
            }
          </div>
        </div>
        {
          !isHidden && nodeItems.map(nodeItem => {
            const {icon = <Icons.Column />} = nodeItem;
            const isActive = activeNodeItemIds.includes(nodeItem.id) || nodeItem.isActive;
            // 是否有链接
            // const hasConnect = endpointEdge[`${nodeItem.id}-left`] || endpointEdge[`${nodeItem.id}-right`];

            // if (isUnRelItemHidden && !hasConnect) {
            //   return null;
            // }

            return (
              <div
                className={
                  classnames('field-item', {
                    'field-item-active': isActive,
                  })
                }
                key={nodeItem.id}
                onMouseEnter={() => onItemActive(nodeItem.id)}
                onMouseLeave={() => onItemActive()}
                onClick={() => onItemClick(nodeItem.id)}
                onDoubleClick={() => onNodeItemDoubleClick(nodeItem.id)}
              >
                {getEndpoint(id, nodeItem.id, 'left', endpointEdge[`${nodeItem.id}-left`] || nodeItem.isHideEndpoint, endpointClassName, onEndpointClick)}
                {getEndpoint(id, nodeItem.id, 'right', endpointEdge[`${nodeItem.id}-right`] || nodeItem.isHideEndpoint, endpointClassName, onEndpointClick)}
                <div
                  className="field-item-content"
                >
                  <div
                    className="field-item-title"
                  >
                    <div className="item-icon">
                      {icon}
                    </div>
                    {nodeItem.title}
                  </div>
                </div>
              </div>
            );
          })
        }
      </div>
    </div>
  );
};

NodeComponent.propTypes = {
  node: NodeTypes,
  onItemActive: PropTypes.func,                             // 节点hover时
  activeNodeItemIds: PropTypes.arrayOf(PropTypes.string),   // 当前active的节点，用于判断是否应该高亮
  isHidden: PropTypes.bool,                                 // 是否收起字段
  onNodeClick: PropTypes.func,                              // 节点点击时
  onItemClick: PropTypes.func,                              // 字段点击时
  onNodeDoubleClick: PropTypes.func,                        // 节点双击是
  onNodeItemDoubleClick: PropTypes.func,                    // 字段双击
  isActive: PropTypes.bool,                                 // 字段是否高亮
  endpointEdge: PropTypes.object,                           // 边和锚点的映射，渲染用
  isUnRelItemHidden: PropTypes.bool,                        // 是否隐藏没有联系的列
  onEndpointClick: PropTypes.func,                          // 锚点单击事件
};

export default NodeComponent;


