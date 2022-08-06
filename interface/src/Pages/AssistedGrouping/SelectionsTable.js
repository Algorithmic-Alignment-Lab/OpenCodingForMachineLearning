
import React from "react";
import { Table } from "react-bootstrap";
import { useTable } from "react-table";

import { TableStyle } from "../../Constants/Styles";

// import ".././OpenCoding/open-coding.css";


/**
 * Single-column table with no additional functionalities
 */
function SelectionsTable({ style, columns, data}) {

    const CustomCell = ({
        value: initialValue, row: { index, original }, column: { id },
    }) => {

        const [value, setValue] = React.useState(initialValue);

        React.useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);


        return (
            <div style={{ width: style.width}}>
                    {original.annotation}
            </div>);

    };
  
  const defaultColumn = {
    Cell: CustomCell,
  };

  const {
    getTableProps, getTableBodyProps, headerGroups, rows, prepareRow,
  } = useTable({
    columns,
    data,
    defaultColumn,
  });

  return (
    <TableStyle>
      <Table {...getTableProps()}>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr 
              {...row.getRowProps()}>
                {row.cells.map(cell => {
                  return <td {...cell.getCellProps()}>
                        {cell.render("Cell")}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </TableStyle>
  );
}

export default SelectionsTable;