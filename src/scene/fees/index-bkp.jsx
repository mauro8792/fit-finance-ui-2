import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, CircularProgress, IconButton, MenuItem, Select, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useSportsStore } from '../../hooks';
import { useFeesStore } from '../../hooks/useFeesStore';

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: (index + 1).toString(),
  label: new Date(0, index).toLocaleString('es', { month: 'long' }),
}));

const yearOptions = [
  { value: '2023', label: '2023' },
  { value: '2022', label: '2022' },
  // ... y los años que necesites
];


export const Fees = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const { findAllSports, sports, update } = useSportsStore();
  const { findAllFees, fees } = useFeesStore();

  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString(); 
  const currentYear = currentDate.getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);


  const [sportSelected, setSportSelected] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchFee = async () => {
    try {
      console.log('selectedMonth', selectedMonth);
      console.log('selectedYear', selectedYear);
      await findAllFees({ month: selectedMonth, year: selectedYear });
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    }
  };

  const handleSaveChanges = async (updatedSport) => {
    await update(updatedSport);
    setLoading(true);
    await fetchFee();
  };

  const handleOpenViewModal = (sport) => {
    setSportSelected(sport);
    setOpenViewModal(true);
  };

  const handleOpenUpdateModal = (sport) => {
    setSportSelected(sport);
    setOpenUpdateModal(true);
  };

  const handleCloseModal = () => {
    setSportSelected(null);
    setOpenViewModal(false);
    setOpenUpdateModal(false);
  };

  useEffect(() => {
    fetchFee();
  }, []);

  useEffect(() => {
    fetchFee();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {}, [sports]);

  const columns = [
    { field: 'nameStudent', headerName: 'Alumno',  },
    {
      field: 'startDate',
      headerName: 'Inicio',
      // flex: 1,
      valueFormatter: (params) => format(new Date(params.value), 'dd-MM-yyyy'), // Formatear la fecha aquí
    },
    // {
    //   field: 'endDate',
    //   headerName: 'Fin',
    //   flex: 1,
    //   valueFormatter: (params) => format(new Date(params.value), 'dd-MM-yyyy'), // Formatear la fecha aquí
    // },
    { field: 'value', headerName: 'Valor cuota' },
    { field: 'amountPaid', headerName: 'Pago parcial' },
    {
      field: 'pennding',
      headerName: 'Pendiente',
      renderCell: (params) => {
        const value = parseFloat(params.row.value);
        const amountPaid = parseFloat(params.row.amountPaid);
        const pendding = value - amountPaid;

        return <>{pendding.toFixed(2)}</>; // Mostrar el valor pendiente con 2 decimales
      },
    },
    // { field: 'month', headerName: 'Mes' },
    // { field: 'year', headerName: 'Año' },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      renderCell: (params) => (
        <div>
          <Tooltip title='Edit' placement='top'>
            <IconButton
              color='primary'
              aria-label=''
              component='span'
              onClick={() => handleOpenUpdateModal(params.row)} // Llamar la función cuando se haga clic
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Ver' placement='top'>
            <IconButton
              color='secondary'
              aria-label=''
              component='span'
              onClick={() => handleOpenViewModal(params.row)} // Llamar la función cuando se haga clic
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  const mobileColumns = [
    { field: 'nameStudent', headerName: 'Alumno', flex:1 },
    { field: 'value', headerName: 'Valor cuota' },
    {
      field: 'actions',
      headerName: 'Acciones',
      flex: 1,
      renderCell: (params) => (
        <div>
          <Tooltip title='Edit' placement='top'>
            <IconButton color='primary' aria-label='' component='span' onClick={() => handleOpenUpdateModal(params.row)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          {/* Otras acciones */}
        </div>
      ),
    },
  ];

  const columnsToShow = isMobile ? mobileColumns : columns;
  return (
    <>
      <Header title='Cuotas' subtitle='Lista de cuotas por mes '></Header>
      {/* <Tooltip title='Agregar nueva disciplina' placement='top'>
        <IconButton color='primary' aria-label='agregar nuevo alumno' component='span' onClick={() => setOpenAddModal(true)}>
          <Typography style={{ paddingRight: '5px' }}>Agregar Nueva disciplina</Typography>
          <PersonAddIcon />
        </IconButton>
      </Tooltip> */}

      {/* <AddSportModal openModal={openAddModal} setOpenModal={setOpenAddModal} fetchSports={fetchFee} /> */}
      <Box>
        <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label='Mes' style={{ marginRight: '10px' }}>
          {monthOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        <Select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} label='Año'>
          {yearOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box
        m='40px 0 0 0'
        height='75vh'
        display='flex'
        justifyContent='center'
        alignItems='center' // Esto centrará verticalmente
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
        {loading ? <CircularProgress /> : <DataGrid rows={fees} columns={columnsToShow} className='animate__animated animate__fadeIn animate__faster' />}
      </Box>

      {/* {sportSelected && openUpdateModal && (
        <UpdateSportModal
          openModal={openUpdateModal}
          setOpenModal={setOpenUpdateModal}
          sportSelected={sportSelected}
          onSaveChanges={handleSaveChanges}
          setSportSelected={setSportSelected}
        />
      )} */}

      {/* {sportSelected && <ViewSportModal openModal={openViewModal} selectedUser={sportSelected} handleCloseModal={handleCloseModal} />} */}
    </>
  );
};
