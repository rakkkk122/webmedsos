import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";
import "../style/Login.css";
import { API_ENDPOINTS } from "../config/api";

function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    confirm_password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://85.209.163.237:5000/api/admin/login", {
    
        email: formData.email,
        password: formData.password,
      });
  
      alert(response.data.message);
  
      // Store data in localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("username", response.data.user.username);
  
      // Give time for data to be saved before redirect
      setTimeout(() => {
        window.location.href = "/";
      }, 300);
    } catch (error) {
      console.error("Login error:", error.response);
      alert(error.response?.data?.message || "Failed to login. Please try again.");
    }
  };
  
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      //const response = await axios.post("http://localhost:5000/api/admin/register",
      const response = await axios.post("http://85.209.163.237:5000/api/admin/register",
         {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password,
      });
      alert(response.data.message);
      setIsSignUp(false); // Return to sign-in page after successful registration
    } catch (error) {
      alert(error.response?.data?.message || "An error occurred during registration.");
    }
  };
  

  return (
    <div className={`container ${isSignUp ? "active" : ""}`} id="container">
      {/* Sign In Form */}
      <div className="form-container sign-in">
        <form onSubmit={handleSignIn}>
          <img
            src={logo}
            alt="Logo"
            style={{ marginLeft: "70px", marginRight: "auto", marginBottom: "20px" }}
          />
          <h1>Sign In</h1>
          <span>Welcome to the Admin Portal.</span>
          <span>Please login with your credentials to access the system</span>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Sign In</button>
          <a href="#">Forget Your Password?</a>
        </form>
      </div>

      {/* Sign Up Form */}
      <div className="form-container sign-up">
        <form onSubmit={handleSignUp}>
          <h1>Create Account</h1>
          <span>Please fill out the form below to create a new admin account.</span>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="confirm_password"
            placeholder="Password Confirmation"
            value={formData.confirm_password}
            onChange={handleInputChange}
            required
          />
          <button type="submit">Sign Up</button>
        </form>
      </div>

      {/* Toggle Panel */}
      <div className="toggle-container">
        <div className="toggle">
          <div className="toggle-panel toggle-left">
            <h1>Welcome Back!</h1>
            <p>Enter your personal details to use this site.</p>
            <button type="button" onClick={() => setIsSignUp(false)}>
              Sign In
            </button>
          </div>
          <div className="toggle-panel toggle-right">
            <h1>Hello, Admin!</h1>
            <p>Register with your personal details to use this site</p>
            <button type="button" onClick={() => setIsSignUp(true)}>
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
