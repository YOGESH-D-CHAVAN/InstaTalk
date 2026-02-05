import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    // Responsive outer container with light background
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 p-4">
      {/* Responsive card: scales from mobile to max-w-md on desktop */}
      <div className="bg-white p-6 md:p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        <h2 className="text-3xl font-extrabold text-center mb-2 text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-8">Join our community today</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-center text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Username
            </label>
            <input 
                name="username" 
                type="text" 
                required
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400 shadow-sm"
                placeholder="johndoe" 
                onChange={handleChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Email
            </label>
            <input 
                name="email" 
                type="email" 
                required
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400 shadow-sm"
                placeholder="u@example.com" 
                onChange={handleChange} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
              Password
            </label>
            <input 
                name="password" 
                type="password" 
                required
                className="w-full bg-white border border-gray-300 text-gray-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder-gray-400 shadow-sm"
                placeholder="••••••••" 
                onChange={handleChange} 
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              Sign Up
            </button>
          </div>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-emerald-600 font-semibold hover:underline underline-offset-4">Log In</Link>
        </p>
      </div>
    </div>
  );
}