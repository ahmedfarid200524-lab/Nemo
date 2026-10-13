import { useNavigate } from "react-router-dom";
import Navbar from "./../nav/navbar";
import "./profile.css";
import { useState } from "react";
import test from "./../../assets/av-man.png";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import Loader from "./../loader/loader"; // change the path if your loader lives elsewhere

const Profile = () => {
  const [showSettings, setShowSettings] = useState(false);
  const navigate = useNavigate();

  function settings() {
    setShowSettings(false);
    navigate("/Settings");
  }

  function logout() {
    localStorage.removeItem("token");
    navigate("/Login", { replace: true });
  }

  function getprofile() {
    return axios.get(`https://route-posts.routemisr.com/users/profile-data`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
    });
  }

  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: getprofile,
  });

  const prof = data?.data?.data?.user;

  
  const { data: postsData } = useQuery({
    queryKey: ["user-posts", prof?._id],
    queryFn: () =>
      axios.get(`https://route-posts.routemisr.com/users/${prof._id}/posts`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
    enabled: !!prof?._id,
  });

  console.log(postsData?.data); // check the real shape here

  
  if (isLoading) return <Loader />;
  if (!prof) return null;

  const avatar = prof.photo || test;
  const bg = prof.photo || test; // profile picture as the background
  const posts: any[] = postsData?.data?.data?.posts ?? [];
  const followingCount = prof.followingCount ?? prof.following?.length ?? 0;
  const followersCount = prof.followersCount ?? prof.followers?.length ?? 0;
  const postsCount = posts.length || prof.postsCount || 0;

  // settings button + menu, used by both layouts
  const settingsMenu = (
    <div className="position-relative d-flex flex-row-reverse p-4">
      <button
        className="settings-btn"
        onClick={() => setShowSettings(!showSettings)}
        aria-label="Settings"
      >
        <i className="fa-solid fa-gear text-white"></i>
      </button>

      <div
        className={`settings-menu glassyy-bg ${showSettings ? "" : "d-none"}`}
        id="settings"
      >
        <div className="p-4 d-flex flex-column gap-2 align-items-center">
          <div>
            <button className="btn text-white" onClick={settings}>
              Edit profile
            </button>
          </div>
          <div className="border-top">
            <button className="btn text-danger" onClick={logout}>
              Log-out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

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

  // one grid item, used by both layouts
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
        {settingsMenu}

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
            <div>
              <button className="profile-follow-btn" onClick={settings}>
                Edit profile
              </button>
            </div>
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
        {settingsMenu}

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
              <div>
                <button className="profile-follow-btn" onClick={settings}>
                  Edit profile
                </button>
              </div>
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

      <Navbar />
    </>
  );
};

export default Profile;