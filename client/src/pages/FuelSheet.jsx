import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Fuel, Plus, Calendar } from 'lucide-react';

const FuelSheet = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        rego: '',
        mvaNumber: '',
        kms: '',
        litres: '',
        cost: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await api.get('/api/fuel');
            setLogs(res.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/fuel', formData);
            setShowModal(false);
            setFormData({
                rego: '',
                mvaNumber: '',
                kms: '',
                litres: '',
                cost: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchLogs();
        } catch (error) {
            alert('Error adding log');
        }
    };

    const calculateMonthlyTotal = () => {
        return logs.reduce((total, log) => total + log.cost, 0);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Fuel Sheet</h1>
                        <p className="text-slate-500 mt-1">Daily fuel logs and consumption tracking</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
                            <span className="text-sm text-slate-500 mr-2">Total Spend:</span>
                            <span className="text-lg font-bold text-slate-900">${calculateMonthlyTotal().toFixed(2)}</span>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Log
                        </button>
                    </div>
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Rego</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">MVA Number</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">KMs</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Litres</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cost</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-100">
                                {logs.map((log) => (
                                    <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {new Date(log.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                            {log.rego}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {log.mvaNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {log.kms.toLocaleString()} km
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                            {log.litres} L
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                                            ${log.cost.toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                                {logs.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                            <Fuel className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                                            <p>No fuel logs recorded yet.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-900">Add Fuel Log</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Date</label>
                                        <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Rego</label>
                                        <input type="text" required value={formData.rego} onChange={e => setFormData({ ...formData, rego: e.target.value })} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700">MVA Number (8 Digits)</label>
                                    <input type="text" maxLength="8" value={formData.mvaNumber} onChange={e => setFormData({ ...formData, mvaNumber: e.target.value })} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">KMs</label>
                                        <input type="number" required value={formData.kms} onChange={e => setFormData({ ...formData, kms: e.target.value })} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Litres</label>
                                        <input type="number" step="0.1" required value={formData.litres} onChange={e => setFormData({ ...formData, litres: e.target.value })} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700">Cost ($)</label>
                                        <input type="number" step="0.01" required value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full mt-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md shadow-blue-500/20">Save Log</button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default FuelSheet;
