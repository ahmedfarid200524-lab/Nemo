import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../Profile/profile.css";
import Loader from "./../loader/loader"; // change the path if your loader lives elsewhere
import avatarFallback from "./../../assets/av-man.png";

const Userprofile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // null = no click yet, so the button follows what the server says
  const [followOverride, setFollowOverride] = useState<boolean | null>(null);

  // id of the logged-in user, read from the token (safe when there is no token)
  const token = localStorage.getItem("token");
  const { user } = token ? jwtDecode<{ user: string }>(token) : { user: "" };

  const headers = {
    Authorization: "Bearer " + localStorage.getItem("token"),
  };

  // this user's account
  const { data, isLoading } = useQuery({
    queryKey: ["user-profile", id],
    queryFn: () =>
      axios.get(`https://route-posts.routemisr.com/users/${id}/profile`, {
        headers,
      }),
    enabled: !!id,
  });

  console.log(data?.data); // check the real shape here

  const prof = data?.data?.data?.user;

  // this user's posts
  const { data: postsData } = useQuery({
    queryKey: ["user-posts", id],
    queryFn: () =>
      axios.get(`https://route-posts.routemisr.com/users/${id}/posts`, {
        headers,
      }),
    enabled: !!id,
  });

  // follow / unfollow (the same PUT request toggles it)
  function togglefollow() {
    return axios.put(
      `https://route-posts.routemisr.com/users/${id}/follow`,
      {},
      { headers }
    );
  }

  const { mutate: mutateFollow, isPending: isFollowingPending } = useMutation({
    mutationFn: togglefollow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", id] }); // refreshes their followers count
      queryClient.invalidateQueries({ queryKey: ["profile"] }); // refreshes your own following count
    },
    onError: (e: any) => {
      setFollowOverride(null); // put the button back to what the server says
      console.log(e.response?.data?.message || e.message);
    },
  });

  // do you already follow this user? (read from the profile data)
  const serverFollowing: boolean | undefined =
    prof?.isFollowing ??
    (Array.isArray(prof?.followers)
      ? prof.followers.some((f: any) => (f?._id ?? f) === user)
      : undefined);
  const following = followOverride ?? serverFollowing ?? false;

  function handleFollow() {
    setFollowOverride(!following); // instant button change
    mutateFollow();
  }

  // all hooks are above these early returns
  if (isLoading) return <Loader />;
  if (!prof) return null;

  const avatar = prof.photo || avatarFallback;
  const bg = prof.photo || avatarFallback; // profile picture as the background
  const posts: any[] = postsData?.data?.data?.posts ?? [];
  const followingCount = prof.followingCount ?? prof.following?.length ?? 0;
  const followersCount = prof.followersCount ?? prof.followers?.length ?? 0;
  const postsCount = posts.length || prof.postsCount || 0;

  // following / followers / posts, used by both layouts
  const counters = (
    <>
      <li>
        <div>
          <h2 className="text-white mb-0 fw-bold">{followingCount}</h2>
          <p className="text-white mb-0">Following</p>
        </div>
      </li>
      <li>
        <div>
          <h2 className="text-white mb-0 fw-bold">{followersCount}</h2>
          <p className="text-white mb-0">Followers</p>
        </div>
      </li>
      <li>
        <div>
          <h2 className="text-white mb-0 fw-bold">{postsCount}</h2>
          <p className="text-white mb-0">Post</p>
        </div>
      </li>
    </>
  );

  // follow button + chat button, used by both layouts
  const actions = (
    <>
      <div>
        <button
          className="profile-follow-btn"
          onClick={handleFollow}
          disabled={isFollowingPending}
        >
          {following ? "Unfollow" : "Follow"}
        </button>
      </div>
      <div className="glass-circle">
        <i className="fa-solid fa-comments text-white fs-5"></i>
      </div>
    </>
  );

  // one grid item, used by both layouts (text posts get the glass tile)
  const postItem = (p: any) => (
    <div
      className={`user-profile-post ${p.image ? "" : "glassyy-bg text-tile"}`}
      key={p._id ?? p.id}
      role="button"
      onClick={() => navigate(`/Postpage/${p._id ?? p.id}`)}
    >
      {p.image ? (
        <img src={p.image} alt="" />
      ) : (
        <>
          <i className="fa-solid fa-quote-left text-tile-icon"></i>
          <p className="text-tile-body">{p.body}</p>
        </>
      )}
    </div>
  );

  return (
    <>
      {/* ================= Desktop ================= */}
      <div
        className="vh-100 d-none d-lg-block bg-web"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="p-3 pointer-event">
          <p
            role="button"
            onClick={() => navigate(-1)}
            className="text-decoration-none text-white"
          >
            <i className="fa-solid fa-angle-left fs-1"></i>
          </p>
        </div>

        <div className="user-area">
          <div className="d-flex gap-3 align-items-center">
            <div className="profile-user-img">
              <img src={avatar} alt={prof.name} />
            </div>
            <div>
              <h2 className="text-white mb-0 fw-bold fs-1">{prof.name}</h2>
              <p className="text-white mb-0 fs-5">@{prof.username}</p>
            </div>
          </div>

          <div className="profile-follow d-flex align-items-center gap-4 mt-3">
            {actions}
          </div>

          <div className="followers-area p-4">
            <ul className="list-unstyled d-flex gap-5">{counters}</ul>
          </div>
        </div>

        <div className="user-posts-area">
  <div className="posts-scroll h-100">
    {posts.length === 0 && (
      <p className="text-white-50 align-self-center">No posts yet</p>
    )}
    {posts.map(postItem)}
  </div>
</div>
      </div>

      {/* ================= Mobile ================= */}
      <div
        className="profile-wrap bg-web d-block d-lg-none"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="p-3">
          <p
            role="button"
            onClick={() => navigate(-1)}
            className="text-decoration-none text-white mb-0"
          >
            <i className="fa-solid fa-angle-left fs-1"></i>
          </p>
        </div>

        <div className="profile-mob position-relative">
          <div className="mob-username">
            <div className="d-flex justify-content-center flex-column align-items-center">
              <div className="mob-userimage">
                <img src={avatar} alt={prof.name} />
              </div>
              <h2 className="text-white mb-0 fw-bold fs-1">{prof.name}</h2>
              <p className="text-white mb-0">@{prof.username}</p>
            </div>
          </div>
        </div>

        <div className="mob-lower">
          <div className="mob-follow">
            <div className="d-flex align-items-center justify-content-center gap-3">
              {actions}
            </div>
          </div>

          <div className="d-flex justify-content-center">
            <div className="followers-area p-4">
              <ul className="list-unstyled d-flex gap-5 text-center mt-3">
                {counters}
              </ul>
            </div>
          </div>

          <div className="user-post-grid mb-5 d-flex justify-content-center">
            <div className="d-flex flex-wrap gap-3 justify-content-between w-100">
              {posts.length === 0 && (
                <p className="text-white-50 w-100 text-center">No posts yet</p>
              )}
              {posts.map(postItem)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Userprofile;