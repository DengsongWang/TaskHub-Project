import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';


const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjects();
        setProjects(response.data);
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Projects</h1>
        <Link to="/projects/new" className="btn btn-success">
          Create New Project
        </Link>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div className="col-md-4 mb-4" key={project.id}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="card-title">{project.title}</h5>
                    <p className="card-text text-muted">
                      {project.description || 'No description'}
                    </p>
                    <div className="mb-2">
                      <small className="text-muted">
                        Due: {project.due_date ? formatDate(project.due_date) : 'No due date'}
                      </small>
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between mb-1">
                        <span>Progress</span>
                        <span>
                          {project.completed_tasks}/{project.total_tasks} tasks
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${project.total_tasks ? (project.completed_tasks / project.total_tasks) * 100 : 0}%`
                          }}
                          aria-valuenow={project.total_tasks ? (project.completed_tasks / project.total_tasks) * 100 : 0}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >
                          {project.total_tasks ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer bg-transparent">
                    <Link 
                      to={`/projects/${project.id}`} 
                      className="btn btn-primary w-100"
                    >
                      View Project
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12">
              <div className="alert alert-info">
                You don't have any projects yet. Create your first project to get started.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectList;