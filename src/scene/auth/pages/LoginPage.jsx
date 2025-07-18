import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Grid, Link, TextField } from '@mui/material';

import { AuthLayout } from '../layout/AuthLayout';
import { useForm, useAuthStore } from '../../../hooks';

// import { useAuthStore, useForm } from '../../hooks';
import Swal from 'sweetalert2';

export const LoginPage = () => {
  const { startLogin, errorMessage } = useAuthStore();

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
