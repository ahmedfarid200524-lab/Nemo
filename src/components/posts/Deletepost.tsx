import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import toast from 'react-hot-toast'

const API_URL = 'https://route-posts.routemisr.com/posts'

const DeletePost = ({ id }: { id: string }) => {
  const [showMenu, setShowMenu] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const queryClient = useQueryClient()

  // Close the menu when clicking outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  const { mutate: deletePost, isPending } = useMutation({
    mutationFn: () =>
      axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted')
      setShowMenu(false)
    },
    onError: () => {
      toast.error('Failed to delete post')
    },
  })

  return (
    <div
      ref={wrapRef}
      className="d-flex justify-content-center align-items-center h-50 position-relative"
    >
      <button
        type="button"
        className="postdel-btn text-secondary fs-1 h-100 d-flex justify-content-center align-items-center"
        onClick={() => setShowMenu((prev) => !prev)}
        aria-label="Post options"
        aria-expanded={showMenu}
      >
        ...
      </button>

      {showMenu && (
        <div className="glassyy-bg pst-menu position-absolute text-center">
          <button type="button" className="btn text-white border-0">
            Edit
          </button>
          <button
            type="button"
            className="btn text-danger border-0"
            onClick={() => deletePost()}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      )}
    </div>
  )
}

export default DeletePost