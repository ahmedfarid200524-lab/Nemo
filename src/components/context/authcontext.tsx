import { createContext, useEffect, useState, type ReactNode } from 'react'

type AuthContextType = {
    usertoken: (tkn: string | null) => void
    token: string | null
    LogoutContext: () => void
}

export const authcontext = createContext<AuthContextType>({
    usertoken: () => {},
    token: null,
    LogoutContext: () => {},
})

const authcontextProvider = ({children} : {children : ReactNode}) => {

    const [token ,setToken]=useState<string | null>(null)

    function usertoken(tkn: string | null){
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
}, [])
  return (
   <authcontext.Provider value={
   
        {usertoken, token, LogoutContext}

   }>
        {children}
   </authcontext.Provider>
  )
}

export default authcontextProvider