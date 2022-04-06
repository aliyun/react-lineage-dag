'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {Layout, Tooltip} from 'antd';
import * as _ from 'lodash';
import LineageDag from '../src/index.tsx';
import {mockData} from './mock_data/data';

import 'antd/dist/antd.css';
import './index.less';

import { BorderOuterOutlined, DownSquareOutlined, CloseCircleOutlined, StarOutlined } from '@ant-design/icons';

const {Header} = Layout;

class Com extends React.Component {
  constructor(props) {
    super(props);
    const {tables, relations} = mockData;
    this.state = {
      tables,
      relations
    }
    this.columns = [{
      key: 'name',
      primaryKey: true
    }, {
      key: 'title',
    }];
    this.operator = [{
      id: 'isExpand',
      name: '展开/收缩血缘',
      icon: <Tooltip title='展开/收缩血缘'><BorderOuterOutlined /></Tooltip>,
      onClick: (nodeData) => {
        // 展开血缘
        let tables = _.cloneDeep(this.state.tables);
        let table = _.find(tables, (item) => item.id === nodeData.id);
        table.isCollapse = !!!table.isCollapse;
        this.setState({
          tables,
          centerId: table.id
        });
      }
    }, {
      id: 'explore',
      name: '探索血缘',
      icon: <Tooltip title='探索血缘'><DownSquareOutlined /></Tooltip>,
      onClick: (nodeData) => {
        // 添加血缘
        let node1 = {
          id: (this.state.tables.length + 1).toString(),
          name: `table-${this.state.tables.length + 1}`,
          fields: [
            {
              name: 'id',
              title: 'id',
            },
            {
              name: 'age',
              title: 'age'
            }
          ]
        };
        let node2 = {
          id: (this.state.tables.length + 2).toString(),
          name: `table-${this.state.tables.length + 2}`,
          fields: [
            {
              name: 'id',
              title: 'id',
            },
            {
              name: 'age',
              title: 'age'
            }
          ]
        };
        let relation1 = {
          srcTableId: nodeData.id,
          tgtTableId: node1.id,
          srcTableColName: 'id',
          tgtTableColName: 'age'
        };
        let relation2 = {
          srcTableId: node2.id,
          tgtTableId: nodeData.id,
          srcTableColName: 'id',
          tgtTableColName: 'age'
        }
        let _tables = _.cloneDeep(this.state.tables);
        _tables.push(node1);
        _tables.push(node2);
        let _relations = _.cloneDeep(this.state.relations);
        _relations.push(relation1);
        _relations.push(relation2);
        this.setState({
          tables: _tables,
          relations: _relations,
          centerId: nodeData.id
        });
      }
    }, {
      id: 'remove',
      name: '删除节点',
      icon: <Tooltip title='删除节点'><CloseCircleOutlined /></Tooltip>,
      onClick: (nodeData) => {
        // 删除血缘
        let _tables = _.cloneDeep(this.state.tables);
        let index = _.findIndex(_tables, (item) => item.id === nodeData.id);
        _tables.splice(index, 1);
        this.setState({
          tables: _tables
        });
      }
    }];
  }
  render() {
    return (
      <LineageDag
        tables={this.state.tables}
        relations={this.state.relations}
        columns={this.columns}
        operator={this.operator}
        centerId={this.state.centerId}
        config={{
          minimap: {
            enable: true
          }
        }}

        actionMenu={[{
          icon: <StarOutlined />,
          key: 'star',
          onClick: () => {
            alert('点击收藏！')
          }
        }]}
      />
    );
  }
}


ReactDOM.render((
  <Router>
    <Layout>
      <Header className='header'>DTDesign-React数据血缘图</Header>
      <Layout>
        <Com />
      </Layout>
    </Layout>
  </Router>
), document.getElementById('main'));
