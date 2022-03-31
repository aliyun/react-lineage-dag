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
        let tables = _.cloneDeep(this.state.tables);
        let table = _.find(tables, (item) => item.id === nodeData.id);
        table.isCollapse = !!!table.isCollapse;
        this.setState({
          tables
        });
      }
    }, {
      id: 'explore',
      icon: <DownSquareOutlined />,
      onClick: (nodeData) => {
        console.log(nodeData);
      }
    }, {
      id: 'other',
      icon: <QuestionCircleOutlined />,
      onClick: (nodeData) => {
        console.log(nodeData);
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
