import { useEffect, useState } from 'react';
import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useSportsStore } from '../../hooks';
import { ViewSportModal } from './ViewSport';
import { UpdateSportModal } from './UpdateSport';
import { AddSportModal } from './AddSport';

export const Sports = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { findAllSports, sports, update } = useSportsStore();

  const [loading, setLoading] = useState(true);
  const [sportSelected, setSportSelected] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchSports = async () => {
    try {
      await findAllSports();
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    }
  };

  const handleSaveChanges = async (updatedSport) => {
    await update(updatedSport);
    setLoading(true);
    await fetchSports();
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
    fetchSports();
  }, []);

  useEffect(() => {}, [sports]);

  const columns = [
    { field: 'name', headerName: 'Nombre' },
    { field: 'description', headerName: 'Descripcion' },
    { field: 'monthlyFee', headerName: 'Valor cuota' },
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

  return (
    <>
      <Header title='Disciplinas' subtitle='Lista de disciplinas'></Header>
      <Tooltip title='Agregar nueva disciplina' placement='top'>
        <IconButton color='primary' aria-label='agregar nuevo alumno' component='span' onClick={() => setOpenAddModal(true)}>
          <Typography style={{ paddingRight: '5px' }}>Agregar Nueva disciplina</Typography>
          <PersonAddIcon />
        </IconButton>
      </Tooltip>

      <AddSportModal openModal={openAddModal} setOpenModal={setOpenAddModal} fetchSports={fetchSports} />

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
        {loading ? <CircularProgress /> : <DataGrid rows={sports} columns={columns} className='animate__animated animate__fadeIn animate__faster' />}
      </Box>

      {sportSelected && openUpdateModal && (
        <UpdateSportModal
          openModal={openUpdateModal}
          setOpenModal={setOpenUpdateModal}
          sportSelected={sportSelected}
          onSaveChanges={handleSaveChanges}
          setSportSelected={setSportSelected}
        />
      )}

      {sportSelected && <ViewSportModal openModal={openViewModal} selectedUser={sportSelected} handleCloseModal={handleCloseModal} />}
    </>
  );
};
