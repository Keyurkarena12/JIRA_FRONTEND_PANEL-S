import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import ProtectedRoute from './components/ProtectRouter';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import AuthSuccess from './pages/AuthSuccess';
import CreateWorkspace from './pages/CreateWorkspace';
import Workspaces from './pages/Workspaces';
import Members from './pages/Members';
import Projects from './pages/Project';
import Boards from './pages/Boards';
import WorkspaceDetail from './pages/WorkspaceDetail';
import AddMembers from './pages/AddMembers';
import AcceptInvite from './pages/AcceptInvite';
import Pricing from './pages/Pricing';
import BillingSuccess from './pages/BillingSuccess';
import CreateProject from './pages/CreateProject';
import CreateTask from './pages/CreateTask';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/success-login" element={<AuthSuccess />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/billing/success" element={<BillingSuccess />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />

          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/workspaces" element={<ProtectedRoute><Workspaces /></ProtectedRoute>} />
          <Route path="/members" element={<ProtectedRoute><Members /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/boards" element={<ProtectedRoute><Boards /></ProtectedRoute>} />
          <Route path="/create-workspace" element={<ProtectedRoute><CreateWorkspace /></ProtectedRoute>} />
          <Route path="/workspace/:workspaceId" element={<ProtectedRoute><WorkspaceDetail /></ProtectedRoute>} />
          <Route path="/workspace/:workspaceId/add-members" element={<ProtectedRoute><AddMembers /></ProtectedRoute>} />
          <Route path="/workspace/:workspaceId/create-project" element={<ProtectedRoute><CreateProject /></ProtectedRoute>} />
          <Route path="/workspace/:workspaceId/project/:projectId/create-task" element={<ProtectedRoute><CreateTask /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
