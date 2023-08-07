import { Box } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import { mockSports } from '../../data/mockData';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';

export const Sports = () => {
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
      <Header title='Disciplinas' subtitle='Listas de disciplinas' />
      <Box
        m='40px 0 0 0'
        height='75vh'
        color
      >
      <DataGrid
        rows={mockSports}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />

      </Box>
    </Box>
  );
};
