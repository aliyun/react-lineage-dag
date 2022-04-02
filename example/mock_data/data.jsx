'use strict';
import React from 'react';

export let mockData = {
  tables: [
    {
      id: '1',
      name: 'table-1',
      // isCollapse: true,
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
    },
    {
      id: '2',
      name: 'table-2',
      // isCollapse: true,
      fields: [
        {
          name: 'id',
          title: 'id',
        },
        {
          name: 'age',
          title: 'age'
        },
        {
          name: 'id2',
          title: 'id2',
        },
        {
          name: 'age2',
          title: 'age2'
        },
        {
          name: 'id3',
          title: 'id3',
        },
        {
          name: 'age3',
          title: 'age3'
        },
        {
          name: 'id4',
          title: 'id4',
        },
        {
          name: 'age4',
          title: 'age4'
        }
      ]
    },
    {
      id: '3',
      name: 'table-3',
      isCollapse: true,
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
    },
    {
      id: '4',
      name: 'table-4',
      isCollapse: true,
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
    }
  ],
  relations: [
    {
      srcTableId: '1',
      tgtTableId: '2',
      srcTableColName: 'id',
      tgtTableColName: 'age'
    },
    {
      srcTableId: '1',
      tgtTableId: '2',
      srcTableColName: 'id',
      tgtTableColName: 'id'
    },    
    {
      srcTableId: '1',
      tgtTableId: '3',
      srcTableColName: 'id',
      tgtTableColName: 'age'      
    },
    {
      srcTableId: '2',
      tgtTableId: '4',
      srcTableColName: 'id',
      tgtTableColName: 'age'      
    },
    {
      srcTableId: '2',
      tgtTableId: '4',
      srcTableColName: 'id',
      tgtTableColName: 'id'
    }    
  ]
}