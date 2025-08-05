
import React from 'react';
import Layout from '../../components/Layout';
import { Box } from '@mui/material';
import './styles.css';

export const Dashboard = () => {
  return (
    <Layout>
      <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        height='100vh'
        overflow='hidden'
        className='animate__animated animate__fadeIn animate__faster'
      >
        <img src={'../../assets/icon-round.png'} alt='Dashboard' style={{ maxWidth: '90%', maxHeight: '90%' }} />
      </Box>
    </Layout>
  );
};
