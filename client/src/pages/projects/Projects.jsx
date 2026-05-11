import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { getProjects, createProject, deleteProject } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { Plus, Trash2, FolderKanban, Calendar, Users } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', deadline: '', status: 'active' })
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const res = await getProjects()
      setProjects(res.data.projects)
    } catch (err) {
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!form.name) return toast.error('Project name is required')
    setCreating(true)
    try {
      const res = await createProject(form)
      setProjects([res.data.project, ...projects])
      setShowModal(false)
      setForm({ name: '', description: '', deadline: '', status: 'active' })
      toast.success('Project created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return
    try {
      await deleteProject(id)
      setProjects(projects.filter(p => p._id !== id))
      toast.success('Project deleted')
    } catch (err) {
      toast.error('Failed to delete project')
    }
  }

  const statusColor = (status) => {
    if (status === 'active') return 'bg-green-100 text-green-700'
    if (status === 'completed') return 'bg-blue-100 text-blue-700'
    return 'bg-yellow-100 text-yellow-700'
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-500 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-20">
          <FolderKanban size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No projects yet</h3>
          <p className="text-gray-400 text-sm mt-1">Create your first project to get started</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            <Plus size={16} /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <div key={project._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor(project.status)}`}>
                  {project.status}
                </span>
                {(user?.role === 'admin' || project.owner?._id === user?._id) && (
                  <button onClick={() => handleDelete(project._id)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <Link to={`/projects/${project._id}`}>
                <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 transition-colors mb-2">
                  {project.name}
                </h3>
              </Link>
              {project.description && (
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Users size={13} />
                  <span>{project.members?.length || 0} members</span>
                </div>
                {project.deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar size={13} />
                    <span>{new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
        >
<div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter project name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Project description..."
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={e => setForm({ ...form, deadline: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}