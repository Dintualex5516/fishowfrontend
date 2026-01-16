// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { Fish, Lock, User } from 'lucide-react';
// import { login } from '../../lib/auth';

// const Login: React.FC = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   // const handleLogin = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setLoading(true);

//   //   try {
//   //     // 1️⃣ Get user record by username
//   //     const { data: user, error } = await supabase
//   //       .from('users')
//   //       .select('username, password_hash')
//   //       .eq('username', username)
//   //       .single();

//   //     if (error || !user) {
//   //       alert('Invalid username or password');
//   //       setLoading(false);
//   //       return;
//   //     }

//   //     // 2️⃣ Compare entered password with hashed password
//   //     const isMatch = await bcrypt.compare(password, user.password_hash);
//   //     if (!isMatch) {
//   //       alert('Invalid username or password');
//   //       setLoading(false);
//   //       return;
//   //     }

//   //     // 3️⃣ Store auth state in localStorage
//   //     localStorage.setItem('isAuthenticated', 'true');
//   //     localStorage.setItem('username', user.username);

//   //     // 4️⃣ Redirect
//   //     navigate('/dashboard');
//   //   } catch (err) {
//   //     console.error(err);
//   //     alert('Something went wrong. Please try again.');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };
// const handleLogin = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//     const resp = await login({ username: username.trim(), password });
//     // resp.data should be: { accessToken, user: { id, fullName, username, email } }
//     const { accessToken, user } = resp.data;

    
//     localStorage.setItem('accessToken', accessToken);
//     localStorage.setItem('isAuthenticated', 'true');
//     localStorage.setItem('username', user.username);
//     localStorage.setItem('user', JSON.stringify(user));


//     navigate('/dashboard');
//   } catch (err: any) {
//     if (err?.response) {
//       // 401 -> invalid credentials, 400 -> bad request, etc.
//       const status = err.response.status;
//       const msg = err.response.data?.message || 'Login failed';
//       if (status === 401) alert('Invalid username or password');
//       else alert(msg);
//     } else {
//       alert('Network error. Please try again.');
//     }
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
//       <div className="w-full max-w-md">
//         <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <div className="flex justify-center mb-4">
//               <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
//                 <Fish className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//               </div>
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fishow</h1>
//             <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
//               Powered by Popular Fish
//             </p>
//             <p className="text-xs text-gray-500 dark:text-gray-400">Developed by Ecobiz</p>
//           </div>

//           {/* Login Form */}
//           <form onSubmit={handleLogin} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                 Username
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                   placeholder="Enter your username"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
//                 <input
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
//                   placeholder="Enter your password"
//                   required
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
//             >
//               {loading ? 'Signing in...' : 'Sign In'}
//             </button>
//           </form>

//           {/* Sign Up Link */}
//           <div className="text-center mt-6">
//             <p className="text-sm text-gray-600 dark:text-gray-300">
//               Don't have an account?{' '}
//               <Link
//                 to="/signup"
//                 className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
//               >
//                 Sign Up
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Fish, Lock, User } from 'lucide-react';
import { login } from '../../lib/auth';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const resp = await login({ username: username.trim(), password });
      // Expected: { accessToken, user: { id, fullName, username, email, role } }
      const { accessToken, user } = resp.data;

      // Save to localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role); // Store role (expected values: 'sale'|'box'|'admin')
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect to main dashboard for all roles; menu visibility is controlled by role
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.response) {
        const status = err.response.status;
        const msg = err.response.data?.message || 'Login failed';

        if (status === 401) alert('Invalid username or password');
        else alert(msg);
      } else {
        alert('Network error. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 transition-colors duration-200">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-600 transition-colors duration-200">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <Fish className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Fishow
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              Powered by Popular Fish
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Developed by Cydexsoft
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all font-medium disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Sign Up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;