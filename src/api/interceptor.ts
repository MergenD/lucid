import { API_URL } from '../constants/apiUrl';
import axios from 'axios';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);
