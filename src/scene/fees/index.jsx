/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box,  IconButton, MenuItem, Select, TextField,  Typography } from '@mui/material';
import { Card, CardContent, CardActions, Button } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';

import Header from '../../components/Header';
import { usePaymentsStore } from '../../hooks';
import { useFeesStore } from '../../hooks/useFeesStore';
import { ViewFeeModal } from './ViewFee';
import { AddPaymentModal } from './AddPayment';
import { UpdateFeeModal } from './UpdateFee';

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
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const { create } = usePaymentsStore();

  const { findAllFees, fees } = useFeesStore();

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
  const [openAddPaymentModal, setOpenAddPaymentModal] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const fetchFee = async () => {
    try {
      await findAllFees({ month: selectedMonth, year: selectedYear });
    } catch (error) {
      console.error('Error al obtener los estudiantes:', error);
    }
  };

  const handleUpdateFee = async (updateFee) => {
    console.log('updateFee', updateFee);
  };

  const handleOpenViewModal = (fee) => {
    setFeeSelected(fee);
    setOpenViewModal(true);
  };

  const handleOpenAddPaymentModal = (fee) => {
    setFeeSelected(fee);
    setOpenAddPaymentModal(true);
  };

  const handleOpenUpdateModal = (fee) => {
    setFeeSelected(fee);
    setOpenUpdateModal(true);
  };

  const handleCloseModal = () => {
    setFeeSelected(null);
    setOpenViewModal(false);
    setOpenUpdateModal(false);
    setOpenAddPaymentModal(false);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    inputRef.current.focus();
  };

  const handlePaymentSubmit = async (data) => {
    await create(data);
    handleCloseModal();
    setRefresh(true);
  };

  useEffect(() => {
    fetchFee();
  }, []);

  useEffect(() => {
    fetchFee();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (refresh) {
      fetchFee();
      setRefresh(false); // Restablecer el estado de refresco
    }
  }, [refresh, selectedMonth, selectedYear]);


  const CardComponent = ({ fee }) => {
    const remainingPayment = parseInt(fee.value) - parseInt(fee.amountPaid);
    const isFullyPaid = remainingPayment === 0;

    return (
      <Card
        sx={{
          minWidth: 275,
          margin: '10px',
          maxWidth: '30%',
          backgroundColor: '#333333',
          color: '#FFFFFF',
          borderRadius: '10px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          backgroundImage: 'url("../../assets/hexa2.jpg")', // Reemplaza con la URL de tu imagen
          backgroundSize: 'cover',
          transition: 'box-shadow 0.3s ease, background-color 0.3s ease', // Transiciones suaves
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(255, 255, 255, 0.2)', // Cambio de sombra al pasar el mouse
            backgroundColor: '#444444', // Cambio de color de fondo al pasar el mouse
          },
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
        </CardContent>
        <CardActions>
          <Button
            size='small'
            sx={{
              color: '#FFC107',
              '&:hover': {
                backgroundColor: '#555555',
              },
            }}
            onClick={() => handleOpenUpdateModal(fee)}
          >
            Editar
          </Button>
          <Button
            size='small'
            onClick={() => handleOpenViewModal(fee)}
            sx={{
              color: '#00FF00',
              '&:hover': {
                backgroundColor: '#555555',
              },
            }}
          >
            Ver
          </Button>
          {!isFullyPaid && (
            <Button
              size='small'
              onClick={() => handleOpenAddPaymentModal(fee)}
              sx={{
                color: '#FF0000',
                '&:hover': {
                  backgroundColor: '#555555',
                },
              }}
            >
              Ingresar Pago
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };
  return (
    <>
      <Header title='Cuotas' subtitle='Lista de cuotas por mes '></Header>

      
          <Box
            display='flex'
            justifyContent='center'
            alignItems='center'
            flexDirection={isMobile ? 'column' : 'row'}
            gap='20px'
            p={2}
            className='animate__animated animate__fadeIn animate__faster'
          >
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

      {feeSelected && <ViewFeeModal openModal={openViewModal} selectedFee={feeSelected} handleCloseModal={handleCloseModal} />}
      {feeSelected && <UpdateFeeModal openModal={openUpdateModal} handleCloseModal={handleCloseModal} fee={feeSelected} handleUpdateFee={handleUpdateFee} />}
      {feeSelected && <AddPaymentModal openModal={openAddPaymentModal} handlePaymentSubmit={handlePaymentSubmit} selectedFee={feeSelected} handleCloseModal={handleCloseModal} />}
    </>
  );
};
