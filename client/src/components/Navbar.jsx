import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, LogOut, Users, Plus, LayoutDashboard } from 'lucide-react';
import api from '../utils/api';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const role = user.role;
    const isAdmin = role === 'admin' || role === 'client';

    useEffect(() => {
        syncProfile();
    }, [location.pathname]); // Sync on navigation to reflect immediate permission changes

    const syncProfile = async () => {
        try {
            const res = await api.get('/api/auth/profile');
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
        } catch (error) {
            console.error('Failed to sync profile', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const hasPermission = (p) => {
        if (isAdmin || user.permissions?.includes('all')) return true;
        return user.permissions?.includes(p);
    };

    const getLinkClass = (path) => {
        const baseClass = "px-3 py-2 rounded-lg transition-colors text-sm font-medium";
        return location.pathname === path
            ? `${baseClass} bg-blue-100 text-blue-700`
            : `${baseClass} text-slate-500 hover:bg-slate-100`;
    };

    const navLinks = [
        { label: 'Inventory', path: '/inventory', permission: 'manage_inventory' },
        { label: 'Garage', path: '/garage', permission: 'manage_garage' },
        { label: 'Fleet Circle', path: '/fleet-circle', permission: 'view_fleet' },
        { label: 'Fuel Sheet', path: '/fuel-sheet', permission: 'manage_fuel' },
        { label: 'Chemicals', path: '/chemicals', permission: 'manage_chemicals' },
        { label: 'Rentals', path: '/rentals', permission: 'manage_garage' },
    ];

    return (
        <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center group">
                            <div className="bg-blue-600 rounded-lg p-2 mr-3 group-hover:bg-blue-700 transition-colors">
                                <Car className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-800 tracking-tight">Flee<span className="text-blue-600">Tek</span></span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-2 md:space-x-4">
                        {hasPermission('manage_inventory') && (
                            <Link to="/cars/new" className="hidden md:flex px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors items-center text-sm font-medium shadow-sm hover:shadow">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Car
                            </Link>
                        )}

                        {navLinks.filter(link => hasPermission(link.permission)).map(link => (
                            <Link key={link.path} to={link.path} className={getLinkClass(link.path)}>{link.label}</Link>
                        ))}

                        {isAdmin && (
                            <Link to="/users" className={`p-2 rounded-lg transition-colors ${location.pathname === '/users' ? 'bg-blue-100 text-blue-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Manage Users">
                                <Users className="w-5 h-5" />
                            </Link>
                        )}

                        <div className="flex items-center border-l border-slate-200 pl-4 ml-4">
                            <div className="flex flex-col text-right mr-3 hidden lg:flex">
                                <span className="text-sm font-medium text-slate-900 leading-none mb-1">{user.username}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{role}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
