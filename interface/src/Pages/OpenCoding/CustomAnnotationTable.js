
import React from "react";
import { Table } from "react-bootstrap";
import { useTable } from "react-table";

import styled from 'styled-components'

import "./open-coding.css";

const Styles = styled.div`
  padding: 0rem;

  table {
    border-spacing: 0;
    border: 0px;
    width: 100%;
    height: 100%
    
    tr { // each row

      // height: 3rem;
      &:hover {
        background-color: #efefef;
      }

      :last-child {
        td {
          border-bottom: 0px;
        }
      }
    }

    th { // the header
      border: 0px;
    }

    td { // each element

      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid #efefef;

      input {
        font-size: 1rem;
        padding: 0;
        margin: 0;
        border: 0;
      }
    }
  }
`

// https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/editable-data?file=/src/App.js:1448-1558
// https://medium.com/@blaiseiradukunda/react-table-7-tutorial-3d8ba6ac8b16
/**
 * As in the previous versions, a react-table accepts colums where at the core we have a field Header, and accessor
 * As in the previous versions, a react-table has data that consist of an array of JSONs
 */
function CustomAnnotationTable({ columns, data, toggleSubmit}) {

    let memoryMap = new Map();

    const CustomCell = ({
        value: initialValue, row: { index }, column: { id },
    }) => {
        const [value, setValue] = React.useState(initialValue);
        // If the initialValue is changed external, sync it up with our state
        const onChange = e => {
            memoryMap.set(index, e.target.value);
            setValue(e.target.value);
        };

        // We'll only update the external data when the input is submitted
        const onSubmit = () => {
            toggleSubmit(memoryMap);
        };

        const handleEnter = e => {
          var charCode = e.which || e.keyCode;
          if (charCode === 13) {
            toggleSubmit(memoryMap);
          }
        }


        React.useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);

        // if we are in the annotation column, we can edit the cell
        if (id === 'annotation') {
            return (
              <input 
                    id={'annotation' + index}
                    placeholder="type here"
                    value={value}
                    onChange={onChange}
                    onSubmit={onSubmit}
                    onKeyPress={handleEnter}
              />);
        }

        // otherwise, it's a normal cell
        return (<div>{value}</div>);
    };
  
  // Set our editable cell renderer as the default Cell renderer
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
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              <tr 
              {...row.getRowProps()} 
              >
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

export default CustomAnnotationTable;