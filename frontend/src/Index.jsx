  import { Routes, Route } from "react-router";
  import MapPage from './Pages/MapPage';
  import LoginPage from "./Pages/LoginPage";
  import UserPage from "./Pages/UserPage";
  import DashPage from "./Pages/DashPage";
  import BusinessPage from "./Pages/BusinessPage";
  import InvestiblePage from "./Pages/InvestiblePage";
  import ReportPage from "./Pages/ReportPage";

  function App() {
    return (
      <Routes>  
        <Route path='/' element={<LoginPage />} />
        <Route path='/Dashboard' element={<DashPage />}/>
        <Route path='/Map' element={<MapPage/>}/>
        <Route path='/Business' element={<BusinessPage/>}/>
        <Route path='/Investible' element={<InvestiblePage/>}/>
        <Route path='/User' element={<UserPage/>}/>
        <Route path='/Reports' element={<ReportPage/>}/>
      </Routes>

  
    );
  }

  export default App;
