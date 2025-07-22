import { useState } from "react";
import Navbar from "../components/Navbar";
import "../style/Setting.css";

function Setting() {
    const [isNavbarActive, setIsNavbarActive] = useState(false); // State untuk status navbar

    // Fungsi untuk menerima status toggle dari Navbar
    const handleToggle = (isActive) => {
        setIsNavbarActive(isActive); // Update state berdasarkan status navbar
    };
      // useEffect(() => {
  //   const logoContainer = document.querySelector(".logo-container");
  //   const logo = document.querySelector(".logo").cloneNode(true);
  //   logoContainer.appendChild(logo);
  // }, []);

    return (
        <>
            <div className={`layout-container ${isNavbarActive ? "navbar-active" : ""}`}>
                <Navbar onToggle={handleToggle} />
                <div className={`dashboard-content ${isNavbarActive ? "shifted" : ""}`}>
                    <h1>Hallo</h1>
                    <p>Ini adalah konten halaman dashboard.Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                        Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                {/* <footer className="setting-footer">
                        <p>© 2024 Asabri Space. All Rights Reserved.</p>
                </footer> */}
                {/* <div className="logo-container">
          <div className="logo">
            <img
              src="https://logos-world.net/wp-content/uploads/2020/09/Microsoft-Logo.png"
              alt="Microsoft"
            />
            <img
              src="https://th.bing.com/th/id/R.11566b13ebe3fe195137ce2bd1804a69?rik=Og%2bcKTbfN4mhBA&riu=http%3a%2f%2flogos-download.com%2fwp-content%2fuploads%2f2016%2f03%2fAirbnb_logo.png&ehk=QhLUqOjF6HxBvuuxjqpvtKEeCf%2bnDOuAUWx8DInRPOo%3d&risl=&pid=ImgRaw&r=0"
              alt="Airbnb"
            />
            <img
              src="https://logos-download.com/wp-content/uploads/2020/06/Gojek_Logo.png"
              alt="gojek"
            />
            <img
              src="https://1.bp.blogspot.com/-M8L5nZiXMpk/X2H14EBayoI/AAAAAAAAAXA/yoo-qlBm224VriUmYfbW0DaJszOs0T8CgCLcBGAsYHQ/s3237/tokped%2Blogo%2B2.png"
              alt="Tokopedia"
            />
            <img
              src="https://www.gsma.com/mobilefordevelopment/wp-content/uploads/2021/07/eFishery.png"
              alt="Efishery"
            />
            <img
              src="https://pngimg.com/uploads/netflix/netflix_PNG10.png"
              alt="Netflix"
            />
            <img
              src="https://logos-download.com/wp-content/uploads/2016/05/Twitch_logo.png"
              alt="twitch"
            />
          </div>
        </div> */}
                </div>
            </div>
        </>
    );
}

export default Setting;
