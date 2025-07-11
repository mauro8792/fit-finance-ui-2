/* eslint-disable react/prop-types */
import { 
  Alert, 
  AlertTitle, 
  Box, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Typography 
} from '@mui/material';
import { format } from 'date-fns';

export const UnpaidFeesAlert = ({ unpaidFees, studentName }) => {
  if (!unpaidFees || unpaidFees.length === 0) {
    return null;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const getMonthColor = (startDate) => {
    const today = new Date();
    const feeDate = new Date(startDate);
    const daysDiff = Math.floor((today - feeDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 30) return 'error';  // Vencida hace más de 30 días
    if (daysDiff > 0) return 'warning'; // Vencida
    return 'default'; // No vencida
  };

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <AlertTitle>
        <strong>⚠️ Cuotas anteriores pendientes</strong>
      </AlertTitle>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        <strong>{studentName}</strong> tiene cuotas anteriores sin pagar. 
        Debe saldar las siguientes cuotas antes de poder pagar cuotas posteriores:
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>Período</strong></TableCell>
              <TableCell><strong>Fecha vencimiento</strong></TableCell>
              <TableCell align="right"><strong>Monto pendiente</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unpaidFees.map((fee) => {
              // Calcular monto pendiente de forma segura
              const feeValue = Number(fee.value) || 0;
              const amountPaid = Number(fee.amountPaid) || 0;
              const remainingAmount = Math.max(0, feeValue - amountPaid);
              
              return (
                <TableRow key={fee.id} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {fee.monthName} {fee.year}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {format(new Date(fee.endDate), 'dd/MM/yyyy')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      {formatCurrency(remainingAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={getMonthColor(fee.startDate) === 'error' ? 'Vencida' : 
                             getMonthColor(fee.startDate) === 'warning' ? 'Por vencer' : 'Vigente'}
                      color={getMonthColor(fee.startDate)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, p: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: 1 }}>
        <Typography variant="body2" fontStyle="italic">
          💡 <strong>Política de pagos:</strong> Para mantener el orden administrativo, 
          los pagos deben realizarse de forma secuencial. Una vez que pague las cuotas 
          pendientes, podrá continuar con el pago de las cuotas más recientes.
        </Typography>
      </Box>
    </Alert>
  );
};
