import { useEffect } from 'react';
import { Button, Grid, TextField, useMediaQuery } from '@mui/material';

import { AuthLayout } from '../layout/AuthLayout';
import { useForm, useAuthStore } from '../../../hooks';

// import { useAuthStore, useForm } from '../../hooks';
import Swal from 'sweetalert2';

export const LoginPage = () => {
  const { startLogin, errorMessage } = useAuthStore();
  const isMobile = useMediaQuery('(max-width:768px)');

  const { email, password, onInputChange } = useForm({
    email: '',
    password: '',
  });

  const onSubmit = async (event) => {
    event.preventDefault();
    await startLogin({ email, password });
  };

  useEffect(() => {
    if (errorMessage !== undefined) {
      Swal.fire('Error en la autenticación', errorMessage, 'error');
    }
  }, [errorMessage]);

  return (
    <AuthLayout title='Login'>
      <form onSubmit={onSubmit} className='animate__animated animate__fadeIn animate__faster'>
        <Grid container>
          <Grid item xs={12} sx={{ mt: isMobile ? 1 : 2 }}>
            <TextField 
              label='Correo' 
              type='email' 
              placeholder='correo@google.com' 
              fullWidth 
              name='email' 
              value={email} 
              onChange={onInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff9800',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: '#ff9800',
                  }
                },
                '& .MuiOutlinedInput-input': {
                  color: '#fff',
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <TextField 
              label='Contraseña' 
              type='password' 
              placeholder='Contraseña' 
              fullWidth 
              name='password' 
              value={password} 
              onChange={onInputChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.08)',
                  },
                  '&.Mui-focused': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  '& fieldset': {
                    borderColor: 'rgba(255,255,255,0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(255,255,255,0.3)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff9800',
                  }
                },
                '& .MuiInputLabel-root': {
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-focused': {
                    color: '#ff9800',
                  }
                },
                '& .MuiOutlinedInput-input': {
                  color: '#fff',
                }
              }}
            />
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2, mt: 3 }}>
            <Grid item xs={12}>
              <Button 
                type='submit' 
                variant='contained' 
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 4px 16px rgba(255, 152, 0, 0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                    boxShadow: '0 6px 20px rgba(255, 152, 0, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                LOGIN
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};
