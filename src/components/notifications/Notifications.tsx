
import axios from 'axios'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Navbar from '../nav/navbar'
import Loader from '../loader/loader'

type Notification = {
  _id: string
  actor?: {
    name?: string
    photo?: string
  }
  content?: string
  message?: string
  type?: string
  createdAt: string
}

function getnotifications() {
  return axios.get(
    'https://route-posts.routemisr.com/notifications?unread=false&page=1&limit=10',
    {
      headers: {
        Authorization: 'Bearer ' + localStorage.getItem('token'),
      },
    }
  )
}





const Notifications = () => {


const queryClient = useQueryClient()

const { mutate: markAsRead } = useMutation({
  mutationFn: (id: string) =>
    axios.patch(
      `https://route-posts.routemisr.com/notifications/${id}/read`,
      {},
      { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
    ),
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
})




  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications'],
    queryFn: getnotifications,
  })

  if (isLoading) return <Loader />

  const notifications: Notification[] = data?.data.data.notifications ?? []

  const messages: Record<string, string> = {
  comment_post: 'commented on your post',
  like_post: 'liked your post',
}

function getMessage(n: Notification) {
  return (n.type && messages[n.type]) ?? n.content ?? n.message ?? n.type
}





  return (
    <>
      <div className="bg-web min-vh-100 p-4 p-lg-5 ">
        <div className="mx-auto mb-5" style={{ maxWidth: 672 }}>
          {/* Header with count */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h1 className="h3 fw-semibold text-white m-0">Notifications</h1>
            <span className="badge rounded-pill bg-light bg-opacity-25 text-white fs-6">
              {notifications.length}
            </span>
          </div>

          {/* Notifications list */}
          <div className="d-flex flex-column gap-3">
            {isError ? (
              <p className="text-center text-white-50">
                Couldn't load notifications.
              </p>
            ) : notifications.length === 0 ? (
              <p className="text-center text-white-50">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className="glassyy-bg d-flex align-items-start gap-3 p-3 rounded-4"
                >
                  <img
                    src={n.actor?.photo}
                    alt={n.actor?.name}
                    className="rounded-circle flex-shrink-0"
                    style={{ width: 48, height: 48, objectFit: 'cover' }}
                  />

                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="d-flex align-items-center justify-content-between gap-2">
                      <span className="fw-semibold text-white text-truncate">
                        {n.actor?.name}
                      </span>
                      <span className="small text-white-50 flex-shrink-0">
                        {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-1 mb-0 small text-white-50">
  {getMessage(n)}
</p>
                  </div>
                  <button
  type="button"
  aria-label="Mark as read"
  title="Mark as read"
  onClick={() => markAsRead(n._id)}
  className="flex-shrink-0 align-self-center d-flex align-items-center justify-content-center rounded-circle border-0 p-0"
  style={{
    width: 32,
    height: 32,
    background: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
  }}
>
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
</button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Navbar />
    </>
  )
}

export default Notifications