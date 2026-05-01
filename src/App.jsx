import { useState } from 'react'
import {BrowserRouter as Router, Routes, Route, BrowserRouter} from 'react-router-dom'

import './App.css'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import Navbar from './components/Navbar'
import ForgotPassword from './pages/ForgotPassword'
import AuthSuccess from './pages/AuthSuccess'
import CreateWorkspace from './pages/CreateWorkspace'
import Dashbord from './pages/Dashbord'
import Members from './pages/Members'
import Projects from './pages/Project'
import Boards from './pages/Boards'
import ProtectedRoute from './components/ProtectRouter'
import WorkspaceDetail from './pages/WorkspaceDetail'
import AddMembers from './pages/AddMembers'
import AcceptInvite from './pages/AcceptInvite'
import ProjectsList from './pages/ProjectsList'
import CreateProject from './pages/CreateProject'
import CreateTask from './pages/CreateTask'

function App() {

  return (
    <BrowserRouter>
    <Navbar />
    <Routes>
      {/* public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login/>}/>
      <Route path="/register" element={<Register/>}/>
      <Route path="/forgot-password" element={<ForgotPassword/>}/>
      <Route path="/reset-password" element={<ResetPassword/>}/>
      <Route path='/success-login' element={<AuthSuccess/>}/>


      


      
      <Route path='/dashboard/members' element={<Members/>}/>
      <Route path='/dashboard/projects' element={<Projects/>}/>
      <Route path='/dashboard/boards' element={<Boards/>}/>

      
      {/* Protected routes */}

    <Route path='/create-workspace' element={ <ProtectedRoute> <CreateWorkspace/> </ProtectedRoute>}/>
    <Route path='/workspace/:workspaceId' element={ <ProtectedRoute> <WorkspaceDetail/> </ProtectedRoute>}/>
    <Route path='/dashboard' element={<ProtectedRoute> <Dashbord/> </ProtectedRoute>}/>
    <Route path='/workspace/:workspaceId/add-members' element={<ProtectedRoute><AddMembers/></ProtectedRoute>} /> 
    <Route path='/accept-invite' element={<AcceptInvite/>} /> 
    <Route path='/workspace/:workspaceId/projects' element={<ProtectedRoute><ProjectsList/></ProtectedRoute>} />
    <Route path='/workspace/:workspaceId/create-project' element={<ProtectedRoute><CreateProject/></ProtectedRoute>} />
    <Route path='/workspace/:workspaceId/project/:projectId/create-task' element={<ProtectedRoute><CreateTask/></ProtectedRoute>} /> 
  </Routes>
    </BrowserRouter>
  )
}

export default App
