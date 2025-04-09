import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';
import { formatDate } from '../utils/dateUtils';


const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 获取项目列表
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

  // 计算概要统计信息
  const totalProjects = projects.length;
  const totalTasks = projects.reduce((sum, project) => sum + project.total_tasks, 0);
  const completedTasks = projects.reduce((sum, project) => sum + project.completed_tasks, 0);
  const completionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 找出最近截止的项目
  const upcomingProjects = [...projects]
    .filter(project => project.due_date)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          {/* 统计卡片 */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Projects</h5>
                  <h2 className="card-text">{totalProjects}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Tasks</h5>
                  <h2 className="card-text">{totalTasks}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Completed Tasks</h5>
                  <h2 className="card-text">{completedTasks}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-warning text-dark">
                <div className="card-body">
                  <h5 className="card-title">Completion Rate</h5>
                  <h2 className="card-text">{completionRate}%</h2>
                </div>
              </div>
            </div>
          </div>

          {/* 快速行动 */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Quick Actions</h5>
                </div>
                <div className="card-body">
                  <div className="d-flex gap-2">
                    <Link to="/projects" className="btn btn-primary">
                      View All Projects
                    </Link>
                    <Link to="/projects/new" className="btn btn-success">
                      Create New Project
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 即将截止的项目 */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header bg-light">
                  <h5 className="mb-0">Upcoming Deadlines</h5>
                </div>
                <div className="card-body">
                  {upcomingProjects.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Project</th>
                            <th>Due Date</th>
                            <th>Progress</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {upcomingProjects.map((project) => (
                            <tr key={project.id}>
                              <td>{project.title}</td>
                              <td>{formatDate(project.due_date)}</td>
                              <td>
                                <div className="progress">
                                  <div
                                    className="progress-bar"
                                    role="progressbar"
                                    style={{
                                      width: `${project.total_tasks ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0}%`
                                    }}
                                    aria-valuenow={project.total_tasks ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  >
                                    {project.total_tasks ? Math.round((project.completed_tasks / project.total_tasks) * 100) : 0}%
                                  </div>
                                </div>
                              </td>
                              <td>
                                <Link
                                  to={`/projects/${project.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted mb-0">No upcoming deadlines.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;