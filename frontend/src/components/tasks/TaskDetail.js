import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { taskService } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';

const TaskDetail = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const response = await taskService.getTask(taskId);
        setTask(response.data);
      } catch (err) {
        console.error('Failed to fetch task details:', err);
        setError('Failed to load task details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTask();
  }, [taskId]);
  
  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
      try {
        await taskService.deleteTask(taskId);
        navigate(`/projects/${task.project_id}`);
      } catch (err) {
        console.error('Failed to delete task:', err);
        setError('Failed to delete task. Please try again later.');
      }
    }
  };
  
  const handleStatusChange = async (newStatus) => {
    try {
      await taskService.updateTask(taskId, { status: newStatus });
      setTask(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status. Please try again later.');
    }
  };
  
  if (loading) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  if (!task) {
    return <div className="alert alert-warning">Task not found.</div>;
  }
  
  // 确定状态标签的颜色
  const getStatusBadgeClass = () => {
    switch (task.status) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'in_progress':
        return 'bg-info text-white';
      case 'completed':
        return 'bg-success text-white';
      default:
        return 'bg-secondary';
    }
  };
  
  // 确定优先级标签的颜色
  const getPriorityBadgeClass = () => {
    switch (task.priority) {
      case 'high':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning text-dark';
      case 'low':
        return 'bg-info text-white';
      default:
        return 'bg-secondary';
    }
  };
  
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{task.title}</h1>
        <div>
          <Link to={`/tasks/${taskId}/edit`} className="btn btn-primary me-2">
            Edit Task
          </Link>
          <button 
            className="btn btn-danger"
            onClick={handleDeleteTask}
          >
            Delete Task
          </button>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <div className="row mb-4">
            <div className="col-md-6">
              <h5>Description</h5>
              <p>{task.description || 'No description provided.'}</p>
            </div>
            <div className="col-md-6">
              <h5>Details</h5>
              <ul className="list-group">
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Status
                  <span className={`badge ${getStatusBadgeClass()}`}>
                    {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Priority
                  <span className={`badge ${getPriorityBadgeClass()}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Due Date
                  <span>{task.due_date ? formatDate(task.due_date) : 'None'}</span>
                </li>
                
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  Created
                  <span>{formatDate(task.created_at)}</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-top pt-3">
            <h5 className="mb-3">Change Status</h5>
            <div className="d-flex gap-2">
              <button 
                className={`btn ${task.status === 'pending' ? 'btn-warning' : 'btn-outline-warning'}`}
                onClick={() => handleStatusChange('pending')}
                disabled={task.status === 'pending'}
              >
                Pending
              </button>
              <button 
                className={`btn ${task.status === 'in_progress' ? 'btn-info' : 'btn-outline-info'}`}
                onClick={() => handleStatusChange('in_progress')}
                disabled={task.status === 'in_progress'}
              >
                In Progress
              </button>
              <button 
                className={`btn ${task.status === 'completed' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => handleStatusChange('completed')}
                disabled={task.status === 'completed'}
              >
                Completed
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="d-flex justify-content-between">
        <Link to={`/projects/${task.project_id}`} className="btn btn-outline-secondary">
          Back to Project
        </Link>
      </div>
    </div>
  );
};

export default TaskDetail;