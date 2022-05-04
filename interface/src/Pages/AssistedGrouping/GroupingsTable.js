// import React from 'react';
// import {ReactTable} from 'react-table';

// function GroupingsTable({ style, columns, data}) {
//     const subComponent = (row) => {
//         return (
//                 <div>
//                     {row.original.subRows.map((r) => (
//                         <div>{r.text}</div>
//                     ))}
//                 </div>
//             );
//         };

//   return (
//     <ReactTable 
//         data={data}
//         columns={columns}
//         SubComponent={ subComponent } />
//     );
// }

// export default GroupingsTable;

import React from "react";
import { useTable, useExpanded } from 'react-table'
import styled from 'styled-components'

import ".././OpenCoding/open-coding.css";

const Styles = styled.div`
  padding: 0rem;

  table {

    border-spacing: 0;
    border: 0px;
    
    tr { // each row

      height: 3rem;
      &:hover {
        background-color: #efefef;
      }

      :last-child {
        td {
          border-bottom: 0px;
        }
      }
    }

    // th { // the header
    //   border: 5px;
    // }

    td { // each element

      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid #efefef;
    }
  }
`

// https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/editable-data?file=/src/App.js:1448-1558
// https://medium.com/@blaiseiradukunda/react-table-7-tutorial-3d8ba6ac8b16
/**
 * As in the previous versions, a react-table accepts colums where at the core we have a field Header, and accessor
 * As in the previous versions, a react-table has data that consist of an array of JSONs
 */
function GroupingsTable({ style, columns, data}) {

  const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
    } = useTable(
      {
        columns,
        data,
      },
      useExpanded // Use the useExpanded plugin hook
    )
  
    return (
        <>
        <table {...getTableProps()}>
          <tbody {...getTableBodyProps()}>
            {rows.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map(cell => {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </>
    );

}

export default GroupingsTable;