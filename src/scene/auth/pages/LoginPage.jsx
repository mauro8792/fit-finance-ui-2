import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Grid, Link, TextField, Alert, Box } from '@mui/material';

import { AuthLayout } from '../layout/AuthLayout';
import { useForm, useAuthStore } from '../../../hooks';

// import { useAuthStore, useForm } from '../../hooks';
import Swal from 'sweetalert2';

export const LoginPage = () => {
  const { startLogin, errorMessage } = useAuthStore();
  const [debugLog, setDebugLog] = useState([]);

  const addLog = (message) => {
    console.log(message);
    setDebugLog(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const { email, password, onInputChange } = useForm({
    email: '',
    password: '',
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    
    addLog('🚀 Iniciando login...');
    addLog(`📧 Email: ${email}`);
    addLog(`🔐 Password: ${password ? '***' : 'vacío'}`);
    addLog(`🌐 API URL: ${import.meta.env.VITE_API_URL}`);
    
    try {
      addLog('📤 Enviando petición de login...');
      await startLogin({ email, password });
      addLog('✅ Login completado');
    } catch (error) {
      addLog(`❌ Error en login: ${error.message}`);
    }
  };

  useEffect(() => {
    addLog('🔄 Componente LoginPage cargado');
    addLog(`🌐 API URL configurada: ${import.meta.env.VITE_API_URL}`);
  }, []);

  useEffect(() => {
    if (errorMessage !== undefined) {
      addLog(`❌ Error de autenticación: ${errorMessage}`);
      Swal.fire('Error en la autenticación', errorMessage, 'error');
    }
  }, [errorMessage]);

  return (
    <AuthLayout title='Login'>
      {/* Debug Panel - Solo visible en desarrollo */}
      <Box sx={{ 
        mb: 2, 
        p: 1, 
        backgroundColor: '#f5f5f5', 
        borderRadius: 1,
        maxHeight: '200px',
        overflowY: 'auto',
        fontSize: '12px'
      }}>
        <strong>🔧 Debug Log:</strong>
        {debugLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </Box>

      <form onSubmit={onSubmit} className='animate__animated animate__fadeIn animate__faster'>
        <Grid container>
          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField label='Correo' type='email' placeholder='correo@google.com' fullWidth name='email' value={email} onChange={onInputChange} />
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField label='Contraseña' type='password' placeholder='Contraseña' fullWidth name='password' value={password} onChange={onInputChange} />
          </Grid>

          {/* <Grid container display={!!errorMessage ? '' : 'none'} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Alert severity='error'>{errorMessage}</Alert>
            </Grid>
          </Grid> */}

          <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <Button type='submit' variant='contained' fullWidth>
                Login
              </Button>
            </Grid>
            {/* <Grid item xs={12} sm={6}>
              <Button  variant='contained' fullWidth onClick={onGoogleSignIn}>
                <Google />
                <Typography sx={{ ml: 1 }}>Google</Typography>
              </Button>
            </Grid> */}
          </Grid>

          <Grid container direction='row' justifyContent='end'>
            <Link component={RouterLink} color='inherit' to='/auth/register'>
              Crear una cuenta
            </Link>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};
