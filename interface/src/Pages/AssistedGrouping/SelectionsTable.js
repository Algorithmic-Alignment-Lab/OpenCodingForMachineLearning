
import React from "react";
import { Table } from "react-bootstrap";
import { useTable } from "react-table";

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
function SelectionsTable({ style, columns, data}) {

    // This cell can be selected (or unselected), and is either visible or not visible.
    // It will be populated with all of the possible rows, but only the rows that match the
    // search are visible. Persistance ensures that users can re-search to find items
    // they've already selected
    const CustomCell = ({
        value: initialValue, row: { index, original }, column: { id },
    }) => {

        const [value, setValue] = React.useState(initialValue);

        React.useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);


        return (
            <div style={{ width: style.width, marginLeft: '10px' }}>
                    {original.annotation}
            </div>);

    };
  
  // Set our custom cell renderer as the default Cell renderer
  const defaultColumn = {
    Cell: CustomCell,
  };

  // you can get the react table functions by using the hook useTable
  const {
    getTableProps, getTableBodyProps, headerGroups, rows, prepareRow,
  } = useTable({
    columns,
    data,
    defaultColumn,
  });

  return (
    <Styles>
      <Table {...getTableProps()}>
        {/* <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => {
                const { render, getHeaderProps } = column;
                return (
                  <th {...getHeaderProps()}>{render("Header")}</th>
                );
              })}
            </tr>
          ))}
        </thead> */}
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
    </Styles>
  );
}

export default SelectionsTable;