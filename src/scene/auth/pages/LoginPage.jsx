import { useEffect, useState } from 'react';
import { Button, Grid, TextField, useMediaQuery, InputAdornment, IconButton } from '@mui/material';
import { Email as EmailIcon, Lock as LockIcon, Visibility, VisibilityOff } from '@mui/icons-material';

import { AuthLayout } from '../layout/AuthLayout';
import { useForm, useAuthStore } from '../../../hooks';

import Swal from 'sweetalert2';

// Estilos reutilizables para los campos de texto - TEMA OSCURO
const textFieldStyles = {
  '& .MuiOutlinedInput-root': {
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#222',
      '& fieldset': {
        borderColor: 'rgba(255,152,0,0.4) !important',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#1f1f1f',
      boxShadow: '0 0 0 2px rgba(255,152,0,0.2)',
    },
    '& fieldset': {
      borderColor: 'rgba(255,152,0,0.2)',
      borderWidth: 1,
    },
    '&.Mui-focused fieldset': {
      borderColor: '#ff9800 !important',
      borderWidth: 2,
    }
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#ff9800',
      fontWeight: 600,
    }
  },
  '& .MuiOutlinedInput-input': {
    color: '#fff',
    padding: '14px 14px',
    '&::placeholder': {
      color: 'rgba(255,255,255,0.3)',
      opacity: 1,
    }
  },
  '& .MuiInputAdornment-root': {
    color: 'rgba(255,255,255,0.4)',
  }
};

export const LoginPage = () => {
  const { startLogin, errorMessage } = useAuthStore();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [showPassword, setShowPassword] = useState(false);

  const { email, password, onInputChange } = useForm({
    email: '',
    password: '',
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

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
          <Grid item xs={12} sx={{ mt: isMobile ? 1 : 0 }}>
            <TextField 
              label='Correo electrónico' 
              type='email' 
              placeholder='tu@email.com' 
              fullWidth 
              name='email' 
              value={email} 
              onChange={onInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ fontSize: 20, color: 'rgba(255,152,0,0.6)' }} />
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyles}
            />
          </Grid>

          <Grid item xs={12} sx={{ mt: 2.5 }}>
            <TextField 
              label='Contraseña' 
              type={showPassword ? 'text' : 'password'}
              placeholder='••••••••' 
              fullWidth 
              name='password' 
              value={password} 
              onChange={onInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ fontSize: 20, color: 'rgba(255,152,0,0.6)' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePassword}
                      edge="end"
                      sx={{ 
                        color: 'rgba(255,255,255,0.4)',
                        '&:hover': {
                          color: '#ff9800',
                          backgroundColor: 'rgba(255,152,0,0.1)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={textFieldStyles}
            />
          </Grid>

          <Grid container spacing={2} sx={{ mb: 2, mt: 3 }}>
            <Grid item xs={12}>
              <Button 
                type='submit' 
                variant='contained' 
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #ff9800 0%, #e65100 100%)',
                  borderRadius: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  boxShadow: '0 4px 20px rgba(255, 152, 0, 0.35)',
                  border: 'none',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #fb8c00 0%, #e65100 100%)',
                    boxShadow: '0 6px 25px rgba(255, 152, 0, 0.5)',
                    transform: 'translateY(-2px)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: '0 2px 10px rgba(255, 152, 0, 0.3)',
                  },
                  transition: 'all 0.25s ease'
                }}
              >
                Ingresar
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </AuthLayout>
  );
};
