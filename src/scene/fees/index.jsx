/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, CircularProgress, IconButton, MenuItem, Select, TextField, Tooltip, Typography } from '@mui/material';
import { Card, CardContent, CardActions, Button } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useTheme } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import InfoIcon from '@mui/icons-material/Info';

import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useSportsStore } from '../../hooks';
import { useFeesStore } from '../../hooks/useFeesStore';
import { ViewFeeModal } from './ViewFee';

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
  const [searchTerm, setSearchTerm] = useState('');
  const filteredFees = fees.filter((fee) => fee.nameStudent.toLowerCase().includes(searchTerm.toLowerCase()));
  const inputRef = useRef(null);

  const currentDate = new Date();
  const currentMonth = (currentDate.getMonth() + 1).toString();
  const currentYear = currentDate.getFullYear().toString();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [feeSelected, setFeeSelected] = useState(null);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [openAddModal, setOpenAddModal] = useState(false);

  const fetchFee = async () => {
    try {
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

  const handleOpenViewModal = (fee) => {
    setFeeSelected(fee);
    setOpenViewModal(true);
  };

  const handleOpenUpdateModal = (sport) => {
    setFeeSelected(sport);
    setOpenUpdateModal(true);
  };

  const handleCloseModal = () => {
    setFeeSelected(null);
    setOpenViewModal(false);
    setOpenUpdateModal(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    inputRef.current.focus();
  };
  
  useEffect(() => {
    fetchFee();
  }, []);

  useEffect(() => {
    fetchFee();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {}, [sports]);



  
const CardComponent = ({ fee }) => {
  const remainingPayment = parseInt(fee.value) - parseInt(fee.amountPaid);
  const isFullyPaid = remainingPayment === 0;

  return (
    <Card
      sx={{
        minWidth: 275,
        margin: '10px',
        maxWidth: '30%',
        backgroundColor: '#333333', // Gris oscuro en lugar de negro
        color: '#FFFFFF',
        boxShadow: '0px 2px 6px rgba(255, 255, 255, 0.1)', // Sombras más claras
        borderRadius: '10px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardContent>
        <Typography variant='h6' component='div'>
          {fee.nameStudent}
        </Typography>
        <Typography sx={{ mb: 1.5, color: isFullyPaid ? '#00FF00' : '#FF0000' }} color='text.secondary'>
          Valor cuota: {fee.value}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color='text.secondary'>
          Pago parcial: {fee.amountPaid}
        </Typography>
        <Typography sx={{ mb: 1.5, color: isFullyPaid ? '#00FF00' : '#FF0000' }} color='text.secondary'>
          Restan: {remainingPayment}
        </Typography>
        <Typography sx={{ mb: 1.5 }} color='text.secondary'>
          Fecha venc.: {format(new Date(fee.startDate), 'dd-MM-yyyy')}
        </Typography>
        {/* Más información sobre la cuota */}
      </CardContent>
      <CardActions>
        <Button
          size='small'
          sx={{
            color: '#FFC107',
            '&:hover': {
              backgroundColor: '#555555', // Cambia el color de fondo al pasar el mouse
            },
          }}
        >
          Editar
        </Button>
        <Button
          size='small'
          onClick={() => handleOpenViewModal(fee)}
          sx={{
            color: '#00FF00',
            '&:hover': {
              backgroundColor: '#555555', // Cambia el color de fondo al pasar el mouse
            },
          }}
        >
          Ver
        </Button>
        <Button
          size='small'
          sx={{
            color: '#FF0000',
            '&:hover': {
              backgroundColor: '#555555', // Cambia el color de fondo al pasar el mouse
            },
          }}
        >
          Ingresar Pago
        </Button>
      </CardActions>
    </Card>
  );
};
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
      <Box display='flex' justifyContent='center' alignItems='center' flexDirection={isMobile ? 'column' : 'row'} gap='20px' p={2}>
        <Box display='flex' alignItems='center' gap='10px' sx={{ height: '40px' }}>
          <Select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} label='Mes'>
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
        <TextField
          label='Buscar alumno'
          variant='outlined'
          size='small'
          value={searchTerm}
          inputRef={inputRef}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: isMobile ? '100%' : 'auto', height: '40px', marginBottom: isMobile ? '10px' : '0' }}
          InputProps={{
            endAdornment: searchTerm && (
              <IconButton onClick={handleClearSearch}>
                <BackspaceIcon />
              </IconButton>
            ),
          }}
        />
      </Box>
      <Box display='flex' flexWrap='wrap' justifyContent='center' maxHeight='75vh' overflow='auto'>
        {filteredFees.map((fee) => (
          <CardComponent key={fee.id} fee={fee} />
        ))}
      </Box>

      {/* {feeSelected && openUpdateModal && (
        <UpdateSportModal
          openModal={openUpdateModal}
          setOpenModal={setOpenUpdateModal}
          feeSelected={feeSelected}
          onSaveChanges={handleSaveChanges}
          setfeeSelected={setfeeSelected}
        />
      )} */}

      {feeSelected && <ViewFeeModal openModal={openViewModal} selectedFee={feeSelected} handleCloseModal={handleCloseModal} />}
    </>
  );
};
