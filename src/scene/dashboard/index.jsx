import { Box } from '@mui/material';
import './styles.css';

export const Dashboard = () => {
  return (
    <Box
      display='flex'
      justifyContent='center'
      alignItems='center'
      // marginTop={'5%'}
      height='100vh' // Ajustar la altura al 100% del viewport
      overflow='hidden' // Evitar el desplazamiento si la imagen es grande
      className='animate__animated animate__fadeIn animate__faster'
    >
      <img src={`../../assets/icon-round.png`} alt='Dashboard' style={{ maxWidth: '90%', maxHeight: '90%' }} />
    </Box>
  );
};
