import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Circle, ParkingCircle, Car } from 'lucide-react';

const FleetCircle = () => {
    const [stats, setStats] = useState({ yard: 0, parking: 0, total: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Since we don't have a dedicated endpoint for this exact breakdown yet, we can filter client-side or add one.
        // For now, let's fetch all cars and filter.
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const res = await api.get('/api/cars');

            const cars = res.data;
            const yardCount = cars.filter(c => c.location === 'Yard' && c.status === 'available').length;
            const parkingCount = cars.filter(c => c.location === 'Parking' && c.status === 'available').length;

            setStats({
                yard: yardCount,
                parking: parkingCount,
                total: cars.length
            });
        } catch (error) {
            console.error('Error fetching fleet stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Fleet Circle</h1>
                    <p className="text-slate-500 mt-1">Real-time overview of vehicle locations</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Visual Representations */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[400px]">
                        <div className="relative w-64 h-64">
                            {/* Outer Circle (Yard) */}
                            <div className="absolute inset-0 rounded-full border-8 border-blue-100 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="block text-4xl font-bold text-blue-600">{stats.yard}</span>
                                    <span className="text-xs uppercase tracking-wide text-slate-400 font-semibold">In Yard</span>
                                </div>
                            </div>

                            {/* Inner Circle (Parking) - represented as a smaller circle or just stats below */}
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-8 w-full">
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <ParkingCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-slate-900">{stats.parking}</div>
                                <div className="text-sm text-slate-500">Parking Space</div>
                            </div>
                            <div className="text-center p-4 bg-slate-50 rounded-xl">
                                <Circle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-slate-900">{stats.yard}</div>
                                <div className="text-sm text-slate-500">Yard</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats or List */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                            <h3 className="text-lg font-semibold opacity-90">Total Fleet Size</h3>
                            <div className="text-5xl font-bold mt-2">{stats.total}</div>
                            <p className="text-blue-100 mt-2 text-sm">Vehicles currently in system</p>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Space Utilization</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">Yard Capacity</span>
                                        <span className="text-slate-500">{stats.yard} / 50</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min((stats.yard / 50) * 100, 100)}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium text-slate-700">Parking Capacity</span>
                                        <span className="text-slate-500">{stats.parking} / 20</span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((stats.parking / 20) * 100, 100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default FleetCircle;
