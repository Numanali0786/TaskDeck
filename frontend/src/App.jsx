import { Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Contacts from "./pages/Contacts";
import Pipeline from "./pages/Pipeline";
import Notes from "./pages/Notes";
import Tasks from "./pages/Tasks";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Routes>
      {}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
