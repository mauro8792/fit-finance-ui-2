import React from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  IconButton,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import BackspaceIcon from '@mui/icons-material/Backspace';

/**
 * Panel de filtros mejorado para la vista de cuotas
 */
export const EnhancedFilterPanel = ({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  searchTerm,
  setSearchTerm,
  paymentStatusFilter,
  setPaymentStatusFilter,
  monthOptions,
  yearOptions,
  filteredFees,
  onClearFilters,
  onClearSearch,
  inputRef,
}) => {
  // Calcular estadísticas
  const totalFees = filteredFees.length;
  const paidFees = filteredFees.filter((f) => {
    const feeValue = Number(f.value) || 0;
    const amountPaid = Number(f.amountPaid) || 0;
    return feeValue - amountPaid <= 0 && amountPaid > 0;
  }).length;
  const pendingFees = filteredFees.filter((f) => Number(f.amountPaid) === 0).length;
  const partialFees = filteredFees.filter((f) => {
    const feeValue = Number(f.value) || 0;
    const amountPaid = Number(f.amountPaid) || 0;
    return amountPaid > 0 && feeValue - amountPaid > 0;
  }).length;

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        margin: '16px',
        padding: '24px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(79, 195, 247, 0.05) 0%, rgba(102, 187, 106, 0.05) 100%)',
          pointerEvents: 'none',
        },
      }}
      className="animate__animated animate__fadeIn animate__faster"
    >
      {/* Título del panel */}
      <Box mb={3} textAlign="center">
        <Typography 
          variant="h6" 
          sx={{
            background: 'linear-gradient(45deg, #4fc3f7, #66bb6a)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 'bold',
            fontSize: '1.2rem',
          }}
        >
          🎯 Filtros y Estadísticas
        </Typography>
      </Box>

      {/* Filtros principales */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        gap="20px"
        mb={3}
      >
        {/* Grupo de período */}
        <Box
          sx={{
            backgroundColor: 'rgba(79, 195, 247, 0.1)',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid rgba(79, 195, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '280px',
          }}
        >
          <Typography variant="body2" color="#4fc3f7" fontWeight="bold">
            📅 Período:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 110 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Mes</InputLabel>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              label="Mes"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                borderRadius: '10px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(79, 195, 247, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4fc3f7',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4fc3f7',
                },
              }}
            >
              {monthOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 80 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Año</InputLabel>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              label="Año"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                borderRadius: '10px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(79, 195, 247, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4fc3f7',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#4fc3f7',
                },
              }}
            >
              {yearOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Grupo de búsqueda */}
        <Box
          sx={{
            backgroundColor: 'rgba(102, 187, 106, 0.1)',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid rgba(102, 187, 106, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '250px',
          }}
        >
          <Typography variant="body2" color="#66bb6a" fontWeight="bold">
            🔍 Buscar:
          </Typography>
          <TextField
            label="Buscar alumno"
            variant="outlined"
            size="small"
            value={searchTerm}
            inputRef={inputRef}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              minWidth: 180,
              '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                borderRadius: '10px',
                '& fieldset': {
                  borderColor: 'rgba(102, 187, 106, 0.5)',
                },
                '&:hover fieldset': {
                  borderColor: '#66bb6a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#66bb6a',
                },
              },
            }}
            InputProps={{
              endAdornment: searchTerm && (
                <IconButton onClick={onClearSearch} size="small" sx={{ color: '#66bb6a' }}>
                  <BackspaceIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Filtros adicionales */}
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexWrap="wrap"
        gap="15px"
        mb={3}
      >
        <Box
          sx={{
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderRadius: '16px',
            padding: '12px 16px',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <Typography variant="body2" color="#FFC107" fontWeight="bold">
            📊 Estado:
          </Typography>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.7)' }}>Estado</InputLabel>
            <Select
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value)}
              label="Estado"
              sx={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'white',
                borderRadius: '10px',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 193, 7, 0.5)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFC107',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#FFC107',
                },
              }}
            >
              <MenuItem value="todos">🌐 Todos</MenuItem>
              <MenuItem value="pagado">✅ Pagado</MenuItem>
              <MenuItem value="pendiente">⏳ Pendiente</MenuItem>
              <MenuItem value="parcial">🔄 Parcial</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            size="small"
            onClick={onClearFilters}
            startIcon={<FilterListIcon />}
            sx={{
              color: '#FFC107',
              borderColor: '#FFC107',
              borderRadius: '10px',
              textTransform: 'none',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 193, 7, 0.15)',
                borderColor: '#FFC107',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Limpiar
          </Button>
        </Box>
      </Box>

      {/* Estadísticas mejoradas */}
      <Box 
        display="flex" 
        justifyContent="center" 
        flexWrap="wrap" 
        gap="12px"
        sx={{
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '-8px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '2px',
            background: 'linear-gradient(90deg, #4fc3f7, #66bb6a)',
            borderRadius: '2px',
          },
        }}
      >
        <Chip
          icon={<Typography sx={{ fontSize: '0.9rem' }}>📊</Typography>}
          label={`Total: ${totalFees}`}
          sx={{
            backgroundColor: 'rgba(79, 195, 247, 0.2)',
            color: '#4fc3f7',
            border: '1px solid rgba(79, 195, 247, 0.5)',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            padding: '8px 4px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(79, 195, 247, 0.3)',
              transform: 'translateY(-2px)',
            },
          }}
        />
        
        <Chip
          icon={<Typography sx={{ fontSize: '0.9rem' }}>✅</Typography>}
          label={`Pagados: ${paidFees}`}
          sx={{
            backgroundColor: 'rgba(76, 175, 80, 0.2)',
            color: '#4caf50',
            border: '1px solid rgba(76, 175, 80, 0.5)',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            padding: '8px 4px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(76, 175, 80, 0.3)',
              transform: 'translateY(-2px)',
            },
          }}
        />
        
        <Chip
          icon={<Typography sx={{ fontSize: '0.9rem' }}>⏳</Typography>}
          label={`Pendientes: ${pendingFees}`}
          sx={{
            backgroundColor: 'rgba(244, 67, 54, 0.2)',
            color: '#f44336',
            border: '1px solid rgba(244, 67, 54, 0.5)',
            fontWeight: 'bold',
            fontSize: '0.875rem',
            padding: '8px 4px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(244, 67, 54, 0.3)',
              transform: 'translateY(-2px)',
            },
          }}
        />
        
        {partialFees > 0 && (
          <Chip
            icon={<Typography sx={{ fontSize: '0.9rem' }}>🔄</Typography>}
            label={`Parciales: ${partialFees}`}
            sx={{
              backgroundColor: 'rgba(255, 152, 0, 0.2)',
              color: '#ff9800',
              border: '1px solid rgba(255, 152, 0, 0.5)',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              padding: '8px 4px',
              borderRadius: '12px',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 152, 0, 0.3)',
                transform: 'translateY(-2px)',
              },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default EnhancedFilterPanel;
