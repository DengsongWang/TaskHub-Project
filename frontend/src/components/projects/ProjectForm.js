import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { projectService } from '../../services/api';

const ProjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  
  const [project, setProject] = useState({
    title: '',
    description: '',
    due_date: ''
  });
  const [hasNoDueDate, setHasNoDueDate] = useState(false); // 新增：控制是否设置截止日期
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProject = async () => {
      if (isEditing) {
        try {
          setLoading(true);
          const response = await projectService.getProject(id);
          const projectData = response.data;
          
          // 格式化日期为HTML日期输入所需的格式 (YYYY-MM-DD)
          let dueDate = '';
          if (projectData.due_date) {
            const date = new Date(projectData.due_date);
            dueDate = date.toISOString().split('T')[0];
            setHasNoDueDate(false);
          } else {
            setHasNoDueDate(true);
          }
          
          setProject({
            title: projectData.title,
            description: projectData.description || '',
            due_date: dueDate
          });
        } catch (err) {
          console.error('Failed to fetch project:', err);
          setError('Failed to load project information. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };
    
    fetchProject();
  }, [id, isEditing]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleNoDueDateToggle = (e) => {
    setHasNoDueDate(e.target.checked);
    if (e.target.checked) {
      // 如果选择不设置截止日期，清空日期字段
      setProject(prev => ({
        ...prev,
        due_date: ''
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!project.title) {
      setError('Project title is required');
      return;
    }
    
    try {
      setLoading(true);
      
      // 准备要发送的项目数据
      let formattedProject = { 
        title: project.title,
        description: project.description
      };
      
      // 只有在未勾选"No due date"时添加due_date
      if (!hasNoDueDate && project.due_date) {
        formattedProject.due_date = new Date(project.due_date).toISOString().slice(0, 19);
      } else {
        // 明确设置due_date为null以移除现有截止日期（如果有）
        formattedProject.due_date = null;
      }
      
      if (isEditing) {
        await projectService.updateProject(id, formattedProject);
      } else {
        await projectService.createProject(formattedProject);
      }
      
      navigate('/projects');
    } catch (err) {
      console.error('Failed to save project:', err);
      setError('Failed to save project. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      <h1>{isEditing ? 'Edit Project' : 'Create New Project'}</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Project Title *</label>
              <input
                type="text"
                className="form-control"
                id="title"
                name="title"
                value={project.title}
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
                value={project.description}
                onChange={handleChange}
              ></textarea>
            </div>
            
            <div className="mb-3">
              
              <label htmlFor="due_date" className="form-label">Due Date</label>
              <input
                type="date"
                className="form-control mb-3"
                id="due_date"
                name="due_date"
                value={project.due_date}
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
                onClick={() => navigate('/projects')}
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
                  isEditing ? 'Update Project' : 'Create Project'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectForm;