import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { projectService, taskService } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProjectAndTasks = async () => {
      try {
        setLoading(true);
        
        const [projectResponse, tasksResponse] = await Promise.all([
          projectService.getProject(id),
          taskService.getTasks(id)
        ]);
        
        setProject(projectResponse.data);
        setTasks(tasksResponse.data);
      } catch (err) {
        console.error('Failed to fetch project details:', err);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectAndTasks();
  }, [id]);
  
  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectService.deleteProject(id);
        navigate('/projects');
      } catch (err) {
        console.error('Failed to delete project:', err);
        setError('Failed to delete project. Please try again later.');
      }
    }
  };
  
  // Filter tasks by status
  const pendingTasks = tasks.filter(task => task.status === 'pending');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');
  
  return (
    <div>
      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : project ? (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>{project.title}</h1>
            <div>
              <Link to={`/projects/${id}/edit`} className="btn btn-primary me-2">
                Edit Project
              </Link>
              <button 
                className="btn btn-danger"
                onClick={handleDeleteProject}
              >
                Delete Project
              </button>
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <h5>Description</h5>
                  <p>{project.description || 'No description provided.'}</p>
                </div>
                <div className="col-md-4">
                  <h5>Details</h5>
                  <ul className="list-unstyled">
                    <li><strong>Due Date:</strong> {project.due_date ? formatDate(project.due_date) : 'None'}</li>
                    <li><strong>Created:</strong> {formatDate(project.created_at)}</li>
                    <li><strong>Tasks:</strong> {tasks.length}</li>
                    <li>
                      <strong>Progress:</strong> 
                      <div className="progress mt-2">
                        <div 
                          className="progress-bar" 
                          role="progressbar" 
                          style={{ 
                            width: `${tasks.length ? (completedTasks.length / tasks.length) * 100 : 0}%` 
                          }}
                        >
                          {tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>Tasks</h2>
            
            <Link to={`/projects/${id}/tasks/new`} className="btn btn-success">
              Add New Task
            </Link>
          </div>
          
          {tasks.length === 0 ? (
            <div className="alert alert-info">
              This project doesn't have any tasks yet. Add a task to get started.
            </div>
          ) : (
            <div className="row">
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header bg-warning text-dark">
                    <h5 className="mb-0">Pending ({pendingTasks.length})</h5>
                  </div>
                  <div className="card-body">
                    {pendingTasks.map(task => (
                      <div key={task.id} className="card mb-2">
                        <div className="card-body">
                          <h6 className="card-title">{task.title}</h6>
                          <p className="card-text small text-muted mb-2">
                            {task.due_date ? `Due: ${formatDate(task.due_date)}` : 'No due date'}
                          </p>
                          
                          <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                    {pendingTasks.length === 0 && (
                      <p className="text-muted">No pending tasks.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header bg-info text-white">
                    <h5 className="mb-0">In Progress ({inProgressTasks.length})</h5>
                  </div>
                  <div className="card-body">
                    {inProgressTasks.map(task => (
                      <div key={task.id} className="card mb-2">
                        <div className="card-body">
                          <h6 className="card-title">{task.title}</h6>
                          <p className="card-text small text-muted mb-2">
                            {task.due_date ? `Due: ${formatDate(task.due_date)}` : 'No due date'}
                          </p>
                          
                          <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                    {inProgressTasks.length === 0 && (
                      <p className="text-muted">No tasks in progress.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header bg-success text-white">
                    <h5 className="mb-0">Completed ({completedTasks.length})</h5>
                  </div>
                  <div className="card-body">
                    {completedTasks.map(task => (
                      <div key={task.id} className="card mb-2">
                        <div className="card-body">
                          <h6 className="card-title">{task.title}</h6>
                          <p className="card-text small text-muted mb-2">
                            Completed on: {formatDate(task.updated_at) || formatDate(task.created_at)}
                          </p>
                          
                          <Link to={`/tasks/${task.id}`} className="btn btn-sm btn-outline-primary">
                            View
                          </Link>
                        </div>
                      </div>
                    ))}
                    {completedTasks.length === 0 && (
                      <p className="text-muted">No completed tasks.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="alert alert-warning">Project not found.</div>
      )}

        <div className="mt-4">
        <Link to="/projects" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left"></i> Back to Projects
        </Link>
        </div>
    </div>
  );
};

export default ProjectDetail;