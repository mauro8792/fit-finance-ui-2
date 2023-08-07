import { Box } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import { mockSports } from '../../data/mockData';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';

export const Users = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const columns = [
    { field: 'id', headerName: 'ID', },
    { field: 'name', headerName: 'Nombre' },
    { field: 'description', headerName: 'Descripcion', flex:0.1 },
    { field: 'monthlyFee', headerName: 'Valor de cuota', type: 'number',  },
  ];

  return (
    <Box m='20px'>
      <Header title='Usuarios' subtitle='Listas de usuarios' />
      <Box
        m='40px 0 0 0'
        height='75vh'
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: 'none',
          },
          '& .no-border-bottom': {
            borderBottom: 'none !important',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: colors.blueAccent[700],
            borderBottom: 'none',
          },
          '& .MuiDataGrid-virtualScroller': {
            backgroundColor: colors.primary[400],
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: 'none',
            backgroundColor: colors.blueAccent[700],
          },
          '& .MuiCheckbox-root': {
            color: `${colors.greenAccent[200]} !important`,
          },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid rows={mockSports} columns={columns} components={{ Toolbar: GridToolbar }} />
      </Box>
    </Box>
  );
};
