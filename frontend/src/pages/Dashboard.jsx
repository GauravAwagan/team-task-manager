import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, Clock, AlertTriangle, ListTodo } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          axios.get('/api/dashboard'),
          axios.get('/api/tasks')
        ]);
        setStats(statsRes.data);
        setTasks(tasksRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>
      
      <div className="grid-cards">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '12px', color: '#60a5fa' }}>
              <ListTodo size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Total Tasks</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '12px', color: '#4ade80' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Completed</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.completed}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(234, 179, 8, 0.2)', borderRadius: '12px', color: '#facc15' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>In Progress</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.inProgress}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ borderLeft: stats.overdue > 0 ? '4px solid var(--danger)' : 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '12px', color: '#f87171' }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Overdue</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stats.overdue > 0 ? 'var(--danger)' : 'inherit' }}>
                {stats.overdue}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '3rem' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Your Tasks Data</h2>
        
        <div className="glass-panel" style={{ padding: '0' }}>
          {tasks.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Title</th>
                  <th style={{ padding: '1rem' }}>Project</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '1rem' }}>{task.title}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{task.project?.name || 'N/A'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge badge-${task.status.toLowerCase().replace('_', '')}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No tasks found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
