import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', projectId: '', assignedToId: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        axios.get('/api/tasks'),
        axios.get('/api/projects'),
        axios.get('/api/projects/users/all') // Used general users fetch for dropdown
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/tasks', newTask);
      setNewTask({ title: '', description: '', dueDate: '', projectId: '', assignedToId: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`/api/tasks/${taskId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'TODO') return 'badge badge-todo';
    if (status === 'IN_PROGRESS') return 'badge badge-progress';
    return 'badge badge-completed';
  };

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Tasks</h1>
        {user.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> New Task
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>Create New Task</h3>
          <form onSubmit={handleCreateTask}>
            <div className="grid-cards" style={{ marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="form-control" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" className="form-control" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Project</label>
                <select className="form-control" value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})} required>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select className="form-control" value={newTask.assignedToId} onChange={e => setNewTask({...newTask, assignedToId: e.target.value})}>
                  <option value="">Unassigned</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea className="form-control" rows="2" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Task</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-cards">
        {tasks.map(task => (
          <div key={task.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>{task.title}</h3>
              <span className={getStatusBadgeClass(task.status)}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{task.description || 'No description'}</p>
            
            <div style={{ fontSize: '0.875rem', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>Project: <strong>{task.project?.name}</strong></div>
              <div>Assignee: <strong>{task.assignedTo?.name || 'Unassigned'}</strong></div>
              {task.dueDate && <div>Due: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong></div>}
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>Update Status</label>
              <select 
                className="form-control" 
                value={task.status} 
                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                disabled={user.role === 'MEMBER' && task.assignedToId !== user.id}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      
      {tasks.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No tasks found.</div>}
    </div>
  );
};

export default Tasks;
