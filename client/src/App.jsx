import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/dashboard/Dashboard'
import Projects from './pages/projects/Projects'
import ProjectDetail from './pages/projects/ProjectDetail'
import Layout from './components/Layout'

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  return user ? children : <Navigate to="/login" />
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading...</div>
  return user ? <Navigate to="/dashboard" /> : children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  )
}