import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

export default {
  LESS_SERVER_BASE_URL: process.env.LESS_SERVER_BASE_URL || "https://less-server.chuva.io",
  LESS_SERVER_SOCKET_URL: process.env.LESS_SERVER_SOCKET_URL || "wss://less-server.chuva.io",
  LESS_API_BASE_URL: process.env.LESS_API_BASE_URL || "https://q5t9ggvveb.execute-api.eu-west-1.amazonaws.com/less"
};
