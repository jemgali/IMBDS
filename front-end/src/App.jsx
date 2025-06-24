  import { Routes, Route } from "react-router-dom";
  import MapPage from './Pages/MapPage';
  import LoginPage from "./Pages/LoginPage";
  import UserPage from "./Pages/UserPage";
  import UserManage from "./components/UserManage";
  import Dashboard from "./components/Dashboard";
  import InvestiblePage from "./Pages/Investible";

  function App() {
    return (
      <Routes>  
        <Route path='/' element={<LoginPage />} />
        <Route path='/Dashboard' element={<Dashboard />}/>
        <Route path='/Map' element={<MapPage/>}/>
        <Route path='/Investibles' element={<InvestiblePage/>}/>
        <Route path='/User' element={<UserPage/>}/>
        <Route path='/UserManage' element={<UserManage />}/>
      </Routes>

  
    );
  }

  export default App;
