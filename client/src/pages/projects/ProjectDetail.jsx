import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { getProject, addMember } from '../../api/projects'
import { createTask, updateTask, deleteTask } from '../../api/tasks'
import { useAuth } from '../../context/AuthContext'
import { Plus, Trash2, ArrowLeft, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

const COLUMNS = ['todo', 'in-progress', 'review', 'done']
const colLabel = (s) => s === 'in-progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMemberModal, setShowMemberModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' })
  const [memberEmail, setMemberEmail] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchProject() }, [id])

  const fetchProject = async () => {
    try {
      const res = await getProject(id)
      setProject(res.data.project)
      setTasks(res.data.tasks)
    } catch { toast.error('Failed to load project') }
    finally { setLoading(false) }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!taskForm.title) return toast.error('Title required')
    setCreating(true)
    try {
      const res = await createTask({ ...taskForm, project: id })
      setTasks(prev => [res.data.task, ...prev])
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', assignedTo: '' })
      toast.success('Task created!')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setCreating(false) }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await updateTask(taskId, { status })
      setTasks(prev => prev.map(t => t._id === taskId ? res.data.task : t))
    } catch { toast.error('Failed to update') }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      setTasks(prev => prev.filter(t => t._id !== taskId))
      toast.success('Deleted')
    } catch { toast.error('Failed to delete') }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!memberEmail) return toast.error('Email required')
    setCreating(true)
    try {
      await addMember(id, { email: memberEmail, role: 'member' })
      setMemberEmail('')
      setShowMemberModal(false)
      toast.success('Member added!')
      fetchProject()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setCreating(false) }
  }

  const isAdmin = user?.role === 'admin' ||
    project?.owner?._id === user?._id ||
    project?.members?.find(m => m.user?._id === user?._id)?.role === 'admin'

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" /></div>
  if (!project) return <div className="flex items-center justify-center h-screen"><p className="text-gray-400">Project not found</p></div>

  return (
    <div className="flex flex-col bg-gray-50 overflow-hidden" style={{height: '100%', minHeight: 0}}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between" style={{flexShrink: 0}}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="text-gray-400 hover:text-gray-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">{project.name}</h1>
            {project.description && <p className="text-sm text-gray-500">{project.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button onClick={() => setShowMemberModal(true)} className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
              <Users size={15} /> Add Member
            </button>
          )}
          <button onClick={() => setShowTaskModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            <Plus size={15} /> Add Task
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 flex items-center gap-2 flex-wrap" style={{flexShrink: 0}}>
        <span className="text-xs text-gray-400">Members:</span>
        {project.members?.map(m => (
          <div key={m.user?._id} className="flex items-center gap-1 bg-indigo-50 rounded-full px-3 py-1">
            <div className="w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700">
              {m.user?.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-indigo-700">{m.user?.name}</span>
            <span className="text-xs text-indigo-400">({m.role})</span>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 p-5" style={{flex: 1, minHeight: 0}}>
        {COLUMNS.map(status => {
          const colTasks = tasks.filter(t => t.status === status)
          return (
            <div key={status} className="flex flex-col bg-white rounded-xl border border-gray-200" style={{flex: 1, minWidth: 0, overflow: 'hidden'}}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100" style={{flexShrink: 0}}>
                <span className="text-sm font-semibold text-gray-700">{colLabel(status)}</span>
                <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">{colTasks.length}</span>
              </div>
              <div style={{flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                {colTasks.length === 0 && <p className="text-center text-xs text-gray-300 py-8">No tasks</p>}
                {colTasks.map(task => (
                  <div key={task._id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-gray-800">{task.title}</p>
                      {isAdmin && (
                        <button onClick={() => handleDeleteTask(task._id)} className="text-gray-300 hover:text-red-400" style={{flexShrink: 0}}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-gray-500 mb-2 line-clamp-2">{task.description}</p>}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-600' : task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className={`text-xs flex items-center gap-1 ${task.isOverdue ? 'text-red-500' : 'text-gray-400'}`}>
                          <Calendar size={10} />{new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {task.assignedTo && (
                      <div className="flex items-center gap-1 mb-2">
                        <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                          {task.assignedTo?.name?.[0]?.toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-500">{task.assignedTo?.name}</span>
                      </div>
                    )}
                    <select value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none cursor-pointer">
                      {COLUMNS.map(s => <option key={s} value={s}>{colLabel(s)}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Modal */}
      {showTaskModal && createPortal(
        <div onClick={e => e.target === e.currentTarget && setShowTaskModal(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:'16px'}}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" style={{maxHeight:'90vh',overflowY:'auto'}}>
            <h2 className="text-lg font-bold text-gray-800 mb-5">Add New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="Task title" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} rows={3} placeholder="Description..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="">Unassigned</option>
                  {project.members?.map(m => <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowTaskModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">{creating ? 'Creating...' : 'Create Task'}</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* Member Modal */}
      {showMemberModal && createPortal(
        <div onClick={e => e.target === e.currentTarget && setShowMemberModal(false)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:'16px'}}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-5">Add Member</h2>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="member@example.com" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm disabled:opacity-50">{creating ? 'Adding...' : 'Add Member'}</button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}
    </div>
  )
}
