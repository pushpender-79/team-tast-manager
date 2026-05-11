import { useEffect, useState } from 'react'
import { getDashboard } from '../../api/tasks'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { FolderKanban, CheckSquare, AlertCircle, Clock } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboard()
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )

  const statusCards = [
    { label: 'Total Projects', value: stats?.totalProjects || 0, icon: FolderKanban, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Total Tasks', value: stats?.totalTasks || 0, icon: CheckSquare, color: 'bg-green-50 text-green-600' },
    { label: 'My Tasks', value: stats?.myTasks || 0, icon: Clock, color: 'bg-blue-50 text-blue-600' },
    { label: 'Overdue', value: stats?.overdueTasks || 0, icon: AlertCircle, color: 'bg-red-50 text-red-600' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name}! 👋</h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your projects</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statusCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon size={18} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Status</h2>
          {stats?.statusBreakdown ? (
            <div className="space-y-3">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      status === 'todo' ? 'bg-gray-400' :
                      status === 'in-progress' ? 'bg-blue-400' :
                      status === 'review' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></span>
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tasks yet</p>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks by Priority</h2>
          {stats?.priorityBreakdown ? (
            <div className="space-y-3">
              {Object.entries(stats.priorityBreakdown).map(([priority, count]) => (
                <div key={priority} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      priority === 'high' ? 'bg-red-400' :
                      priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></span>
                    <span className="text-sm text-gray-600 capitalize">{priority}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No tasks yet</p>
          )}
        </div>
      </div>

      {/* Quick Link */}
      <div className="mt-6">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <FolderKanban size={16} />
          View All Projects
        </Link>
      </div>
    </div>
  )
}