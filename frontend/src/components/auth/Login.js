// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useToast } from '../../context/ToastContext';


// const Login = () => {
//   const [credentials, setCredentials] = useState({
//     username: '',
//     password: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [formError, setFormError] = useState('');
  
//   const { login, error, isAuthenticated } = useAuth();
//   const { addToast } = useToast();
//   const navigate = useNavigate();
  
//   // 如果用户已登录，重定向到仪表盘
//   useEffect(() => {
//     if (isAuthenticated) {
//       navigate('/');
//     }
//   }, [isAuthenticated, navigate]);
  
//   // 监听AuthContext中的错误
//   useEffect(() => {
//     if (error) {
//       setFormError(error);
//       setLoading(false); // 确保加载状态结束
//     }
//   }, [error]);
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setCredentials(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setFormError('');
    
//     // 验证
//     if (!credentials.username || !credentials.password) {
//       setFormError('Please enter both username and password');
//       return;
//     }
    
//     setLoading(true);
//     // 直接使用login返回值，不使用嵌套try-catch
//     const success = await login(credentials);
//     setLoading(false);
    
//     if (success) {
//       addToast('Login successful! Welcome back.', 'success');
//       navigate('/');
//     } else {
//       // 登录失败时，通过formError显示错误，不使用Toast
//       // error状态已经在AuthContext中设置，会触发useEffect处理
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter') {
//       e.preventDefault();
//       handleSubmit(e);
//     }
//   };
  
//   return (
//     <div className="row justify-content-center">
//       <div className="col-md-6 col-lg-5">
//         <div className="card shadow">
//           <div className="card-header bg-primary text-white">
//             <h4 className="mb-0">Login</h4>
//           </div>
//           <div className="card-body">
//             {formError && (
//               <div className="alert alert-danger" role="alert">
//                 {formError}
//               </div>
//             )}
//             <form onSubmit={(e) => e.preventDefault()} noValidate>            {/* 添加noValidate */}
//               {/* 表单内容与之前相同 */}
//               <div className="mb-3">
//                 <label htmlFor="username" className="form-label">Username</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   id="username"
//                   name="username"
//                   value={credentials.username}
//                   onChange={handleChange}
//                   onKeyDown={handleKeyDown}
//                   disabled={loading}
//                 />
//               </div>
//               <div className="mb-3">
//                 <label htmlFor="password" className="form-label">Password</label>
//                 <input
//                   type="password"
//                   className="form-control"
//                   id="password"
//                   name="password"
//                   value={credentials.password}
//                   onChange={handleChange}
//                   onKeyDown={handleKeyDown}
//                   disabled={loading}
//                 />
//               </div>
//               <button 
//                 type="button" 
//                 className="btn btn-primary w-100"
//                 disabled={loading}
//                 onClick={handleSubmit}
//               >
//                 {loading ? (
//                   <>
//                     <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                     Logging in...
//                   </>
//                 ) : 'Login'}
//               </button>
//             </form>
//             <div className="mt-3 text-center">
//               <p>Don't have an account? <Link to="/register" className="text-primary">Register</Link></p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

// Login.js - 彻底重新实现，避开所有表单行为
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const { login, error, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  // 监听认证状态
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
  
  // 监听错误状态
  useEffect(() => {
    if (error) {
      setFormError(error);
      setLoading(false);
    }
  }, [error]);
  
  // 处理登录操作 - 不使用表单事件
  const handleLogin = async () => {
    // 阻止处理中重复点击
    if (loading) return;
    
    // 验证
    if (!username || !password) {
      setFormError('Please enter both username and password');
      return;
    }
    
    try {
      setLoading(true);
      setFormError('');
      
      // 直接调用登录方法
      const credentials = { username, password };
      const success = await login(credentials, rememberMe);
      
      if (success) {
        try {
          addToast('Login successful!', 'success');
        } catch (toastError) {
          console.error('Toast error:', toastError);
        }
        navigate('/');
      } else {
        setFormError('Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setFormError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-5">
        <div className="card shadow">
          <div className="card-header bg-primary text-white">
            <h4 className="mb-0">Login</h4>
          </div>
          <div className="card-body">
            {formError && (
              <div className="alert alert-danger" role="alert">
                {formError}
              </div>
            )}
            
            {/* 无表单元素，直接使用div */}
            <div>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !loading) {
                      e.preventDefault();
                      handleLogin();
                    }
                  }}
                />
              </div>

              <div className="mb-3 form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="rememberMe">
                  Remember me on this device
                </label>
              </div>

              <button 
                type="button" 
                className="btn btn-primary w-100"
                disabled={loading}
                onClick={handleLogin}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : 'Login'}
              </button>
            </div>
            
            <div className="mt-3 text-center">
              <p>Don't have an account? <Link to="/register" className="text-primary">Register</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;