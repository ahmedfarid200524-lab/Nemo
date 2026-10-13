import  { createContext, useEffect, useState, type ReactNode } from 'react'



export const authcontext = createContext()

const authcontextProvider = ({children} : {children : ReactNode}) => {

    const [token ,setToken]=useState(null)

    function usertoken(tkn){
        setToken(tkn)
    }

    function LogoutContext(){
        setToken(null)
        localStorage.removeItem("token")
    }
    


useEffect(function (){
    if(localStorage.getItem("token") != null){
        setToken(localStorage.getItem("token"))
    }
})
  return (
   <authcontext.Provider value={
   
        {usertoken, token, LogoutContext}

   }>
        {children}
   </authcontext.Provider>
  )
}

export default authcontextProvider