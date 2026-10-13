import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'

const Deletecomment = ({ postId, commentId }: { postId: string; commentId: string }) => {
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

  const queryClient = useQueryClient()

  function deletecom() {
    return axios.delete(
      `https://route-posts.routemisr.com/posts/${postId}/comments/${commentId}`,
      {
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('token'),
        },
      }
    )
  }

  const { mutate, isPending } = useMutation({
    mutationFn: deletecom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] }) // refresh the list
      queryClient.invalidateQueries({ queryKey: ['details', postId] })   // refresh the comments count
      queryClient.invalidateQueries({ queryKey: ['posts'] })             // refresh the feed
      setshowmenu(false)
      toast.success('comment deleted')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'error')
    },
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
        aria-label='Comment options'
        aria-expanded={showmenu}
      >
        ...
      </button>

      {showmenu && (
        <div className='glassyy-bg com-menu position-absolute text-center z-3'>
          <button
            type='button'
            onClick={() => mutate()}
            disabled={isPending}
            className='btn text-danger border-0'
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

export default Deletecomment