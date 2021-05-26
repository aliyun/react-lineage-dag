import React, {useEffect, useState, useRef} from 'react';
import _ from 'lodash';

import {getInit, getChildren} from './mock';
import getOps from './mock/operator';
import LineageTable from '../src/table';

import './index.less';

const App = () => {
  const cvsRef = useRef(null);
  const [data, setData] = useState(getInit());

  const [relayout, setRelayout] = useState(false);
  const [focus, setFocus] = useState(false);

  const onAction = (action, tableId) => {
    switch (action) {
      case 'expand': {
        const table = data.tables.find(t => t.id === tableId);
        table.isExpand = true;

        const children = getChildren(tableId);

        children.tables.forEach(table => {
          if(data.tables.some(t => t.id === table.id)) {
            return;
          }

          data.tables.push(table);
        });

        children.relations.forEach(relation => {
          if(data.relations.some(r => r.id === relation.id)) {
            return;
          }

          data.relations.push(relation);
        });

        setData({...data});
        break;
      }
      case 'shrink': {
        const table = data.tables.find(t => t.id === tableId);
        table.isExpand = false;

        const children = getChildren(tableId);

        children.tables.forEach(table => {
          const index = data.tables.findIndex(t => t.id === table.id);

          data.tables.splice(index, 1);
        });

        children.relations.forEach(relation => {
          const index = data.relations.findIndex(r => r.id === relation.id);

          data.relations.splice(index, 1);
        });

        setData({...data});
        break;
      }
      case 'fold': {
        data.tables.forEach(table => {
          if(table.id !== tableId) {
            return;
          }

          table.isFold = false;
        });

        data.tables = [...data.tables];
        setData({...data});
        break;
      }
      case 'unfold': {
        data.tables.forEach(table => {
          if(table.id !== tableId) {
            return;
          }

          table.isFold = true;
        });

        data.tables = [...data.tables];
        setData({...data});
        break;
      }
    }
  };

  data.tables.forEach(table => {
    table.operators = getOps({
      isExpand: table.isExpand,
      isFold: !!table.isFold,
      onAction,
      tableId: table.id
    })
  });

  return (
    <LineageTable
      {...data}
      onLoaded={(canvas) => {
        cvsRef.current = canvas;
      }}
      onEachFrame={() => {
        if (!cvsRef.current) {
          return;
        }

        if (relayout) {
          cvsRef.current.relayout();
          setRelayout(false);
        }

        if(focus) {
          cvsRef.current.focusNode(focus);
          setFocus(false);
        }
      }}
    />
  );
};
export default App;
