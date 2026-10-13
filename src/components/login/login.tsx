import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import  { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import axios from 'axios'
import {  useNavigate } from 'react-router-dom'
import { authcontext } from '../context/authcontext'
import Nemo from "./../../assets/nemo (2).jpg"


type inputs = {
  email: string,
  password: string
}

const login = () => {
 const {usertoken}= useContext(authcontext)


const navigate = useNavigate()

 const[isLoading , SetIsloading] = useState<boolean>(false)


const { register, handleSubmit,  formState: { touchedFields, errors } } = useForm<inputs>({
  defaultValues: {
    email: "",
    password: "",
  },
})

async function signin(values:inputs){
  SetIsloading(true)
 try {
   const {data}= await axios.post("https://route-posts.routemisr.com/users/signin" , values ,{
    headers:{
      "Content-Type":"application/json"
    }
  })
  
SetIsloading(false)
  toast.success(data.message);
  
  usertoken(data.data.token)
  localStorage.setItem("token",data.data.token)

  navigate("/Home")


 } catch (e) {
  console.log(e.response.data.message);
  

  
SetIsloading(false)
toast.error(e.response.data.message);

 }
 
}



  return (
    <>
    
    <div className='bg-web min-vh-100 p-5 d-flex flex-column justify-content-center align-items-lg-center     '>
  
      
      <div className='frame  glassyy-bg p-5'> 
        <div className='d-flex flex-column justify-content-center align-items-center'> 
             <div className=' d-flex justify-content-start flex-column '>
        <h1 className='text-white script fs-logo '>Nemo</h1>
        <p className='text-white fs-4 mb-0 text-lg-center'>Welcome back.</p>
        <p className='text-white fs-4'>glad to see you again.</p>


      </div>  
            <div className='d-flex flex-column w-100  '>
              <form className="d-flex flex-column gap-3 mt-3 w-100" onSubmit={handleSubmit(signin)}>

              <div className=" ">
  <div className="input-wrap">
    <i className="fa-regular fa-envelope input-icon"></i>
    <input
      id="email"
      {...register("email", {
        required: {
          value: true,
          message: "Email is required",
        },
      })}
      type="email"
      placeholder="Email address"
      className="inputbox"
    />
  </div>
  {touchedFields?.email && errors?.email && (
    <p className="mt-2 mb-1 ms-2 text-danger">{errors?.email?.message}</p>
  )}
</div>

                <div className=" ">
  <div className="input-wrap">
    <i className="fa-regular fa-eye-slash input-icon"></i>
    <input
      id="password"
      {...register("password", {
        required: {
          value: true,
          message: "Password is required",
        },
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
          message:
            "Password must include uppercase, lowercase, a number, and a special character",
        },
      })}
      type="password"
      placeholder="Password"
      className="inputbox"
    />
  </div>
  {touchedFields?.password && errors?.password && (
    <p className="mt-2 mb-1 ms-2 text-danger">{errors?.password?.message}</p>
  )}
</div>

                   <button type="submit" className="signup-btn">{isLoading ? <i className='fa-spinner fa-solid fa-spin text-black'></i> : <p className='mb-0 text-black'>Log-in</p>}</button>
                   <div>
          <div className='d-flex  gap-2 justify-content-center '>
            <p className='text-white mb-0'>Don't have an account?</p>
            <Link to='/Register' className='text-decoration-none text-success'>Sign up</Link>
          </div>
        </div>
                  </form>
            </div>
            </div>
            </div>

      </div>
      
    </>
  )
}

export default login