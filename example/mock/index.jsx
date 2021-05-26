const mock = {
  tables: [
    {
      id: '1',
      name: 'table-1',
      isFold: true,
      columns: [
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
      isFold: true,
      columns: [
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
      id: '3',
      name: 'table-3',
      isFold: true,
      columns: [
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
      isFold: true,
      columns: [
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
  ].map((i,ind) => {
    i.id = String(ind);
    return i;
  }),
}

export const getInit = () => {
  return {
    tables: [mock.tables[0]],
    relations: []
  }
};

export const getChildren = (tableId) => {
   const children = {
     tables: [],
     relations: []
   };

   mock.relations.forEach(relation => {
    if(relation.srcTableId !== tableId) {
      return;
    }

    children.relations.push(relation)

    const tgtTableId = relation.tgtTableId;
    const table = mock.tables.find(table => table.id === tgtTableId);

    if(children.tables.some(table => table.id === tgtTableId)) {
      return;
    }

    children.tables.push(table);
   });

   return children;
};
