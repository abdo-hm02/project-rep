import AuthPage from './components/AuthPage';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginVerification from './components/Authentification/verification/LoginVerification';
import RegistrationFlow from './components/Authentification/RegistrationFlow';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material';
import DashUser from './components/Dash/DashUser';
import Insurance from './components/Dash/Insurance';
import NewInsurance from './components/Dash/ins/NewInsurance';
import AgentDashboard from './components/InsuranceAgent/AgentDashboard';
import ClaimForm from './components/Dash/ins/ClaimForm';
import ClaimsDashboard from './components/InsuranceAgent/ClaimsDashboard';
import RenewInsurance from './components/Dash/ins/RenewInsurance';
import Conservation from './components/Dash/Conservation';
import ConsulterTitre from './components/Dash/conservation/ConsulterTitre';
import AgentConsDash from './components/ConservationAgent/AgentConsDash';
import Immatriculation from './components/Dash/conservation/Immatriculation';
import AgentPropertyDash from './components/ConservationAgent/AgentPropertyDash';

const theme = createTheme();

function App() {
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Router>
          <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth/verify" element={<LoginVerification />} />
          <Route path="/register/*" element={<RegistrationFlow />} />

          <Route path="/DashUser" element={<DashUser />} />

          <Route path="/insurance" element={<Insurance />} /> 
          <Route path="/insurance/new" element={<NewInsurance />} />
          <Route path="/insurance/claim" element={<ClaimForm />} />
          <Route path="/insurance/renew" element={<RenewInsurance />} />
          
          <Route path="/conservation" element={<Conservation  />} /> 
          <Route path="/conservation/search" element={<ConsulterTitre  />} /> 
          <Route path="/conservation/register" element={<Immatriculation  />} /> 


          <Route path="/agent/insurancedash" element={<AgentDashboard />} />
          <Route path="/agent/claimdash" element={<ClaimsDashboard />} />

          <Route path="/agent/conservationdash" element={<AgentConsDash />} />
          <Route path="/agent/propertydash" element={<AgentPropertyDash />} />

          </Routes>
        </Router>
    </ThemeProvider>
  )
}

export default App


