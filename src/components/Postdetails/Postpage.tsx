import { useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Loader from "../loader/loader";
import "./postdetails.css"; 
import Postcomments from "./Postcomments";
import { jwtDecode } from "jwt-decode";
import Deletepost from "../posts/Deletepost";

//time
const timeAgo = (date?: string) => {
  if (!date) return "";
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (isNaN(s)) return "";
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const Postpage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);
  const [saved, setSaved] = useState(false);
  const [text, setText] = useState("");

 
  const token = localStorage.getItem("token");
  const { user } = token ? jwtDecode<{ user: string }>(token) : { user: "" };

  //img upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }



  function removeImage() {
    if (preview) URL.revokeObjectURL(preview);
    setImage(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  }

  //nav back
  const goBack = () => {
    if (window.history.state && window.history.state.idx > 0) navigate(-1);
    else navigate("/Home");
  };

  //navigate to profile 
  const handleClick = () => {
    if (user === postdet.user._id) navigate("/profile");
    else navigate(`/Userprofile/${postdet.user._id}`);
  };

  function getdetails() {
    return axios.get(`https://route-posts.routemisr.com/posts/${id}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
  }

  function getmyprofile() {
    return axios.get(`https://route-posts.routemisr.com/users/profile-data`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
  }

 const{ data : profdata }= useQuery({
    queryKey:["profileimg"],
    queryFn:getmyprofile
  })
 const myimg=profdata?.data.data.user.photo

  

  //like / unlike 
  function togglelike() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${id}/like`,
      {},
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
  }

  const { mutate: mutateLike, isPending: isLiking } = useMutation({
    mutationFn: togglelike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["details", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (e: any) => {
      setLikedOverride(null); 
      console.log(e.response?.data?.message || e.message);
    },
  });

  function handleLike() {
    setLikedOverride(!liked); //  heart change
    mutateLike();
  }

  //send comment
  function addcomment({ content, image }: { content: string; image: File | null }) {
    const formData = new FormData();
    if (content) formData.append("content", content);
    if (image) formData.append("image", image); // if the image never shows, check this field name in the Network tab

    return axios.post(
      `https://route-posts.routemisr.com/posts/${id}/comments`,
      formData,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
  }

  const { mutate, isPending } = useMutation({
    mutationFn: addcomment,
    onSuccess: (res) => {
      console.log(res.data); // check whether the new comment comes back with an image url
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      queryClient.invalidateQueries({ queryKey: ["details", id] });
    },
    onError: (e: any) => {
      console.log(e.response?.data?.message || e.message);
    },
  });

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() && !image) return;

    mutate({ content: text, image });

    setText("");
    removeImage();
  }

  //post data
  const { data, isLoading } = useQuery({
    queryKey: ["details", id],
    queryFn: getdetails,
  });

  const postdet = data?.data?.data?.post;

  
  const serverLiked: boolean | undefined =
    postdet?.isLiked ??
    (Array.isArray(postdet?.likes) ? postdet.likes.includes(user) : undefined);
  const liked = likedOverride ?? serverLiked ?? false;

  
  if (isLoading) return <Loader />;
  if (!postdet) return null;

  //stats icons
  const stats = [
    { icon: "fa-heart", value: postdet.likesCount, label: "Likes" },
    { icon: "fa-comment", value: postdet.commentsCount, label: "Comments" },
    { icon: "fa-solid fa-share", value: postdet.sharesCount, label: "Shares" },
  ].filter((s) => s.value !== undefined && s.value !== null);

  //time
  const posted = timeAgo(postdet.createdAt);

  return (
    <div className="post-page bg-web">
      <header className="post-topbar ">
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
                onClick={handleClick}
              >
                <img src={postdet.user.photo} alt="" className="post-avatar" />
                <div className="flex-grow-1">
                  <div className="fw-semibold">@{postdet.user.username}</div>
                  {posted && <small className="text-white-50">{posted}</small>}
                </div>
                {user === postdet.user._id && (
  <div className="no-nav" onClick={(e) => e.stopPropagation()}>
    <Deletepost id={postdet._id}  onDeleted={() => navigate(-1)} />
  </div>
)}
              </div>

              {/* Image post or text post */}
              {postdet.image ? (
                <>
                  <img src={postdet.image} alt="post" className="post-image" />
                  {postdet.body && <p className="post-caption">{postdet.body}</p>}
                </>
              ) : (
                <div className="post-body-text">{postdet.body}</div>
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
                  {postdet.likesCount !== undefined && (
                    <span>{postdet.likesCount}</span>
                  )}
                </button>
                <span className="counter">
                  <i className="fa-regular fa-comment"></i> {postdet.commentsCount}
                </span>
                <span className="counter">
                  <i className="fa-solid fa-share"></i>
                  {postdet.sharesCount !== undefined && ` ${postdet.sharesCount}`}
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
                <button className="action-btn mb-0" onClick={() => setSaved(!saved)}>
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
                      <i className={`fa-regular ${s.icon} mb-1`}></i>
                      <div className="fw-bold">{s.value}</div>
                      <small className="text-white-50">{s.label}</small>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <section className="comments-card">
              <h2 className="section-title">Comments ({postdet.commentsCount})</h2>

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
                <img src={myimg} alt="" className="comment-avatar" />

                <input
                  type="file"
                  accept="image/*"
                  ref={fileRef}
                  onChange={handleImage}
                  style={{ display: "none" }}
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
                  disabled={isPending}
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

export default Postpage;