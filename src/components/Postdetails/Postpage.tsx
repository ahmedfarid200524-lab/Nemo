import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import Loader from "../loader/loader";
import Postcomments from "./Postcomments";
import Deletepost from "../posts/Deletepost";
import "./postdetails.css";

const API_URL = "https://route-posts.routemisr.com";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getErrorMessage = (e: unknown) =>
  axios.isAxiosError(e) ? e.response?.data?.message ?? e.message : "Something went wrong";

const timeAgo = (date?: string) => {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (isNaN(seconds)) return "";
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// ---- API calls ----
const fetchPost = (id?: string) =>
  axios.get(`${API_URL}/posts/${id}`, { headers: authHeaders() });

const fetchMyProfile = () =>
  axios.get(`${API_URL}/users/profile-data`, { headers: authHeaders() });

const toggleLike = (id?: string) =>
  axios.put(`${API_URL}/posts/${id}/like`, {}, { headers: authHeaders() });

const createComment = (
  id: string | undefined,
  { content, image }: { content: string; image: File | null }
) => {
  const formData = new FormData();
  if (content) formData.append("content", content);
  // If the image never shows, check this field name in the Network tab
  if (image) formData.append("image", image);
  return axios.post(`${API_URL}/posts/${id}/comments`, formData, {
    headers: authHeaders(),
  });
};

const PostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [text, setText] = useState("");

  // Image upload for comments
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  // Current user id from token
  const token = localStorage.getItem("token");
  const userId = token ? jwtDecode<{ user: string }>(token).user : "";

  // ---- Queries ----
  const { data, isLoading } = useQuery({
    queryKey: ["details", id],
    queryFn: () => fetchPost(id),
  });

  const { data: profileData } = useQuery({
    queryKey: ["profileimg"],
    queryFn: fetchMyProfile,
  });

  const post = data?.data?.data?.post;
  const myPhoto = profileData?.data.data.user.photo;

  const serverLiked: boolean | undefined =
    post?.isLiked ??
    (Array.isArray(post?.likes) ? post.likes.includes(userId) : undefined);
  const liked = likedOverride ?? serverLiked ?? false;

  // ---- Mutations ----
  const { mutate: like, isPending: isLiking } = useMutation({
    mutationFn: () => toggleLike(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["details", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e) => {
      setLikedOverride(null);
      toast.error(getErrorMessage(e));
    },
  });

  const { mutate: sendComment, isPending: isSending } = useMutation({
    mutationFn: (comment: { content: string; image: File | null }) =>
      createComment(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["details", id] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  // ---- Handlers ----
  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const goBack = () => {
    if (window.history.state?.idx > 0) navigate(-1);
    else navigate("/Home");
  };

  const goToAuthorProfile = () => {
    if (userId === post.user._id) navigate("/profile");
    else navigate(`/Userprofile/${post.user._id}`);
  };

  const handleLike = () => {
    setLikedOverride(!liked); // update the heart immediately
    like();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !image) return;
    sendComment({ content: text, image });
    setText("");
    removeImage();
  };

  if (isLoading) return <Loader />;
  if (!post) return null;

  const isOwner = userId === post.user._id;
  const posted = timeAgo(post.createdAt);

  const stats = [
    { icon: "fa-regular fa-heart", value: post.likesCount, label: "Likes" },
    { icon: "fa-regular fa-comment", value: post.commentsCount, label: "Comments" },
    { icon: "fa-solid fa-share", value: post.sharesCount, label: "Shares" },
  ].filter((s) => s.value != null);

  return (
    <div className="post-page bg-web">
      <header className="post-topbar">
        <div className="d-flex align-items-center justify-content-between w-50">
          <button className="backbtn" onClick={goBack} aria-label="Back">
            <i className="fa-solid fa-angle-left text-white"></i>
          </button>
          <p className="text-white mb-0 fs-5">Post</p>
        </div>
      </header>

      <div className="container-xl post-layout">
        <div className="row g-3 g-lg-4">
          {/* ===== Main post ===== */}
          <div className="col-12 col-lg-7">
            <article className="glass-card post-card">
              {/* Author */}
              <div
                className="d-flex align-items-center gap-3 mb-3"
                role="button"
                onClick={goToAuthorProfile}
              >
                <img src={post.user.photo} alt="" className="post-avatar" />
                <div className="flex-grow-1">
                  <div className="fw-semibold">@{post.user.username}</div>
                  {posted && <small className="text-white-50">{posted}</small>}
                </div>
                {isOwner && (
                  <div className="no-nav" onClick={(e) => e.stopPropagation()}>
                    <Deletepost id={post._id} />
                  </div>
                )}
              </div>

              {/* Image post or text post */}
              {post.image ? (
                <>
                  <img src={post.image} alt="post" className="post-image" />
                  {post.body && <p className="post-caption">{post.body}</p>}
                </>
              ) : (
                <div className="post-body-text">{post.body}</div>
              )}

              {/* Compact counters row */}
              <div className="d-flex align-items-center gap-3 mt-3">
                <button
                  className={`like-pill ${liked ? "active" : ""}`}
                  onClick={handleLike}
                  disabled={isLiking}
                  aria-label={liked ? "Unlike" : "Like"}
                >
                  <i className="fa-solid fa-heart"></i>
                  {post.likesCount !== undefined && <span>{post.likesCount}</span>}
                </button>
                <span className="counter">
                  <i className="fa-regular fa-comment"></i> {post.commentsCount}
                </span>
                <span className="counter">
                  <i className="fa-solid fa-share"></i>
                  {post.sharesCount !== undefined && ` ${post.sharesCount}`}
                </span>
              </div>

              {/* Big action bar: desktop only */}
              <div className="action-bar d-none d-lg-flex justify-content-center align-items-center">
                <button
                  className={`action-btn mb-0 ${liked ? "active" : ""}`}
                  onClick={handleLike}
                  disabled={isLiking}
                >
                  <i className="fa-solid fa-heart"></i> {liked ? "Unlike" : "Like"}
                </button>
                <button className="action-btn mb-0">
                  <i className="fa-regular fa-comment"></i> Comment
                </button>
                <button className="action-btn mb-0">
                  <i className="fa-solid fa-share"></i> Share
                </button>
                <button className="action-btn mb-0" onClick={() => setSaved((prev) => !prev)}>
                  <i className={`${saved ? "fa-solid" : "fa-regular"} fa-bookmark`}></i> Save
                </button>
              </div>
            </article>
          </div>

          {/* ===== Side column: stats + comments ===== */}
          <div className="col-12 col-lg-5 d-flex flex-column gap-3 gap-lg-4">
            {/* Stats: desktop only */}
            {stats.length > 0 && (
              <section className="glass-card stats-card d-none d-lg-block">
                <h2 className="section-title">Post Stats</h2>
                <div className="row text-center g-0">
                  {stats.map((s) => (
                    <div className="col stat-item" key={s.label}>
                      <i className={`${s.icon} mb-1`}></i>
                      <div className="fw-bold">{s.value}</div>
                      <small className="text-white-50">{s.label}</small>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <section className="comments-card">
              <h2 className="section-title">Comments ({post.commentsCount})</h2>

              <Postcomments id={id ?? ""} />

              {preview && (
                <div className="comment-preview">
                  <img src={preview} alt="preview" />
                  <button type="button" onClick={removeImage} aria-label="Remove image">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              )}

              <form className="comment-box" onSubmit={handleSend}>
                <img src={myPhoto} alt="" className="comment-avatar" />

                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleImage}
                  hidden
                />

                <div className="comment-input-wrap">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Write a comment..."
                  />
                  <button
                    type="button"
                    className="icon-btn-img"
                    aria-label="Add image"
                    onClick={() => fileRef.current?.click()}
                  >
                    <i className="fa-regular fa-image"></i>
                  </button>
                </div>

                <button
                  className="send-btn"
                  type="submit"
                  aria-label="Send"
                  disabled={isSending}
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;