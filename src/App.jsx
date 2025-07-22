import { Routes, Route } from "react-router-dom";
import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import News from "./page/News";
import Event from "./page/Event";
import Setting from "./page/Setting";
import Chat from "./page/Chat";
import Post from "./page/Post";
import Histori from "./page/histori";
import Statistik from "./page/statistik";
import BM from "./page/bm";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/news"
        element={
          <ProtectedRoute>
            <News />
          </ProtectedRoute>
        }
      />
      <Route
        path="/event"
        element={
          <ProtectedRoute>
            <Event />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Setting />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post"
        element={
          <ProtectedRoute>
            <Post />
          </ProtectedRoute>
        }
      />
      <Route
        path="/statistik"
        element={
          <ProtectedRoute>
            <Statistik />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bm"
        element={
          <ProtectedRoute>
            <BM />
          </ProtectedRoute>
        }
      />
      <Route
        path="/histori"
        element={
          <ProtectedRoute>
            <Histori />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
