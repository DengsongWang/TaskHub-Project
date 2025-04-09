import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { taskService, projectService } from '../../services/api';

const TaskForm = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!taskId;
  
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    due_date: ''
  });
  const [hasNoDueDate, setHasNoDueDate] = useState(false); // 新增：控制是否设置截止日期
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 如果是编辑模式，获取任务详情
        if (isEditing) {
          const response = await taskService.getTask(taskId);
          const taskData = response.data;
          
          // 格式化日期
          let dueDate = '';
          if (taskData.due_date) {
            const date = new Date(taskData.due_date);
            dueDate = date.toISOString().split('T')[0];
            setHasNoDueDate(false);
          } else {
            setHasNoDueDate(true);
          }
          
          setTask({
            title: taskData.title,
            description: taskData.description || '',
            status: taskData.status,
            priority: taskData.priority,
            due_date: dueDate
          });
          
          // 获取关联的项目
          const projectResponse = await projectService.getProject(taskData.project_id);
          setProject(projectResponse.data);
        } 
        // 如果是创建模式，获取项目信息
        else if (projectId) {
          const projectResponse = await projectService.getProject(projectId);
          setProject(projectResponse.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [taskId, projectId, isEditing]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNoDueDateToggle = (e) => {
    setHasNoDueDate(e.target.checked);
    if (e.target.checked) {
      // 如果选择不设置截止日期，清空日期字段
      setTask(prev => ({
        ...prev,
        due_date: ''
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!task.title) {
      setError('Task title is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // 准备要发送的任务数据
      let formattedTask = { 
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority
      };
      
      // 只有在未勾选"No due date"时添加due_date
      if (!hasNoDueDate && task.due_date) {
        formattedTask.due_date = new Date(task.due_date).toISOString().slice(0, 19);
      } else {
        // 明确设置due_date为null以移除现有截止日期（如果有）
        formattedTask.due_date = null;
      }
      
      if (isEditing) {
        await taskService.updateTask(taskId, formattedTask);
        navigate(`/tasks/${taskId}`);
      } else {
        await taskService.createTask(projectId, formattedTask);
        navigate(`/projects/${projectId}`);
      }
    } catch (err) {
      console.error('Failed to save task:', err);
      setError('Failed to save task. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && !project) {
    return (
      <div className="d-flex justify-content-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h1>{isEditing ? 'Edit Task' : 'Create New Task'}</h1>
      {project && (
        <p className="text-muted">
          Project: {project.title}
        </p>
      )}
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Task Title *</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={task.title}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="description" className="form-label">Description</label>
              <textarea
                className="form-control"
                id="description"
                name="description"
                rows="3"
                value={task.description}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="status" className="form-label">Status</label>
                <select
                  className="form-select"
                  id="status"
                  name="status"
                  value={task.status}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="priority" className="form-label">Priority</label>
                <select
                  className="form-select"
                  id="priority"
                  name="priority"
                  value={task.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div className="mb-3">
              <label htmlFor="due_date" className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control mb-3"
                id="due_date"
                name="due_date"
                value={task.due_date}
                onChange={handleChange}
                disabled={hasNoDueDate}
                lang="en" // 强制使用英文日期格式
              />
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="noDueDate"
                  checked={hasNoDueDate}
                  onChange={handleNoDueDateToggle}
                />
                <label className="form-check-label" htmlFor="noDueDate">
                  No due date
                </label>
              </div>
              
              <small className="text-muted">
                Select a date or check "No due date" to leave it unset.
              </small>
            </div>
            
            <div className="d-flex justify-content-end">
              <button
                type="button"
                className="btn btn-secondary me-2"
                onClick={() => isEditing ? navigate(`/tasks/${taskId}`) : navigate(`/projects/${projectId}`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  isEditing ? 'Update Task' : 'Create Task'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;