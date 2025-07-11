/* eslint-disable react/prop-types */
import { Chip, Tooltip } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

export const SequentialPaymentWarning = ({ hasPendingFees }) => {
  if (!hasPendingFees) return null;

  return (
    <Tooltip title="Este estudiante tiene cuotas anteriores pendientes. Debe pagarlas antes de poder pagar esta cuota.">
      <Chip
        icon={<WarningIcon fontSize="small" />}
        label="Cuotas pendientes"
        color="warning"
        size="small"
        variant="outlined"
        sx={{
          fontSize: '0.75rem',
          height: '24px',
          '& .MuiChip-icon': {
            fontSize: '16px'
          }
        }}
      />
    </Tooltip>
  );
};
