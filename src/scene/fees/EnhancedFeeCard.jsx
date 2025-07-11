import React from 'react';
import {
  Card,
  CardActions,
  CardContent,
  Button,
  Typography,
  Chip,
  Box,
} from '@mui/material';
import { format } from 'date-fns';

/**
 * Componente de tarjeta de cuota mejorado con diseño moderno
 */
export const EnhancedFeeCard = ({ fee, onEdit, onView, onPay }) => {
  // Cálculos de pago
  const feeValue = Number(fee.value) || 0;
  const amountPaid = Number(fee.amountPaid) || 0;
  const remainingPayment = Math.max(0, feeValue - amountPaid);

  const isFullyPaid = remainingPayment <= 0 && amountPaid > 0;
  const isPartialPaid = amountPaid > 0 && remainingPayment > 0;
  const progressPercentage = feeValue > 0 ? Math.min(100, (amountPaid / feeValue) * 100) : 0;

  // Colores dinámicos
  const getStatusColor = () => {
    if (isFullyPaid) return { bg: '#1e3a1e', border: '#4caf50', shadow: 'rgba(76,175,80,0.3)' };
    if (isPartialPaid) return { bg: '#2a2a2a', border: '#ff9800', shadow: 'rgba(255,152,0,0.2)' };
    return { bg: '#2a2a2a', border: '#f44336', shadow: 'rgba(244,67,54,0.2)' };
  };

  const colors = getStatusColor();

  return (
    <Card
      sx={{
        height: '100%',
        width: '100%',
        maxWidth: '380px',
        minWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '20px',
        backgroundColor: colors.bg,
        color: '#FFFFFF',
        border: `2px solid ${colors.border}`,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        
        // Efecto de brillo
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: isFullyPaid
            ? 'linear-gradient(90deg, transparent, rgba(76,175,80,0.15), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          transition: 'left 0.6s ease',
        },
        
        '&:hover': {
          transform: 'translateY(-12px) scale(1.02)',
          boxShadow: `0 20px 40px ${colors.shadow}, 0 0 0 1px ${colors.border}30`,
          '&::before': {
            left: '100%',
          },
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Header con nombre y estado */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            {fee.nameStudent}
          </Typography>
          <Chip
            label={isFullyPaid ? 'PAGADO' : isPartialPaid ? 'PARCIAL' : 'PENDIENTE'}
            size="small"
            sx={{
              backgroundColor: isFullyPaid ? '#4caf50' : isPartialPaid ? '#ff9800' : '#f44336',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.75rem',
              borderRadius: '12px',
            }}
          />
        </Box>

        {/* Información monetaria con iconos */}
        <Box mb={2.5}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              💰 Valor cuota:
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="#4fc3f7">
              ${feeValue.toLocaleString()}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              ✅ Pagado:
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="#66bb6a">
              ${amountPaid.toLocaleString()}
            </Typography>
          </Box>

          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="body2" color="rgba(255,255,255,0.8)" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              ⏳ Restante:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={isFullyPaid ? '#66bb6a' : '#ef5350'}
            >
              ${remainingPayment.toLocaleString()}
            </Typography>
          </Box>

          {/* Barra de progreso mejorada */}
          <Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography variant="caption" color="rgba(255,255,255,0.8)">
                📊 Progreso
              </Typography>
              <Box
                sx={{
                  backgroundColor: isFullyPaid ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255,255,255,0.1)',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  border: isFullyPaid ? '1px solid rgba(76, 175, 80, 0.4)' : 'none',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: isFullyPaid ? '#4caf50' : 'rgba(255,255,255,0.9)',
                    fontWeight: isFullyPaid ? 'bold' : 'normal',
                    fontSize: '0.75rem',
                  }}
                >
                  {Math.round(progressPercentage)}%
                </Typography>
              </Box>
            </Box>
            
            <Box
              sx={{
                width: '100%',
                height: 12,
                backgroundColor: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                overflow: 'hidden',
                border: isFullyPaid ? '2px solid #4caf50' : '1px solid rgba(255,255,255,0.2)',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  width: `${progressPercentage}%`,
                  height: '100%',
                  background: isFullyPaid
                    ? 'linear-gradient(45deg, #4caf50, #66bb6a)'
                    : isPartialPaid
                    ? 'linear-gradient(45deg, #ff9800, #ffb74d)'
                    : 'linear-gradient(45deg, #f44336, #ef5350)',
                  transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isFullyPaid
                    ? '0 0 12px rgba(76,175,80,0.6)'
                    : isPartialPaid
                    ? '0 0 8px rgba(255,152,0,0.4)'
                    : '0 0 8px rgba(244,67,54,0.4)',
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Fecha de vencimiento mejorada */}
        <Box
          sx={{
            backgroundColor: isFullyPaid ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.08)',
            padding: '12px',
            borderRadius: '12px',
            border: isFullyPaid ? '1px solid rgba(76,175,80,0.3)' : '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: isFullyPaid ? '#4caf50' : 'rgba(255,255,255,0.9)',
              fontWeight: '500',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>
              {isFullyPaid ? '🎉' : '📅'}
            </span>
            {isFullyPaid 
              ? 'Completamente pagado' 
              : `Vence: ${format(new Date(fee.startDate), 'dd/MM/yyyy')}`
            }
          </Typography>
        </Box>
      </CardContent>

      {/* Botones de acción mejorados */}
      <CardActions sx={{ p: 3, pt: 0, gap: 1.5 }}>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onEdit(fee)}
          sx={{
            color: '#FFC107',
            borderColor: '#FFC107',
            '&:hover': {
              backgroundColor: 'rgba(255, 193, 7, 0.15)',
              borderColor: '#FFC107',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
            },
            flex: 1,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          ✏️ Editar
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={() => onView(fee)}
          sx={{
            color: '#4fc3f7',
            borderColor: '#4fc3f7',
            '&:hover': {
              backgroundColor: 'rgba(79, 195, 247, 0.15)',
              borderColor: '#4fc3f7',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(79, 195, 247, 0.3)',
            },
            flex: 1,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: '600',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
              background: 'linear-gradient(45deg, #4caf50, #66bb6a)',
              color: 'white',
              flex: 1,
              borderRadius: '12px',
              fontWeight: 'bold',
              opacity: 0.9,
              cursor: 'default',
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
            }}
          >
            🎉 Completado
          </Button>
        ) : (
          <Button
            size="small"
            variant="contained"
            onClick={() => onPay(fee)}
            sx={{
              background: 'linear-gradient(45deg, #66bb6a, #4caf50)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4caf50, #388e3c)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(76, 175, 80, 0.4)',
              },
              flex: 1,
              borderRadius: '12px',
              fontWeight: 'bold',
              textTransform: 'none',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            💰 Pagar
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default EnhancedFeeCard;
