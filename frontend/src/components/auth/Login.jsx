import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Landmark, LogIn } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post("/auth/login", { email, password });
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="h-screen bg-[#242220] flex flex-col justify-center py-4 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-[#302e2c] border border-white/5 text-gray-300 p-4 rounded-full shadow-lg">
            <Landmark size={40} strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-serif text-[#ececec]">
          Enter the Arena
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Or <Link to="/register" className="font-medium text-gray-200 hover:text-white hover:underline transition-all">create a new account</Link>
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#302e2c] py-6 px-4 shadow-xl sm:rounded-2xl border border-white/5 sm:px-10">
          {error && <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email address</label>
              <input
                type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-inner bg-[#242220] placeholder-gray-600 text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 sm:text-sm transition-all"
                placeholder="developer@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-inner bg-[#242220] placeholder-gray-600 text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 sm:text-sm transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#302e2c] focus:ring-white items-center gap-2 transition-all active:scale-[0.98]"
              >
                <LogIn size={18} />
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
