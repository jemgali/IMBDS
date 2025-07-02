import { Routes, Route } from "react-router-dom";
import InteractiveMapPage from './Pages/InteractiveMapPage';
import LoginPage from "./Pages/LoginPage";
import UserManagePage from "./Pages/UserManagePage";
import Dashboard from "./components/Dashboard";
import InvestiblePage from "./Pages/Investible";
import './index.css';
import './app.css';

function App() {
  return (
    <Routes>
      <Route path='/' element={<LoginPage />} />
      <Route path='/Dashboard' element={<Dashboard />} />
      <Route path='/Map' element={<InteractiveMapPage />} />
      <Route path='/Investibles' element={<InvestiblePage />} />
      <Route path='/UserManage' element={<UserManagePage />} />
    </Routes>


  );
}

export default App;
