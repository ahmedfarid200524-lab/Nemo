import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Deletecomment from "./Deletecomment";
import { jwtDecode } from "jwt-decode";

const Postcomments = ({ id }: { id: string }) => {
  function getallcomments() {
    return axios.get(`https://route-posts.routemisr.com/posts/${id}/comments`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
  }
    const token = localStorage.getItem("token");
    const { user } = token ? jwtDecode<{ user: string }>(token) : { user: "" };

  const { data, isLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: getallcomments,
    enabled: !!id,
  });

  const comments = data?.data?.data?.comments ?? [];

  console.log(comments); // check the real field name of the comment image, then remove this

  if (isLoading) return <p className="text-white-50">Loading comments...</p>;

  return (
    <ul className="comment-list">
      {comments.length === 0 && (
        <li className="comment-item text-white-50">No comments yet</li>
      )}
      {comments.map((c: any) => {
        
        const commentImage = c.image ?? c.photo ?? c.images?.[0];

        return (
          <li className="comment-item d-flex justify-content-between align-items-center" key={c._id ?? c.id ?? c.content}>
            <div className="d-flex align-items-center gap-3"> 
            <img
              src={c.commentCreator?.photo}
              alt=""
              className="comment-avatar"
            />
            <div className="flex-grow-1">
              <div className="comment-meta">
                <strong>@{c.commentCreator?.username}</strong>
              </div>

              {c.content && <div>{c.content}</div>}

              {commentImage && (
                <img
                  src={commentImage}
                  alt="comment"
                  className="comment-image"
                />
              )}
            </div>
            </div>

             {user === c.commentCreator?._id ? (
          <div className="">
           <Deletecomment postId={id} commentId={c._id} />
          </div>
        ) : (
          ""
        )}
      

            
          </li>
        );
      })}
    </ul>
  );
};

export default Postcomments;