import { useState } from 'react';
import './Login.css';
import axios from "axios";
import { Link } from 'react-router-dom';
function Login() {

   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")


  const handleClick = async()=>{
    try {
 
        const res = await axios.post("http://localhost:8080/user_auth/login",{
            email,
            password
           })

        localStorage.setItem("auth",res.data.auth_token)   

          
           
           
    } catch (error) {
        
        
    }
  

  }

    
        


  return (
    <div className='wrapper'>
    <div className='form-wrapper'>
       <h2>Login</h2>
          
          <div className='email'>
             <label htmlFor="email">Email</label>
             <input type='email' name='email' onChange={(e)=>setEmail(e.target.value)}
             />
          </div>
          <div className='password'>
             <label htmlFor="password">Password</label>
             <input type='password' name='password' onChange={(e)=>setPassword(e.target.value)}
             />
          </div>              
          <div>
             <button onClick={handleClick} >Login</button>
             <Link to="/signup"> <button>Signup</button></Link> 

          </div>
 </div>
</div>
  );
}

export default Login;
