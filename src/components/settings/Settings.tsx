import { useRef, useState } from "react";
import "./settings.css";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import defaultPhoto from "./../../assets/download.jpg"; 

const Settings = () => {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  // password form fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // current profile (for the picture shown in the circle)
  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: () =>
      axios.get(`https://route-posts.routemisr.com/users/profile-data`, {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }),
  });


  
  const prof = data?.data?.data?.user;

const birthDate = prof?.dateOfBirth
  ? new Date(prof.dateOfBirth).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  : "-";


  // upload the new profile picture
  function uploadprofpic(file: File) {
    const formData = new FormData();
    formData.append("photo", file);

    return axios.put(
      `https://route-posts.routemisr.com/users/upload-photo`,
      formData,
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
  }

  const { mutate, isPending } = useMutation({
    mutationFn: uploadprofpic,
    onSuccess: () => {
      // refresh the profile everywhere (this page, the profile page, etc.)
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile picture updated");
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "Could not upload the photo");
    },
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    mutate(file);
    e.target.value = ""; // lets you pick the same file again later
  }

  // change the password
  function changepassword({
    password,
    newPassword,
  }: {
    password: string;
    newPassword: string;
  }) {
    return axios.patch(
      `https://route-posts.routemisr.com/users/change-password`,
      { password, newPassword },
      {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      }
    );
  }

  const { mutate: mutatePassword, isPending: isChangingPassword } = useMutation({
    mutationFn: changepassword,
    onSuccess: (res) => {
      // the API returns a refreshed token, so keep using that one
      const freshToken = res.data?.data?.token ?? res.data?.token;
      if (freshToken) localStorage.setItem("token", freshToken);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated");
    },
    onError: (e: any) => {
      toast.error(e.response?.data?.message || "Could not update the password");
    },
  });

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password don't match");
      return;
    }

    mutatePassword({ password: currentPassword, newPassword });
  }

  return (
    <div className="bg-web min-vh-100 p-1 p-lg-5 pb-3">
      <div className="ps-5">
        <Link
          to="/profile"
          className="d-inline-block mt-3 mb-3 text-decoration-none text-white"
          aria-label="Back to profile"
        >
          <i className="fa-solid fa-angle-left fs-2"></i>
        </Link>

        <h1 className="text-white">Settings</h1>
        <p className="text-secondary"> mange your account,privacy and prefrences.</p>
      </div>

      <div className="settings-grid p-4 pb-3 ">
        <div className="pro-edit glassyy-bg">
          <div className="setting-title d-flex align-items-center gap-3">
            <div className="setting-icon glassyy-bg ">
              <i className="fa-regular fa-user text-white"></i>
            </div>
            <div>
              <h4 className="text-white mb-0 ">Profile picture</h4>
              <p className="text-secondary mb-0">Change your profile picture</p>
            </div>
          </div>

          <div className="d-flex gap-5 align-items-center">
            <div className="acc-img mt-4 ">
              <div className="overflow-hidden acc-img-cont">
                <img src={prof?.photo || defaultPhoto} alt="Profile" />
              </div>
              <div
                className="glassyy-bg camera-set"
                role="button"
                onClick={() => fileRef.current?.click()}
              >
                <i className="fa-regular fa-camera text-white "></i>
              </div>
            </div>

            <div className="d-flex flex-column gap-3 mt-3">
              {/* hidden file input, opened by the button below */}
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleFile}
                style={{ display: "none" }}
              />

              <button
                type="button"
                className="up-btn glassyy-bg"
                onClick={() => fileRef.current?.click()}
                disabled={isPending}
              >
                <i className="fa-solid fa-arrow-up-from-bracket"></i>
                {isPending ? "Uploading..." : "Upload New photo "}
              </button>
              <button type="button" className="rem-btn glassyy-bg">
                <i className="fa-regular fa-trash-can"></i> Remove photo
              </button>
            </div>
          </div>
        </div>

        <div className="not-edit glassyy-bg">
          <div className="setting-title d-flex align-items-center gap-3">
            <div className="setting-icon glassyy-bg ">
              <i className="fa-regular fa-bell text-white"></i>
            </div>
            <div>
              <h4 className="text-white mb-0 ">Notifications</h4>
              <p className="text-secondary mb-0">Get notified about like,commentandmore.</p>
            </div>
          </div>

          <div className=" mt-5 d-flex gap-5 align-items-center">
            <div className="setting-title d-flex align-items-center gap-3">
              <div className="setting-icon glassyy-bg ">
                <i className="fa-regular fa-bell text-white"></i>
              </div>
              <div>
                <h4 className="text-white mb-0 ">Enable Notifications</h4>
                <p className="text-secondary mb-0">receive updates about your activity</p>
              </div>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                role="switch"
                aria-label="Enable notifications"
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>

        <div className="pass-edit glassyy-bg">
          <div className="setting-title d-flex align-items-center gap-3">
            <div className="setting-icon glassyy-bg ">
              <i className="fa-regular fa-eye-slash text-white"></i>
            </div>
            <div>
              <h4 className="text-white mb-0 ">Change Password</h4>
              <p className="text-secondary mb-0">Keep your account secure.</p>
            </div>
          </div>

          <form className="change-pass-form " onSubmit={handlePasswordSubmit}>
            <div>
              <input
                type="password"
                name="currentPassword"
                placeholder="Current password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="newPassword"
                placeholder="New password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="change-pass-btn"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>

        <div className="acc-edit glassyy-bg">
          <div className="setting-title d-flex align-items-center gap-3">
            <div className="setting-icon glassyy-bg">
              <i className="fa-solid fa-info text-white"></i>
            </div>
            <div>
              <h4 className="text-white mb-0">Account Information</h4>
              <p className="text-secondary mb-0">View your account information.</p>
            </div>
          </div>

          <table className="acc-table">
           <tbody>
  <tr>
    <th scope="row">
      <i className="fa-regular fa-user"></i>
      <span>Full name</span>
    </th>
    <td>{prof?.name ?? "-"}</td>
  </tr>
  <tr>
    <th scope="row">
      <i className="fa-solid fa-at"></i>
      <span>Username</span>
    </th>
    <td>@{prof?.username ?? "-"}</td>
  </tr>
  <tr>
    <th scope="row">
      <i className="fa-regular fa-envelope"></i>
      <span>Email address</span>
    </th>
    <td>{prof?.email ?? "-"}</td>
  </tr>
  <tr>
    <th scope="row">
      <i className="fa-regular fa-calendar"></i>
      <span>Date of birth</span>
    </th>
    <td>{birthDate}</td>
  </tr>
</tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;