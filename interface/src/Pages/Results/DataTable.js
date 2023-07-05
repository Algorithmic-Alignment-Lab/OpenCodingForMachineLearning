import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';

// const columns = [
// 	{ field: "id", headerName: "ID", width: 70 },
// 	{ field: "firstName", headerName: "First name", width: 130 },
// 	{ field: "lastName", headerName: "Last name", width: 130 },
// 	{
// 		field: "age",
// 		headerName: "Age",
// 		type: "number",
// 		width: 90,
// 	},
// 	{
// 		field: "fullName",
// 		headerName: "Full name",
// 		description: "This column has a value getter and is not sortable.",
// 		sortable: false,
// 		width: 160,
// 		valueGetter: (params) =>
// 			`${params.row.firstName || ""} ${params.row.lastName || ""}`,
// 	},
// ];

// const rows = [
// 	{ id: 1, lastName: "Snow", firstName: "Jon", age: 35 },
// 	{ id: 2, lastName: "Lannister", firstName: "Cersei", age: 42 },
// 	{ id: 3, lastName: "Lannister", firstName: "Jaime", age: 45 },
// 	{ id: 4, lastName: "Stark", firstName: "Arya", age: 16 },
// 	{ id: 5, lastName: "Targaryen", firstName: "Daenerys", age: null },
// 	{ id: 6, lastName: "Melisandre", firstName: null, age: 150 },
// 	{ id: 7, lastName: "Clifford", firstName: "Ferrara", age: 44 },
// 	{ id: 8, lastName: "Frances", firstName: "Rossini", age: 36 },
// 	{ id: 9, lastName: "Roxie", firstName: "Harvey", age: 65 },
// ];

export default function DataTable(props) {
    let height = 450, width = '100%', pageSize = 8, pageSizeOptions = [5, 10];
    return (
        // apparently in material UI, you need to have the outer elements be also mui
        // <div style={{ height: height, width: width }}>
        <Box sx={{height: height, width: width}}
        >
            <DataGrid
                rows={props.rows}
                columns={props.columns}
                initialState={{
                    pagination: {
                        paginationModel: { page: 0, pageSize: pageSize },
                    },
                }}
                pageSizeOptions={pageSizeOptions}
                checkboxSelection={true}
                sx={{whiteSpace: 'normal'}}
            />
        </Box>
        // </div>
    );
}