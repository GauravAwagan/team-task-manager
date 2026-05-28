import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  // Create project form state
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // Add member state
  const [selectedUsers, setSelectedUsers] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/projects/users/all')
      ]);
      setProjects(projRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/projects', newProject);
      setNewProject({ name: '', description: '' });
      setShowForm(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (projectId) => {
    const userId = selectedUsers[projectId];
    if (!userId) return;
    try {
      await axios.post(`/api/projects/${projectId}/members`, { userId });
      setSelectedUsers({ ...selectedUsers, [projectId]: '' });
      fetchData();
    } catch (err) {
      console.log(err);
      alert('Error adding member');
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Projects</h1>
        {user.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="glass-panel" style={{ marginBottom: '2rem' }}>
          <h3>Create New Project</h3>
          <form onSubmit={handleCreateProject}>
            <div className="form-group">
              <label>Project Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={newProject.name} 
                onChange={e => setNewProject({...newProject, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                className="form-control" 
                rows="3"
                value={newProject.description} 
                onChange={e => setNewProject({...newProject, description: e.target.value})} 
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-primary">Save Project</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid-cards">
        {projects.map(project => (
          <div key={project.id} className="card">
            <h3>{project.name}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{project.description || 'No description provided.'}</p>
            
            <div style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              <div>Owner: <strong>{project.owner?.name}</strong></div>
              <div>Tasks: <strong>{project._count?.tasks}</strong></div>
              <div style={{ marginTop: '0.5rem' }}>
                Team ({project.members?.length || 0}):{' '}
                <span style={{ color: 'var(--text-muted)' }}>
                  {project.members?.map(m => m.name).join(', ')}
                </span>
              </div>
            </div>

            {user.role === 'ADMIN' && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '0.5rem' }}>
                <select 
                  className="form-control" 
                  style={{ padding: '0.5rem', fontSize: '0.875rem' }}
                  value={selectedUsers[project.id] || ''}
                  onChange={(e) => setSelectedUsers({...selectedUsers, [project.id]: e.target.value})}
                >
                  <option value="">Select User...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
                <button className="btn btn-outline" style={{ padding: '0.5rem 1rem' }} onClick={() => handleAddMember(project.id)}>
                  Add
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {projects.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No projects found.</div>}
    </div>
  );
};

export default Projects;
