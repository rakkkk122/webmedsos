import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Ambil token dari localStorage
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
