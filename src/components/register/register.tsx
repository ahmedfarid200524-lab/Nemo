import axios from 'axios'
import  { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'





type inputs = {
  name: string,
  username: string,
  email: string,
  password: string,
  rePassword: string,
  gender: string,
  dateOfBirth: string,
}

const register = () => {
  const navigate = useNavigate()

 const[isLoading , SetIsloading] = useState<boolean>(false)


const { register, handleSubmit,  formState: { touchedFields, errors } } = useForm<inputs>({
  defaultValues: {
    name: "",
    username: "",
    email: "",
    password: "",
    rePassword: "",
    gender: "",
    dateOfBirth: "",
  },
})



async function signup(values:inputs){
  SetIsloading(true)
 try {
   const {data}= await axios.post("https://route-posts.routemisr.com/users/signup" , values ,{
    headers:{
      "Content-Type":"application/json"
    }
  })
  
SetIsloading(false)
  toast.success(data.message);
  navigate("/Login")


 } catch (e) {
 
  

  
SetIsloading(false)
toast.error("Something went wrong");

 }
 
}

  return (
   <>
      <div className='bg-web min-vh-100 p-5 d-flex flex-column justify-content-center align-items-lg-center '>
        <div className='glassyy-bg frame p-3 ps-3 pe-3 ps-lg-5 pe-lg-5 d-flex flex-column justify-content-center align-items-center'>

        
        
      <div className=' d-flex justify-content-start flex-column '>
        <h1 className='text-white script fs-logo '>Nemo</h1>
        <p className='text-white fs-4 mb-0'>Share your world.</p>
        <p className='text-white fs-4'>see what others see.</p>
      </div>
      <div className='d-flex flex-column w-100  '>
     <form className="d-flex flex-column gap-3 mt-3 w-100" onSubmit={handleSubmit(signup)}>

  <div className=" ">
  <div className="input-wrap">
    <i className="fa-regular fa-user input-icon"></i>
    <input
      id="name"
      {...register("name", {
        required: {
          value: true,
          message: "Name is required",
        },
      })}
      type="text"
      placeholder="Full name"
      className="inputbox"
    />
  </div>
  {touchedFields?.name && errors?.name && (
    <p className="mt-2 mb-1 ms-2 text-danger">{errors?.name?.message}</p>
  )}
</div>

<div className=" ">
  <div className="input-wrap">
    <i className="fa-regular fa-id-badge input-icon"></i>
    <input
      id="username"
      {...register("username", {
        required: {
          value: true,
          message: "Username is required",
        },
        pattern: {
          value: /^[a-z0-9]{3,30}$/,
          message:
            "Username must be 3-30 characters, using only lowercase letters and numbers",
        },
      })}
      type="text"
      placeholder="Username"
      className="inputbox"
    />
  </div>
  {touchedFields?.username && errors?.username && (
    <p className="mt-2 mb-1 ms-2 text-danger">{errors?.username?.message}</p>
  )}
</div>

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

  <div className="">
  <div className="input-wrap">
    <i className="fa-regular fa-circle-check input-icon"></i>
    <input
      id="rePassword"
      {...register("rePassword", {
        required: {
          value: true,
          message: "Re-enter the password",
        },
        pattern: {
          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/,
          message:
            "Password must include uppercase, lowercase, a number, and a special character",
        },
      })}
      type="password"
      placeholder="Re-enter password"
      className="inputbox"
    />
  </div>

  {touchedFields?.rePassword && errors?.rePassword && (
    <p className="mt-2 mb-1 ms-2 text-danger">{errors?.rePassword?.message}</p>
  )}
</div>

<div>
  <div className="input-wrap">
    <i className="fa-regular fa-calendar input-icon"></i>
    <input
      id="date"
      type="date"
      max={new Date().toISOString().split("T")[0]}
      {...register("dateOfBirth", {
        required: {
          value: true,
          message: "Date of birth is required",
        },
        validate: (value) =>
          new Date(value) <= new Date() || "Date can't be in the future",
      })}
      className="inputbox"
    />
  </div>
  {touchedFields?.dateOfBirth && errors?.dateOfBirth && (
    <p className="mt-2 mb-1 ms-2 text-danger">{errors?.dateOfBirth?.message}</p>
  )}
</div>

    <div>
  <div className="d-flex justify-content-around">
    <div>
      <input
        type="radio"
        id="male"
        value="male"
        {...register("gender", { required: "Please select your gender" })}
      />
      <label htmlFor="male" className="text-white ms-2">Male</label>
    </div>

    <div>
      <input
        type="radio"
        id="female"
        value="female"
        {...register("gender", { required: "Please select your gender" })}
      />
      <label htmlFor="female" className="text-white ms-2">Female</label>
    </div>
  </div>

  {touchedFields?.gender && errors?.gender && (
    <p className="mt-2 mb-1 ms-2 text-danger">{errors?.gender?.message}</p>
  )}
</div>

  <button type="submit" className="signup-btn">{isLoading ? <i className='fa-spinner fa-solid fa-spin text-black'></i> : <p className='mb-0 text-black'>Sign-up</p>}</button>
   <div>
          <div className='d-flex  gap-2 justify-content-center '>
            <p className='text-white mb-0'>Already have an account?</p>
            <Link to="/Login" className='text-decoration-none text-success'>Log in</Link>
          </div>
        </div>

      </form>
      </div>
        
       
</div>
      </div>

   </>
  )
}

export default register