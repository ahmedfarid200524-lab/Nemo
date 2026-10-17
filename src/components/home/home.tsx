import Navbar from '../nav/navbar'
import Posts from '../posts/Posts'
import Loader from '../loader/loader'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'

const Home = () => {

   const navigate=useNavigate()
function seenotifications(){
  navigate("/Notifications")
}


function getallposts(){
  return axios.get("https://route-posts.routemisr.com/posts" , {
       headers:{
         "Authorization": "Bearer "+localStorage.getItem("token")
       }
})
}

const {data , isLoading } = useQuery({
  queryKey: ["posts"],
    queryFn: getallposts,
})




if(isLoading){
  return <Loader/>
}



return (
    <>
      <div className='bg-black min-vh-100 p-4 p-lg-5 pt-4 bg-web'>
        <div className='top-bar mb-3'>
          <Link to="/Addpost" className='text-decoration-none text-white glass-circle'><i className="fa-solid fa-plus"></i></Link>
          

          <h1 className='text-white script fs-logo text-center m-0'>Nemo</h1>

          <button type="button" className='glass-circle' aria-label="Notifications" onClick={seenotifications}>
            <svg viewBox="0 0 24 24" className='top-icon'>
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.7 21a2 2 0 0 1-3.4 0" />
            </svg>
          </button>
        </div>

  <>
    

    <div className="post-grid mb-5">
     {data?.data.data.posts.map(function(post: any, idx: number){
  return  <Posts key={idx} post={post} ispostdetails={false} />
})}
    </div>
  </>

      </div>
      <Navbar />
    </>
  )
}

export default Home