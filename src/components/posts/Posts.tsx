import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import Deletepost from "./Deletepost";
import { jwtDecode } from "jwt-decode";

const Posts = ({ post, ispostdetails }: { post: post; ispostdetails: boolean }) => {
  const truncateWords = (text: string, limit = 3) => {
    const words = text.trim().split(/\s+/);
    return words.length > limit ? words.slice(0, limit).join(" ") + "..." : text;
  };

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const token = localStorage.getItem("token");
  const { user } = token ? jwtDecode<{ user: string }>(token) : { user: "" };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, input, textarea, a, .no-nav")) return;
    navigate(`/Postpage/${post._id}`);
  };

  // ===== like / unlike (same as Postpage) =====
  const [likedOverride, setLikedOverride] = useState<boolean | null>(null);

  const serverLiked: boolean | undefined =
    (post as any)?.isLiked ??
    (Array.isArray((post as any)?.likes)
      ? (post as any).likes.includes(user)
      : undefined);
  const liked = likedOverride ?? serverLiked ?? false;

  function togglelike() {
    return axios.put(
      `https://route-posts.routemisr.com/posts/${post._id}/like`,
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
      queryClient.invalidateQueries({ queryKey: ["posts"] }); // refresh the feed
      queryClient.invalidateQueries({ queryKey: ["details", post._id] }); // refresh the post page
    },
    onError: (e: any) => {
      setLikedOverride(null); // revert the heart to what the server says
      console.log(e.response?.data?.message || e.message);
    },
  });

  function handleLike() {
    setLikedOverride(!liked); // instant heart change
    mutateLike();
  }

  return (
    <div className={`post ${post?.image ? "" : "text-only"}`} onClick={handleClick}>
      {post?.image ? <img src={post.image} alt="" className="post-img" /> : ""}

      <div className="post-author ps-3 justify-content-between">
        <div className="d-flex gap-2 align-items-center">
          <div className="author-img">
            <img src={post.user.photo} alt="" className="post-img" />
          </div>
          <div className="d-flex align-items-center">
            <p className="text-white username mb-0 mt-lg-2">@{post.user.name}</p>
          </div>
        </div>

        {user === post.user._id ? (
          <div className="no-nav">
            <Deletepost id={post._id} />
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="comment ps-3">
        {post?.body ? <p className="fw-bold text-white"> {truncateWords(post.body)} </p> : ""}
      </div>

      <div className="post-actions">
        <div className="comment-bar">
          <svg viewBox="0 0 24 24" className="action-icon">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
          </svg>
          <input type="text" placeholder="Comment..." />
        </div>

        <button
          type="button"
          className={`heart-btn d-none d-lg-block ${liked ? "active" : ""}`}
          aria-label={liked ? "Unlike" : "Like"}
          onClick={handleLike}
          disabled={isLiking}
        >
          <svg
            viewBox="0 0 24 24"
            className="action-icon"
            style={{
              fill: liked ? "#ff3b5c" : "none",
              stroke: liked ? "#ff3b5c" : "currentColor",
            }}
          >
            <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Posts;