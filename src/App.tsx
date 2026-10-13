import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Error from './components/error'
import Register from './components/register/register'
import Login from './components/login/login'
import Home from './components/home/home'
import Addpost from './components/addpost/Addpost'
import AuthcontextProvider from './components/context/authcontext'
import { Toaster } from 'react-hot-toast'
import Protectedroute from './components/Protectedroute/Protectedroute'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Profile from './components/Profile/Profile'
import Userprofile from './components/userprofiles/Userprofile'
import Postpage from "./components/Postdetails/Postpage"
import Settings from './components/settings/Settings'
import Notifications from './components/notifications/Notifications'








const router = createBrowserRouter([
  { path: '*', element: <Error /> },
  { path: 'Register', element:  <Register />  },
  { path: '', element: <Login /> },
  { path: 'Login', element: <Login /> },
  { path: 'Register', element: <Register /> },
  { path: 'Home', element:<Protectedroute> <Home /> </Protectedroute> },
  { path: 'Profile', element:<Protectedroute> <Profile /> </Protectedroute> },
  { path: 'Userprofile/:id', element:<Protectedroute> <Userprofile /> </Protectedroute> },
  { path: 'Addpost', element:<Protectedroute> <Addpost /> </Protectedroute>},
  { path: 'Settings', element:<Protectedroute> <Settings /> </Protectedroute>},
  { path: 'Notifications', element:<Protectedroute> <Notifications /> </Protectedroute>},
  { path: 'Postpage/:id', element:<Protectedroute> <Postpage /> </Protectedroute>},
 
])

function App() {

  const queryclient = new QueryClient()
 
  return(
    <> 
     
        <AuthcontextProvider>
          <QueryClientProvider client={queryclient}> 

            <Toaster />
            <RouterProvider router={router} />

          </QueryClientProvider>
        </ AuthcontextProvider>
 </>
  ) 
}

export default App
