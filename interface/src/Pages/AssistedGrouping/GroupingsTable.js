
import React from "react";
import { useTable, useExpanded } from 'react-table'

import { TableStyle } from "../../Constants/Styles";

// import ".././OpenCoding/open-coding.css";

/**
 * Table with expandable and clickable cells, and deletable rows
 */
function GroupingsTable({columns, data}) {

  const {
      getTableProps,
      getTableBodyProps,
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
        <TableStyle>
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
        </TableStyle>
      );

}

export default GroupingsTable;