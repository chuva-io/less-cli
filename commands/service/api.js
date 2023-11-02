import axios from 'axios';

const api = axios.create({
  baseURL: 'https://less-server.chuva.io/',
});

export default api;
