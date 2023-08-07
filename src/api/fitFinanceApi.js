import axios from 'axios';
import { getEnvVariables } from '../helpers';

const { VITE_API_URL } = getEnvVariables();

const financeApi = axios.create({
  baseURL: VITE_API_URL,
});

// Todo: configurar interceptores
financeApi.interceptors.request.use((config) => {
  config.headers = {
    ...config.headers,
    'Bearer ': localStorage.getItem('token'),
  };

  return config;
});

export default financeApi;
