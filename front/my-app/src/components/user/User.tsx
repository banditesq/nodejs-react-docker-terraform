import { useState } from 'react';
import axios from "axios";

function User() {

    const [data,setData] = useState("")

        axios.get('http://localhost:8080/user/details',{headers:{
            Authorization: `Bearer ${localStorage.getItem("auth")}` 

        }
        }).then((response:any) =>{
            setData(JSON.stringify(response.data))
        }).catch(err=>{
            setData(err)

        })



 

    
        


  return (
   <div>
   {data}
</div>
  );
}

export default User;
