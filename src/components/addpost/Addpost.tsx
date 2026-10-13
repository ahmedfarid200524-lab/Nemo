import { useState, useRef, useEffect } from 'react'
import Navbar from '../nav/navbar'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faUserGroup, faTag, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import "./adpost.css"
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';





const AddPost = () => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const [caption, setCaption] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

const actions = [
  { icon: faGlobe, label: 'Public' },
  { icon: faUserGroup, label: 'Add to group' },
  { icon: faTag, label: 'Add tags' },
];

 useEffect(() => {
    if (!file) {
      setPreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  function handleFile(f?: File) {
    if (f && f.type.startsWith('image/')) setFile(f)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0])
  }



 const queryClient = useQueryClient()
const navigate = useNavigate()

function addpost({ body, image }: { body: string; image: File | null }) {
  const formData = new FormData()
  if (body) formData.append('body', body)
  if (image) formData.append('image', image)

  return axios.post('https://route-posts.routemisr.com/posts', formData, {
    headers: {
      Authorization: 'Bearer ' + localStorage.getItem('token'),
    },
  })
}

const { mutate, isPending } = useMutation({
  mutationFn: addpost,
  onSuccess: () => {
    setCaption('')
    setFile(null)
    if (inputRef.current) inputRef.current.value = ''
    queryClient.invalidateQueries({ queryKey: ['posts'] }) // refreshes your feed; use your feed's real query key
    navigate('/Home')
  },
  onError: (e: any) => {
    console.log(e.response?.data?.message || e.message)
  },
})

function handlePost() {
  if (!caption.trim() && !file) return
  mutate({ body: caption, image: file })
}





  return (
    <>
    <div className="min-vh-100 pb-5 bg-black p-4 pt-3 add-postContainer d-flex justify-content-center bg-web">
      <div className='parent'>
      <div className='d-flex flex-row-reverse'>
         <button className='post-btn' onClick={handlePost} disabled={isPending}>
  {isPending ? 'Posting...' : 'Post'}
</button>
      </div>
      
      <div
        className={`drop-post ${dragging ? 'dragging' : ''}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        aria-label="Add image"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        {preview ? (
          <img src={preview} alt="preview" className="drop-preview" />
        ) : (
          <svg viewBox="0 0 24 24" className="plus-icon">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      <div className="drop-comment">
        <textarea
          placeholder="Add a caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={3}
        />
      </div>
      
        
      <div className='post-btns d-flex justify-content-around gap-2 mt-3 flex-column pb-3' >
       {actions.map(({ icon, label }) => (
    <div className='action-btn-add' key={label} role='button' tabIndex={0}>
      <div className='action-btn-icon'>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className='action-label text-secondary'>{label}</div>
      <div className='action-arrow  text-secondary'>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
    </div>
  ))}
        

      </div>

     </div>
    </div>
        <Navbar/>
     </>
  )
}

export default AddPost