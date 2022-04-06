'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {Layout} from 'antd';
import * as _ from 'lodash';
import LineageDag from '../src/index.tsx';
import {mockData} from './mock_data/data';

import 'antd/dist/antd.css';
import './index.less';

import { BorderOuterOutlined, DownSquareOutlined, QuestionCircleOutlined } from '@ant-design/icons';

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
      icon: <BorderOuterOutlined />,
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
      icon: <DownSquareOutlined />,
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
      icon: <QuestionCircleOutlined />,
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
  componentDidMount() {
    // this.setState({
    //   sourceData1: _.cloneDeep(sourceData1),
    //   targetData1: _.cloneDeep(targetData1),
    //   mappingData1: _.cloneDeep(mappingData1),
    // });
    // setTimeout(() => {
    //   let _sourceData1 = _.cloneDeep(this.state.sourceData1);
    //   _sourceData1.fields[4].disable = true;
    //   let _targetData1 = _.cloneDeep(this.state.targetData1);
    //   _targetData1.fields[5].disable = true;
    //   _targetData1.fields[6].disable = true;
    //   _targetData1.fields[7].disable = true;
    //   this.setState({
    //     sourceData1: _sourceData1,
    //     targetData1: _targetData1
    //   });
    // }, 5000);
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
