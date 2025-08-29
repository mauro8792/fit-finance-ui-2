import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';

const TouchTestComponent = () => {
  const [clickCount, setClickCount] = useState(0);
  const [lastClick, setLastClick] = useState('');

  const handleTestClick = () => {
    const timestamp = new Date().toLocaleTimeString();
    console.log('🟢 TEST BUTTON CLICKED!', timestamp);
    setClickCount(prev => prev + 1);
    setLastClick(timestamp);
  };

  const handleTestTouch = () => {
    console.log('👆 TOUCH EVENT DETECTED!');
  };

  const handleNavigationTest = () => {
    console.log('🚀 NAVIGATION TEST - Going to /student/routine');
    window.location.href = '/student/routine';
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 9999,
        backgroundColor: 'orange',
        padding: '10px',
        borderRadius: '8px',
        border: '2px solid red'
      }}
    >
      <Typography variant="h6" sx={{ color: 'black', mb: 1 }}>
        TOUCH TEST
      </Typography>
      
      <Button 
        variant="contained" 
        onClick={handleTestClick}
        onTouchStart={handleTestTouch}
        sx={{ mb: 1, display: 'block', width: '100%' }}
      >
        Test Click ({clickCount})
      </Button>
      
      <Button 
        variant="contained" 
        color="secondary"
        onClick={handleNavigationTest}
        sx={{ mb: 1, display: 'block', width: '100%' }}
      >
        Navigate Test
      </Button>
      
      <Typography variant="body2" sx={{ color: 'black' }}>
        Last: {lastClick}
      </Typography>
    </Box>
  );
};

export default TouchTestComponent;
