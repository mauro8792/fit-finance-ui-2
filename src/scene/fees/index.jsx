/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import InfiniteScroll from 'react-infinite-scroll-component';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, IconButton, MenuItem, Select, TextField, Typography } from '@mui/material';
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

const yearOptions = Array.from({ length: 11 }, (_, index) => {
  const year = 2020 + index;
  return { value: year.toString(), label: year.toString() };
});

export const Fees = () => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const { create } = usePaymentsStore();

  const { findAllFees, fees } = useFeesStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'paid', 'partial', 'pending'
  
  // Filtrar por término de búsqueda
  const searchFilteredFees = fees.filter((fee) => fee.nameStudent.toLowerCase().includes(searchTerm.toLowerCase()));
  
  // Filtrar por estado de pago
  const filteredFees = searchFilteredFees.filter((fee) => {
    if (activeFilter === 'all') return true;
    
    const feeValue = Number(fee.value) || 0;
    const amountPaid = Number(fee.amountPaid) || 0;
    const remainingPayment = Math.max(0, feeValue - amountPaid);
    const isFullyPaid = remainingPayment <= 0 && amountPaid > 0;
    const isPartialPaid = amountPaid > 0 && amountPaid < feeValue;
    const isPending = amountPaid === 0;
    
    switch (activeFilter) {
      case 'paid': return isFullyPaid;
      case 'partial': return isPartialPaid;
      case 'pending': return isPending;
      default: return true;
    }
  });
  
  // Cálculo de estadísticas corregido - usando searchFilteredFees para estadísticas totales
  const totalFees = searchFilteredFees.length;
  const paidFees = searchFilteredFees.filter(fee => {
    const feeValue = Number(fee.value) || 0;
    const amountPaid = Number(fee.amountPaid) || 0;
    const remainingPayment = Math.max(0, feeValue - amountPaid);
    return remainingPayment <= 0 && amountPaid > 0;
  }).length;
  const partialFees = searchFilteredFees.filter(fee => {
    const feeValue = Number(fee.value) || 0;
    const amountPaid = Number(fee.amountPaid) || 0;
    return amountPaid > 0 && amountPaid < feeValue;
  }).length;
  const pendingFees = searchFilteredFees.filter(fee => {
    const amountPaid = Number(fee.amountPaid) || 0;
    return amountPaid === 0;
  }).length;
  
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
    // Mejorar cálculos
    const feeValue = Number(fee.value) || 0;
    const amountPaid = Number(fee.amountPaid) || 0;
    const remainingPayment = Math.max(0, feeValue - amountPaid);
    const isFullyPaid = remainingPayment <= 0 && amountPaid > 0;
    const isPartialPaid = amountPaid > 0 && remainingPayment > 0;

    // Colores dinámicos
    const cardColor = isFullyPaid ? '#1e3a1e' : isPartialPaid ? '#3a2a1e' : '#3a1e1e';
    const borderColor = isFullyPaid ? '#4caf50' : isPartialPaid ? '#ff9800' : '#f44336';

    return (
      <Card
        sx={{
          minWidth: 300,
          maxWidth: 380,
          margin: '12px',
          backgroundColor: cardColor,
          color: '#FFFFFF',
          borderRadius: '16px',
          border: `2px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          boxShadow: `0 4px 20px ${borderColor}40`,
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 8px 30px ${borderColor}60`,
          },
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" component="div" sx={{ mb: 2, fontWeight: 'bold' }}>
            {fee.nameStudent}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#4fc3f7', mb: 1 }}>
              💰 Valor cuota: ${feeValue.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#66bb6a', mb: 1 }}>
              ✅ Pagado: ${amountPaid.toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: isFullyPaid ? '#66bb6a' : '#ef5350', mb: 1 }}>
              ⏳ Restante: ${remainingPayment.toLocaleString()}
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ 
            color: 'rgba(255,255,255,0.8)', 
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '8px',
            borderRadius: '8px'
          }}>
            📅 Vence: {format(new Date(fee.startDate), 'dd/MM/yyyy')}
          </Typography>
        </CardContent>
        <CardActions sx={{ p: 2, gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpenUpdateModal(fee)}
            sx={{
              color: '#FFC107',
              borderColor: '#FFC107',
              '&:hover': {
                backgroundColor: 'rgba(255, 193, 7, 0.15)',
                transform: 'translateY(-1px)',
              },
              flex: 1,
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            ✏️ Editar
          </Button>
          
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleOpenViewModal(fee)}
            sx={{
              color: '#4fc3f7',
              borderColor: '#4fc3f7',
              '&:hover': {
                backgroundColor: 'rgba(79, 195, 247, 0.15)',
                transform: 'translateY(-1px)',
              },
              flex: 1,
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            👁️ Ver
          </Button>

          {isFullyPaid ? (
            <Button
              size="small"
              variant="contained"
              disabled
              sx={{
                backgroundColor: '#4caf50',
                color: 'white',
                flex: 1,
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              ✅ Pagado
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={() => handleOpenAddPaymentModal(fee)}
              sx={{
                backgroundColor: '#66bb6a',
                '&:hover': {
                  backgroundColor: '#4caf50',
                  transform: 'translateY(-1px)',
                },
                flex: 1,
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              💰 Pagar
            </Button>
          )}
        </CardActions>
      </Card>
    );
  };
  return (
    <>
      

      {/* Panel de filtros mejorado */}
      <Box
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          margin: '16px',
          padding: '20px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        className='animate__animated animate__fadeIn animate__faster'
      >
        <Box
          display='flex'
          justifyContent='center'
          alignItems='center'
          flexDirection={isMobile ? 'column' : 'row'}
          gap='20px'
        >
          <Box display='flex' alignItems='center' gap='15px' flexWrap='wrap'>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight="bold">
              📅 Período:
            </Typography>
            <Select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)} 
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '8px',
                minWidth: 120,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              {monthOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <Select 
              value={selectedYear} 
              onChange={(e) => setSelectedYear(e.target.value)} 
              size="small"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white',
                borderRadius: '8px',
                minWidth: 100,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '& .MuiSelect-icon': {
                  color: 'white',
                },
              }}
            >
              {yearOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>

          <Box display='flex' alignItems='center' gap='10px' flexWrap='wrap'>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight="bold">
              🔍 Buscar:
            </Typography>
            <TextField
              label='Buscar alumno'
              variant='outlined'
              size='small'
              value={searchTerm}
              inputRef={inputRef}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                minWidth: isMobile ? 200 : 250,
                '& .MuiInputLabel-root': { 
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': { color: '#4fc3f7' }
                },
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.5)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4fc3f7',
                  },
                },
              }}
              InputProps={{
                endAdornment: searchTerm && (
                  <IconButton 
                    onClick={handleClearSearch} 
                    size="small" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)',
                      '&:hover': { color: '#4fc3f7' }
                    }}
                  >
                    <BackspaceIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>

        {/* Estadísticas de cuotas */}
        <Box
          sx={{
            marginTop: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
          }}
        >
          <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight="bold">
            📊 Estadísticas:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '12px',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Total Cuotas:
              </Typography>
              <Typography variant="body2" color="#FFFFFF" fontWeight="bold">
                {totalFees}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Pagadas:
              </Typography>
              <Typography variant="body2" color="#4caf50" fontWeight="bold">
                {paidFees}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Parciales:
              </Typography>
              <Typography variant="body2" color="#ff9800" fontWeight="bold">
                {partialFees}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Typography variant="body2" color="rgba(255,255,255,0.7)">
                Pendientes:
              </Typography>
              <Typography variant="body2" color="#ef5350" fontWeight="bold">
                {pendingFees}
              </Typography>
            </Box>
          </Box>
        </Box>
        
        {/* Panel de filtros por estado - Botones interactivos */}
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            mt: 3,
            flexWrap: 'wrap',
          }}
        >
          <Box 
            component="button"
            onClick={() => setActiveFilter('all')}
            sx={{
              backgroundColor: activeFilter === 'all' ? 'rgba(33, 150, 243, 0.4)' : 'rgba(33, 150, 243, 0.2)',
              border: activeFilter === 'all' ? '2px solid #2196f3' : '1px solid rgba(33, 150, 243, 0.5)',
              borderRadius: '8px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(33, 150, 243, 0.3)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography variant="body2" color="#2196f3" fontWeight="bold">
              📊 Todas: {totalFees}
            </Typography>
          </Box>

          <Box 
            component="button"
            onClick={() => setActiveFilter('paid')}
            sx={{
              backgroundColor: activeFilter === 'paid' ? 'rgba(76, 175, 80, 0.4)' : 'rgba(76, 175, 80, 0.2)',
              border: activeFilter === 'paid' ? '2px solid #4caf50' : '1px solid rgba(76, 175, 80, 0.5)',
              borderRadius: '8px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(76, 175, 80, 0.3)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography variant="body2" color="#4caf50" fontWeight="bold">
              ✅ Pagadas: {paidFees}
            </Typography>
          </Box>
          
          <Box 
            component="button"
            onClick={() => setActiveFilter('partial')}
            sx={{
              backgroundColor: activeFilter === 'partial' ? 'rgba(255, 152, 0, 0.4)' : 'rgba(255, 152, 0, 0.2)',
              border: activeFilter === 'partial' ? '2px solid #ff9800' : '1px solid rgba(255, 152, 0, 0.5)',
              borderRadius: '8px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.3)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography variant="body2" color="#ff9800" fontWeight="bold">
              ⏳ Parciales: {partialFees}
            </Typography>
          </Box>
          
          <Box 
            component="button"
            onClick={() => setActiveFilter('pending')}
            sx={{
              backgroundColor: activeFilter === 'pending' ? 'rgba(244, 67, 54, 0.4)' : 'rgba(244, 67, 54, 0.2)',
              border: activeFilter === 'pending' ? '2px solid #f44336' : '1px solid rgba(244, 67, 54, 0.5)',
              borderRadius: '8px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.3)',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Typography variant="body2" color="#f44336" fontWeight="bold">
              ❌ Pendientes: {pendingFees}
            </Typography>
          </Box>
        </Box>
        
        {/* Indicador de resultados filtrados */}
        {activeFilter !== 'all' && (
          <Box 
            sx={{
              mt: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              padding: '8px 16px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Typography variant="body2" color="rgba(255,255,255,0.8)" fontWeight="bold">
              🔍 Mostrando {filteredFees.length} de {totalFees} cuotas
              {activeFilter === 'paid' && ' (Pagadas)'}
              {activeFilter === 'partial' && ' (Parciales)'}
              {activeFilter === 'pending' && ' (Pendientes)'}
            </Typography>
          </Box>
        )}
      </Box>
      {/* Contenedor de tarjetas mejorado */}
      <Box 
        sx={{
          display: 'flex', 
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          maxHeight: '75vh', 
          overflow: 'auto',
          padding: '0 16px',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'rgba(255,255,255,0.3)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(255,255,255,0.5)',
            },
          },
        }}
      >
        <InfiniteScroll
          dataLength={filteredFees.length}
          next={() => {
            // Lógica para cargar más datos, por ejemplo, paginación
          }}
          hasMore={true} // Determina si hay más datos para cargar
          // loader={<h4>Cargando...</h4>} // Componente de carga
        >
          <Box 
            sx={{
              display: 'flex', 
              flexWrap: 'wrap', 
              justifyContent: 'center', 
              overflow: 'hidden',
              gap: '16px',
              padding: '8px',
            }}
            className='card-container'
          >
            {filteredFees.map((fee) => (
              <CardComponent key={fee.id} fee={fee} />
            ))}
            <Card
              sx={{
                visibility: 'hidden', // Oculta la tarjeta
                minWidth: 275,
                margin: '10px',
                maxWidth: '30%',
                backgroundColor: '#333333',
                color: '#FFFFFF',
                borderRadius: '10px',
              }}
            >
              <CardContent>
                <Typography variant='h6' component='div'>
                  Título de ejemplo
                </Typography>
                <Typography variant='h6' component='div'>
                  Título de ejemplo
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </InfiniteScroll>
      </Box>

      {feeSelected && <ViewFeeModal openModal={openViewModal} selectedFee={feeSelected} handleCloseModal={handleCloseModal} />}
      {feeSelected && <UpdateFeeModal openModal={openUpdateModal} handleCloseModal={handleCloseModal} fee={feeSelected} handleUpdateFee={handleUpdateFee} />}
      {feeSelected && <AddPaymentModal openModal={openAddPaymentModal} handlePaymentSubmit={handlePaymentSubmit} selectedFee={feeSelected} handleCloseModal={handleCloseModal} />}
    </>
  );
};
