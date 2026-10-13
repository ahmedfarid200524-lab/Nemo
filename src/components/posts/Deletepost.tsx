import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'


const Deletepost = ({id} :{id :string}) => {
  const [showmenu, setshowmenu] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setshowmenu(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])



const querylclient =useQueryClient()

  function deletepst(){
    return axios.delete(`https://route-posts.routemisr.com/posts/${id}` , {
        headers:{
            Authorization: "Bearer "+localStorage.getItem("token")
        }
    })
  }

 const{ isPending ,mutate}= useMutation({
    mutationFn:deletepst,
    onSuccess:(data) =>{
        querylclient.invalidateQueries({
            queryKey:["posts"],
        })
        toast.success("Post deleted")

    },
    onError:(error) =>{
        toast.error("errrorrr")
    }
    
  })








  return (
    <div
      ref={wrapRef}
      className='d-flex justify-content-center align-items-center h-50 position-relative'
    >
      <button
        type='button'
        className='postdel-btn text-secondary fs-1 h-100 d-flex justify-content-center align-items-center'
        onClick={() => setshowmenu(!showmenu)}
        aria-label='Post options'
        aria-expanded={showmenu}
      >
        ...
      </button>

      {showmenu && (
        <div className='glassyy-bg  pst-menu position-absolute text-center'>
          <button className='btn text-white  border-0' >
            edit
          </button>
          <button onClick={mutate} className='btn text-danger  border-0' >
            Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default Deletepost