import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, Lock, User, Mail, ArrowRight } from 'lucide-react';
import api from '../utils/api';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'client', // Default to client for org setup
        position: 'owner', // owner, manager, driver
        permissions: []
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'position') {
            // Map position to role
            let role = 'client';
            let perms = [];
            if (value === 'driver') {
                role = 'user';
                perms = ['manage_fuel', 'view_fleet'];
            } else if (value === 'manager') {
                role = 'client';
                perms = ['manage_inventory', 'manage_garage', 'manage_fuel', 'view_fleet', 'view_reports'];
            } else if (value === 'owner') {
                role = 'admin'; // First owner can be admin
                perms = ['all'];
            }
            setFormData({ ...formData, [name]: value, role, permissions: perms });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handlePermissionChange = (perm) => {
        const newPerms = formData.permissions.includes(perm)
            ? formData.permissions.filter(p => p !== perm)
            : [...formData.permissions, perm];
        setFormData({ ...formData, permissions: newPerms });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await api.post('/api/auth/register', formData);
            const { token, user } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
            >
                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Setup Organization</h2>
                        <p className="text-slate-400">Create your client account</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-slate-300 text-sm font-medium ml-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Company or User Name"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-slate-300 text-sm font-medium ml-1">Email</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-2">
                            <label className="text-slate-300 text-sm font-medium ml-1">What is your role in the company?</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'owner', label: 'Owner/Admin' },
                                    { id: 'manager', label: 'Manager' },
                                    { id: 'driver', label: 'Staff/Driver' }
                                ].map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => handleChange({ target: { name: 'position', value: p.id } })}
                                        className={`py-2 text-xs font-semibold rounded-xl border transition-all ${formData.position === p.id ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-900/50 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {formData.position === 'driver' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-2 pt-2"
                            >
                                <label className="text-slate-300 text-sm font-medium ml-1">Required Access</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { id: 'manage_inventory', label: 'Inventory' },
                                        { id: 'manage_garage', label: 'Garage' },
                                        { id: 'manage_fuel', label: 'Fuel Sheet' },
                                        { id: 'view_fleet', label: 'Fleet Circle' }
                                    ].map((perm) => (
                                        <label key={perm.id} className="flex items-center space-x-2 p-3 bg-slate-900/50 border border-slate-700 rounded-xl cursor-context-menu">
                                            <input
                                                type="checkbox"
                                                checked={formData.permissions.includes(perm.id)}
                                                onChange={() => handlePermissionChange(perm.id)}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="text-xs text-slate-300">{perm.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-3 px-4 mt-6 border border-transparent rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 transition-all"
                        >
                            {loading ? 'Processing...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-400 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Register;
