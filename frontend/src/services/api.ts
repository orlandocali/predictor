import axios from 'axios';

// In local dev: VITE_API_URL=http://localhost:8081 (direct connection)
// In Docker: VITE_API_URL is empty, so requests are relative and nginx proxies /api -> backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;