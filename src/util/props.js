import PropTypes from 'prop-types';

// 节点类型
export const NodeTypes = PropTypes.shape({
  id: PropTypes.string,                  // 节点ID
  icon: PropTypes.string,                // 图标
  isHide: PropTypes.bool,                // 是否收起
  isUnRelItemHidden: PropTypes.bool,     // 是否收起非关联字段(尚未实现)
  title: PropTypes.string,               // node整体的标题
  nodeItems: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,              // 唯一ID
      level: PropTypes.number,           // 渲染层级
      icon: PropTypes.string,            // 图标
      title: PropTypes.string,           // 描述标题
      onClick: PropTypes.func,           // 单击节点
    })
  ),
  operators: PropTypes.arrayOf(
    PropTypes.shape({
      compnent: PropTypes.element
    })
  )
});

// 连线类型
export const EdgeTypes = PropTypes.shape({
  srcNodeItemId: PropTypes.string,       // 源item的id
  tgtNodeItemId: PropTypes.string,       // 目标item的id
  id: PropTypes.string,                  // 节点自身ID
});
