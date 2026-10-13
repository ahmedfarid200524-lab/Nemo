import  { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

const Protectedroute = ({children} :{children: ReactNode}) => {
if(localStorage.getItem("token") === null ){

    return <Navigate to={"/Login"} />
}

  return (
    <>
        {children}
    </>
  )
}

export default Protectedroute