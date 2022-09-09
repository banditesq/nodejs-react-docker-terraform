import { useState } from 'react';
import './Signup.css';
import axios from "axios";
import { Link } from 'react-router-dom';


function Signup() {
   const [first_name, setFirstName] = useState("")
   const [last_name, setLasttName] = useState("")
   const [email, setEmail] = useState("")
   const [password, setPassword] = useState("")


  const handleClick = async()=>{
    try {
    
        const res = await axios.post("http://localhost:8080/user_auth/signup",{
            first_name,
            last_name,
            email,
            password
           })
           
    } catch (error) {
        
        
    }
  

  }

    
        


  return (
    <div className='wrapper'>
    <div className='form-wrapper'>
       <h2>Sign Up</h2>
    
           <div className='first_name'>
             <label htmlFor="first_name">Firstname</label>
             <input type='text' name='first_name'  onChange={(e)=>setFirstName(e.target.value)}
             />
              <div className='last_name'>
             <label htmlFor="last_name">last name</label>
             <input type='text' name='last_name' onChange={(e)=>setLasttName(e.target.value)}
             />
          </div>
          </div>
          
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
            <button onClick={handleClick} >Register Me</button>
            <Link to="/login"> <button>Login</button></Link> 

            

          </div>
 </div>
</div>
  );
}

export default Signup;
