import { Box, IconButton, Typography } from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import { LogoutOutlined } from '@mui/icons-material';
import { useAuthStore } from '../../hooks';
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts';
import SportsMmaIcon from '@mui/icons-material/SportsMma';

const Topbar = () => {
  const { startLogout } = useAuthStore();
  return (
    <Box display='flex' justifyContent='space-between' p={2}>
      {/* SEARCH BAR */}
      <Box display='flex' borderRadius='3px'>
        <Typography variant='h3' style={{ paddingRight: '10px' }}>
          Round 22
        </Typography>
        <SportsMartialArtsIcon fontSize='large' />
        <SportsMmaIcon fontSize='large' />
      </Box>

      {/* ICONS */}
      <Box display='flex'>
        <IconButton>
          <PersonOutlinedIcon />
        </IconButton>
        <IconButton color='error' onClick={startLogout}>
          <LogoutOutlined />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Topbar;
