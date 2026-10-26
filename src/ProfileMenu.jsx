import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

function ProfileMenu({ profile, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [profileOpen]);

  function handleLogoutClick() {
    setProfileOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }

  if (!profile) return null;

  const streakDays = Number(localStorage.getItem("codelens-active-days") || 0);
  const avatarLetter = (profile.name?.charAt(0) || "U").toUpperCase();

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-button"
        type="button"
        aria-expanded={profileOpen}
        aria-haspopup="true"
        aria-label="Open user profile menu"
        onClick={() => setProfileOpen((prev) => !prev)}
      >
        <span className="profile-button__avatar" aria-hidden="true">
          {avatarLetter}
        </span>
        <span className="profile-button__name">{profile.name || "User"}</span>
        <span className="profile-button__chevron" style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }}>
          ⌄
        </span>
      </button>

      {profileOpen && (
        <div className="profile-popover" role="menu">
          <strong>{profile.name}</strong>
          <span>{profile.email}</span>

          <div className="profile-streak">
            <span className="profile-streak__icon" aria-hidden="true">✦</span>
            <span>
              <b>{streakDays}</b> day streak
            </span>
          </div>

          <Link
            to="/editor"
            className="profile-popover__link"
            onClick={() => setProfileOpen(false)}
          >
            Open workspace →
          </Link>

          <div className="profile-popover__divider" />

          <button
            type="button"
            className="profile-popover__logout"
            onClick={handleLogoutClick}
          >
            <span aria-hidden="true">🚪</span>
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
