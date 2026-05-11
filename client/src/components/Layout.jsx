import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, FolderKanban, LogOut, User } from 'lucide-react'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: '240px', background: 'white', borderRight: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#4f46e5', margin: 0 }}>TaskManager</h1>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: '4px 0 0' }}>Team Collaboration</p>
        </div>

        <nav style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <NavLink to="/dashboard" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none',
            background: isActive ? '#eef2ff' : 'transparent',
            color: isActive ? '#4f46e5' : '#6b7280'
          })}>
            <LayoutDashboard size={17} /> Dashboard
          </NavLink>
          <NavLink to="/projects" style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px',
            borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none',
            background: isActive ? '#eef2ff' : 'transparent',
            color: isActive ? '#4f46e5' : '#6b7280'
          })}>
            <FolderKanban size={17} /> Projects
          </NavLink>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#f9fafb', borderRadius: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={15} color="#4f46e5" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1f2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', width: '100%', background: 'none', border: 'none', borderRadius: '8px', fontSize: '13px', color: '#ef4444', cursor: 'pointer' }}>
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowy: 'auto', overflowx:'hidden', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}