
import React from "react";
import { Table } from "react-bootstrap";
import { useTable, } from "react-table";

import { TableStyle } from "../../Constants/Styles";

// import ".././OpenCoding/open-coding.css";

/**
 * Two-column table with clickable check-boxes
 */
function SearchResultTable({ columns, data, selectIndex, unselectIndex, isSelected, isVisible}) {

    // This cell can be selected (or unselected), and is either visible or not visible.
    // It will be populated with all of the possible rows, but only the rows that match the
    // search are visible. Persistance ensures that users can re-search to find items
    // they've already selected
    const CustomCell = ({
        value: initialValue, row: { index, original }, column: { id }, selectIndex, unselectIndex, isSelected
    }) => {

        const [, setValue] = React.useState(initialValue);

        React.useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);

        const onClick = () => {
          console.log(index)
          console.log(original)
            if (isSelected(index)) {
                unselectIndex(index);
            } else {
                selectIndex(index);
            }
        }
        
        // three different cell types to load, based on column
        // two different click functions, based on row
        return (
          <div style={{ marginLeft: '5px', display: 'flex', height: '80%' }} onClick={onClick}>
              {(id !== 'selectAll') ? (
                <div style={{ marginLeft: '10px' }}>
                  {original[id]}
                </div> ) :
                (<input type="checkbox" checked={isSelected(index)} readOnly={true}/>)
              }
          </div>
        );
    };

  
  const defaultColumn = {
    Cell: CustomCell,
  };

  const {
    getTableProps, headerGroups, getTableBodyProps, rows, prepareRow,
  } = useTable({
    columns,
    data,
    defaultColumn,
    selectIndex, 
    unselectIndex, 
    isSelected, 
    isVisible
  });

  return (
    <TableStyle>
      <Table {...getTableProps()}>
        <thead>
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
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, i) => {
            // decide whether or not to show the row; used to reduce results based on searching
            if (isVisible(i)){
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
            } else {
                return null;
            }
          })}
        </tbody>
      </Table>
    </TableStyle>
  );
}

export default SearchResultTable;