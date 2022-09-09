import './App.css';
import Signup from './components/signup/Signup';
import {
   BrowserRouter as Router,
   Routes,
   Route,
   Navigate
 } from "react-router-dom";
import Login from './components/login/Login';
import User from './components/user/User';


function App() {
  return (
   <>
   <Router>
     <Routes>
     <Route path="/" element={<Navigate replace to="/login" />} />

       <Route path="/signup" element={
         <Signup/>
         }/>
          <Route path="/login" element={
         <Login/>
       }/>   
       <Route path="/details" element={
         <User/>
       }/>  
     </Routes>
 </Router>
 </>

  );
}

export default App;
