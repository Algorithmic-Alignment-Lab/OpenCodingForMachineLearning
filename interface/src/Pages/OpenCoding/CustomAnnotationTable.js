
import React from "react";
import { Table } from "react-bootstrap";
import { useTable } from "react-table";

import { TableStyle } from "../../Constants/Styles";

/**
 * Two-column annotation table with one editable-text column. 
 * 
 * Holds a "memory-map" that stores edits until submission. This prevents us from 
 * spamming UI's state with refreshes due to text-box updates and improves the user experience.
 */
function CustomAnnotationTable({ columns, data, toggleSubmit}) {

    let memoryMap = new Map();

    const CustomCell = ({
        value: initialValue, row: { index }, column: { id },
    }) => {
        const [value, setValue] = React.useState(initialValue);

        // when the text box changes, we store those changes in our memory-map
        const onChange = e => {
            memoryMap.set(index, e.target.value);
            setValue(e.target.value);
        };

        // we'll only update the external data when the input is submitted
        const onSubmit = () => {
            toggleSubmit(memoryMap);
        };

        // toggle submit by pressing the 'enter' hotkey
        const handleEnter = e => {
          console.log('caught keypress');
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
    </TableStyle>
  );
}

export default CustomAnnotationTable;