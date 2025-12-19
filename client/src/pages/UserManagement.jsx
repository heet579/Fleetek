
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { UserPlus, Shield, Check, X, Edit2 } from 'lucide-react';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'user',
        permissions: []
    });

    const availablePermissions = [
        { id: 'manage_inventory', label: 'Manage Inventory (Add/Edit Cars)' },
        { id: 'view_reports', label: 'View Reports' },
        { id: 'manage_fuel', label: 'Manage Fuel Sheet' },
        { id: 'manage_garage', label: 'Manage Garage Status' },
    ];

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePermissionChange = (permId) => {
        if (formData.permissions.includes(permId)) {
            setFormData({ ...formData, permissions: formData.permissions.filter(p => p !== permId) });
        } else {
            setFormData({ ...formData, permissions: [...formData.permissions, permId] });
        }
    };

    const openEditModal = (user) => {
        setIsEditing(true);
        setCurrentUserId(user._id);
        setFormData({
            username: user.username,
            email: user.email,
            password: '', // Leave empty to keep unchanged
            role: user.role,
            permissions: user.permissions || []
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentUserId(null);
        setFormData({ username: '', email: '', password: '', role: 'user', permissions: [] });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (isEditing) {
                // Update
                const updateData = {
                    role: formData.role,
                    permissions: formData.permissions
                };
                await axios.put(`http://localhost:5000/api/users/${currentUserId}`, updateData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // Create
                await axios.post('http://localhost:5000/api/auth/register-user', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            setShowModal(false);
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || 'Error saving user');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
                        <p className="text-slate-500 mt-1">Manage access for your team members</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add User
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Permissions</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 flex items-center justify-center text-slate-600 font-bold">
                                                    {user.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{user.username}</div>
                                                    <div className="text-sm text-slate-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {user.role === 'admin' ? (
                                                <span className="text-slate-400 italic">Full Access</span>
                                            ) : user.permissions?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {user.permissions.map(p => (
                                                        <span key={p} className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">{p.replace('_', ' ')}</span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 italic">No specific permissions</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(user)} className="text-blue-600 hover:text-blue-900">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-900">{isEditing ? 'Edit User Access' : 'Add New Team Member'}</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {!isEditing && (
                                    <>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-slate-700">Username</label>
                                            <input type="text" name="username" required value={formData.username} onChange={handleInputChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-slate-700">Email</label>
                                            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-sm font-medium text-slate-700">Password</label>
                                            <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    </>
                                )}

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">Role</label>
                                    <select name="role" value={formData.role} onChange={handleInputChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                                        <option value="user">User (Restricted Access)</option>
                                        <option value="admin">Admin (Full Access)</option>
                                    </select>
                                </div>

                                {formData.role === 'user' && (
                                    <div className="pt-2">
                                        <label className="text-sm font-medium text-slate-700 mb-2 block">Permissions</label>
                                        <div className="space-y-2">
                                            {availablePermissions.map(perm => (
                                                <label key={perm.id} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.permissions.includes(perm.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                                        {formData.permissions.includes(perm.id) && <Check className="w-3 h-3 text-white" />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" onChange={() => handlePermissionChange(perm.id)} checked={formData.permissions.includes(perm.id)} />
                                                    <span className="text-sm text-slate-600">{perm.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <button type="submit" className="w-full mt-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md shadow-blue-500/20">
                                    {isEditing ? 'Save Changes' : 'Create User'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserManagement;
