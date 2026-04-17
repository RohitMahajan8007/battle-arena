import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Landmark, UserPlus } from 'lucide-react';
import axios from 'axios';

const Register = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post("/auth/register", { 
        username: name, 
        email, 
        password 
      });
      if (response.data.user) {
        navigate('/login', { state: { email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
          Join the Arena
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          Already have an account? <Link to="/login" className="font-medium text-gray-200 hover:text-white hover:underline transition-all">Sign in here</Link>
        </p>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#302e2c] py-6 px-4 shadow-xl sm:rounded-2xl border border-white/5 sm:px-10">
          {error && <div className="mb-4 p-3 bg-red-400/10 border border-red-400/20 rounded-lg text-red-400 text-sm text-center">{error}</div>}
          <form className="space-y-6" onSubmit={handleRegister}>
             <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                type="text" required
                value={name} onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-white/10 rounded-xl shadow-inner bg-[#242220] placeholder-gray-600 text-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 sm:text-sm transition-all"
                placeholder="Alan Turing"
              />
            </div>

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
                <UserPlus size={18} />
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
