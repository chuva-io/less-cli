import axios from 'axios';
import CONFIG from '../../utils/config.js';

const api = axios.create({
  baseURL: CONFIG.LESS_SERVER_BASE_URL
});

export default api;
