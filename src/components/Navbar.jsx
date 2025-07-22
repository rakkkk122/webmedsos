import { useState } from "react";
import "../components/Navbar.css";
import home from "../assets/ic_round-home.svg";
import faBook from "../assets/fa_book.svg";
import news from "../assets/news-svgrepo-com.svg";
import chat from "../assets/chat-round-dots-svgrepo-com.svg";
import logout from "../assets/majesticons_logout.svg";
import post from "../assets/post.png";
import stats from "../assets/stats.png";
import history from "../assets/history.png";
import bm from "../assets/bm.png";
// import setting from "../assets/uiw_setting.svg";
import menu from "../assets/pepicons-pop_menu.svg";
// import user from "../assets/user-svgrepo-com.svg";

function Navbar({ onToggle }) {
  const [isActive, setIsActive] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleMenu = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle(newState);
  };

  const handleMouseOver = (index) => {
    setHoveredItem(index);
  };

  const handleLogout = () => {
    // Hapus data dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("username");

    // Arahkan ke halaman login
    window.location.href = "/login";
  };

  return (
    <>
      <div className="navbar-container">
        <div className={`navbar-navigation ${isActive ? "active" : ""}`}>
          <ul>
            <li>
              <a href="#">
                <span
                  className="navbar-title"
                  style={{
                    fontWeight: "bold",
                    fontSize: "25px",
                    marginLeft: "50px",
                  }}
                >
                  Asabri Space
                </span>
              </a>
            </li>
            {[
              { icon: home, title: "Dashboard", path: "/" },
              { icon: faBook, title: "Event", path: "/event" },
              { icon: news, title: "News", path: "/news" },
              { icon: chat, title: "Chat", path: "/chat" },
              { icon: post, title: "Post", path: "/post" },
              { icon: stats, title: "Statistik", path: "/statistik" },
              { icon: history, title: "Histori", path: "/histori" },
              { icon: bm, title: "BM", path: "/bm" },
              // { icon: user, title: "Users", path: "/user" },
              { icon: logout, title: "Log out", path: "#", action: () => setShowLogoutModal(true) },
            ].map((item, index) => (
              <li
                key={index}
                className={hoveredItem === index ? "navbar-hovered" : ""}
                onMouseOver={() => handleMouseOver(index)}
              >
                <a
                  href={item.path}
                  onClick={item.action ? (e) => {
                    e.preventDefault();
                    item.action();
                  } : null}
                >
                  <span className="navbar-icon">
                    <img src={item.icon} alt={`${item.title.toLowerCase()}_icon`} />
                  </span>
                  <span className="navbar-title">{item.title}</span>
                </a>
              </li>
            ))}

            <li className="navbar-settings">
              <a href="/settings">
                {/* <span className="navbar-icon">
                  <img src={setting} alt="setting_icon" />
                </span>
                <span className="navbar-title">Settings</span> */}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={`navbar-main ${isActive ? "active" : ""}`}>
        <div className="navbar-topbar">
          <div className="navbar-toggle" onClick={toggleMenu}>
            <img src={menu} alt="menu_icon" />
          </div>
        </div>
      </div>

      {/* Modal untuk Logout */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Keluar Akun?</h2>
            <p>Apakah kamu yakin ingin keluar?</p>
            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowLogoutModal(false)}>Batal</button>
              <button className="modal-confirm" onClick={handleLogout}>Keluar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
