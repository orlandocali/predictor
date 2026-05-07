// src/App.tsx
// Root component. AuthProvider is nested inside BrowserRouter because it uses
// useNavigate internally. QueryClientProvider lives in main.tsx (above this).

import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth/AuthContext';
import Routes from '@/routes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;