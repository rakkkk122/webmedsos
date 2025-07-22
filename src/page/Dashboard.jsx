import { useState, useEffect } from "react";
import axios from "axios"; // Import Axios untuk HTTP request
import Navbar from "../components/Navbar";
import "../style/Dashboard.css";
import logo from "../assets/logo.png";
import bumn from "../assets/BUMN.png";
import { API_ENDPOINTS } from "../config/api";

function Dashboard() {
  const [isNavbarActive, setIsNavbarActive] = useState(false);
  const [username, setUsername] = useState(""); // State untuk nama user
  const [counts, setCounts] = useState({ users: 0, events: 0, news: 0 }); // State untuk menyimpan jumlah data

  const handleToggle = (isActive) => {
    setIsNavbarActive(isActive);
  };

  // Ambil nama user dari localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      alert("Login session expired. Please login again.");
      window.location.href = "/login";
    }
  }, []);

  // Ambil jumlah data dari backend
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.GET_COUNTS);
        console.log("Fetched counts:", response.data); 
        setCounts({
          peserta: response.data.peserta,
          events: response.data.event,
          news: response.data.news,
          post: response.data.post,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
        alert("Failed to fetch data counts.");
      }
    };
  
    fetchCounts();
  }, []);

  return (
    <>
      <div className={`layout-dashboard ${isNavbarActive ? "navbar-active" : ""}`}>
        {/* Navbar dengan nama spesifik untuk dashboard */}
        <div className={`navbar-dashboard ${isNavbarActive ? 'active' : ''}`}>
          <Navbar onToggle={handleToggle} />
        </div>
        <div className={`dashboard-content ${isNavbarActive ? "shifted" : ""}`}>
          <div className="header-wrapper">
            <img src={bumn} alt="BUMN Logo" className="header-logo-left" />
            <h1 className="header-title">Dashboard</h1>
            <img src={logo} alt="Company Logo" className="header-logo-right" />
          </div>
          <br /><br />
          <h1 style={{ color: "#002966", paddingLeft: "20px" }}>
            Hallo Admin, {username}
          </h1>
          <br />
          <p style={{ color: "#0C718F", paddingLeft: "20px" }}>
            Selamat Datang. Kamu telah berhasil login ke dalam sistem Manajemen Asabri Space.
          </p>
          <div className="dashboard-layout">
            {/* Cards Section */}
            <div className="cards-container">
  {[
    { title: "Events", count: counts.events, icon: "📚", change: "positive" },
    { title: "Users", count: counts.peserta, icon: "👥", change: "positive" },
    { title: "News", count: counts.news, icon: "📆", change: "positive" },
    { title: "Post", count: counts.post, icon: "📝", change: "positive" },
  ].map((card, index) => (
    <div key={index} className="card">
      <div className="card-header">
        <span className="card-title">{card.title}</span>
        <span className="card-icon">{card.icon}</span>
      </div>
      <div className="card-body">
        <h2>{card.count}</h2>
        <div className={`card-percentage ${card.change}`}>
          <span className="percentage-value">%*</span> Update
          <span className="percentage-text"> Since last month</span>
        </div>
      </div>
    </div>
  ))}
</div>

            {/* Calendar Section */}
            <div className="calendar-container">
              <h2 className="calendar-title">Admin Space Calendar</h2>
              <iframe
                src="https://calendar.google.com/calendar/embed?src=your-calendar-id"
                className="calendar-frame"
                title="Google Calendar"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
