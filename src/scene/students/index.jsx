import { useEffect, useState } from 'react';
import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useSportsStore, useStudentsStore } from '../../hooks';
import { UpdateStudentModal } from './UpdateStudent/UpdateStudentModal';
import { AddStudentModal } from './AddStudent';
import { ViewStudentModal } from './ViewStudent';

export const Students = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const { findAll, students, update } = useStudentsStore();
  const { findAllSports, sports } = useSportsStore();

  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchStudents = async () => {
    try {
      await findAll();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Error al obtener los estudiantes:', error);
    }
  };
  const fetchSports = async () => {
    try {
      await findAllSports();
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    }
  };

  const handleSaveChanges = async (updatedStudent) => {
    await update(updatedStudent);
    setLoading(true);
    await fetchStudents();
  };

  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setOpenViewModal(true);
  };

  const handleOpenUpdateModal = (user) => {
    setSelectedUser(user);
    setOpenUpdateModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setOpenViewModal(false);
    setOpenUpdateModal(false);
  };

  useEffect(() => {
    fetchStudents();
    fetchSports();
  }, []);

  useEffect(() => {}, [students]);

  const columns = [
    // { field: 'id', headerName: 'ID', flex: 0.5 },
    { field: 'firstName', headerName: 'Nombre', flex: 1 },
    { field: 'lastName', headerName: 'Apellido', flex: 1 },
    { field: 'birthDate', headerName: 'F. nacimiento', headerAlign: 'left', align: 'left', hide: true },
    { field: 'phone', headerName: 'Telefono', flex: 1, hide: true },
    { field: 'startDate', headerName: 'Inicio', flex: 1 },
    { field: 'document', headerName: 'Documento', flex: 1, hide: true },
    { field: 'isActive', headerName: 'Activo', flex: 1 },
    { field: 'sportName', headerName: 'Deporte', flex: 1 },
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
      <Header title='Alumnos' subtitle='List of Contacts for Future Reference'></Header>
      <Tooltip title='Agregar nuevo alumno' placement='top'>
        <IconButton color='primary' aria-label='agregar nuevo alumno' component='span' onClick={() => setOpenAddModal(true)}>
          <Typography style={{ paddingRight: '5px' }}>Agregar Nuevo alumno</Typography>
          <PersonAddIcon />
        </IconButton>
      </Tooltip>

      <AddStudentModal openModal={openAddModal} setOpenModal={setOpenAddModal} fetchStudents={fetchStudents} sports={sports} />

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
        {loading ? <CircularProgress /> : <DataGrid rows={students} columns={columns} className='animate__animated animate__fadeIn animate__faster' />}
      </Box>

      {selectedUser && openUpdateModal && (
        <UpdateStudentModal
          setSelectedUser={setSelectedUser}
          setOpenModal={setOpenUpdateModal}
          openModal={openUpdateModal}
          selectedUser={selectedUser}
          onSaveChanges={handleSaveChanges}
          sports={sports}
        />
      )}

      {selectedUser && <ViewStudentModal openModal={openViewModal} selectedUser={selectedUser} handleCloseModal={handleCloseModal} />}
    </>
  );
};
