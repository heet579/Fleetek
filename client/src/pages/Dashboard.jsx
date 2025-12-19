import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Car, Fuel, Circle, Wrench, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        carsInYard: 0,
        carsInParking: 0,
        fuelCostToday: 0,
        fuelCostMonth: 0,
        totalCars: 0
    });
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'admin';

    useEffect(() => {
        if (isAdmin) {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const [carsRes, fuelRes] = await Promise.all([
                axios.get('http://localhost:5000/api/cars', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:5000/api/fuel', { headers: { Authorization: `Bearer ${token}` } })
            ]);

            const cars = carsRes.data;
            const fuelLogs = fuelRes.data;

            // Car Stats
            const carsInYard = cars.filter(c => c.location === 'Yard' && c.status === 'available').length;
            const carsInParking = cars.filter(c => c.location === 'Parking' && c.status === 'available').length;

            // Fuel Stats
            const today = new Date().toISOString().split('T')[0];
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();

            const todaysLogs = fuelLogs.filter(log => log.date.startsWith(today));
            const monthsLogs = fuelLogs.filter(log => {
                const logDate = new Date(log.date);
                return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
            });

            const fuelCostToday = todaysLogs.reduce((acc, log) => acc + log.cost, 0);
            const fuelCostMonth = monthsLogs.reduce((acc, log) => acc + log.cost, 0);

            setStats({
                carsInYard,
                carsInParking,
                fuelCostToday,
                fuelCostMonth,
                totalCars: cars.length
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const modules = [
        { title: 'Inventory', icon: Car, link: '/inventory', color: 'bg-blue-500', desc: 'Manage your entire fleet' },
        { title: 'The Garage', icon: Wrench, link: '/garage', color: 'bg-orange-500', desc: 'Service & Maintenance status' },
        { title: 'Fuel Sheet', icon: Fuel, link: '/fuel-sheet', color: 'bg-green-500', desc: 'Track daily fuel consumption' },
        { title: 'Fleet Circle', icon: Circle, link: '/fleet-circle', color: 'bg-purple-500', desc: 'Visual location overview' },
    ];

    if (isAdmin) {
        modules.push({ title: 'User Access', icon: Users, link: '/users', color: 'bg-slate-600', desc: 'Manage team permissions' });
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.username}</h1>
                    <p className="text-slate-500 mt-2">Here is your daily overview.</p>
                </div>

                {/* Admin Reports Section */}
                {isAdmin && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                            Daily Admin Report
                        </h2>

                        {loading ? (
                            <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <p className="text-sm font-medium text-slate-500">Today's Fuel Spend</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-2">${stats.fuelCostToday.toFixed(2)}</p>
                                    <div className="mt-2 text-xs text-green-600 flex items-center">
                                        Updated just now
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <p className="text-sm font-medium text-slate-500">Monthly Fuel (Running)</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-2">${stats.fuelCostMonth.toFixed(2)}</p>
                                    <div className="mt-2 text-xs text-slate-400">
                                        Current Month
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <p className="text-sm font-medium text-slate-500">Yard Status</p>
                                    <div className="flex items-end mt-2">
                                        <p className="text-2xl font-bold text-blue-600">{stats.carsInYard}</p>
                                        <span className="text-sm text-slate-400 mb-1 ml-2">Available cars</span>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                    <p className="text-sm font-medium text-slate-500">Parking Space Status</p>
                                    <div className="flex items-end mt-2">
                                        <p className="text-2xl font-bold text-green-600">{stats.carsInParking}</p>
                                        <span className="text-sm text-slate-400 mb-1 ml-2">Available cars</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Modules Grid */}
                <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Quick Access
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {modules.map((mod, idx) => (
                            <Link
                                key={idx}
                                to={mod.link}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300 group"
                            >
                                <div className={`${mod.color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                                    <mod.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{mod.title}</h3>
                                <p className="text-sm text-slate-500 mt-2">{mod.desc}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
