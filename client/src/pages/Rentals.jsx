import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Key, Calendar, MapPin, User, Clock, CheckCircle, X, Plus, Search, ChevronRight, History } from 'lucide-react';

const Rentals = () => {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('active'); // active, completed, all

    useEffect(() => {
        fetchRentals();
    }, []);

    const fetchRentals = async () => {
        try {
            const res = await api.get('/api/rentals');
            setRentals(res.data);
        } catch (error) {
            console.error('Error fetching rentals:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReturn = async (id) => {
        if (!window.confirm('Mark this vehicle as returned?')) return;
        try {
            await api.patch(`/api/rentals/${id}/return`);
            fetchRentals();
        } catch (error) {
            console.error('Error returning car:', error);
            alert('Failed to process return');
        }
    };

    const filteredRentals = rentals.filter(r => {
        if (filter === 'all') return true;
        return r.status === filter;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Rental Tracking</h1>
                        <p className="text-slate-500 mt-1">Manage vehicle assignments and trip durations</p>
                    </div>

                    <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
                        {['active', 'completed', 'all'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filter === t
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-slate-500 hover:bg-slate-50'
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-white rounded-3xl border border-slate-200"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRentals.map(rental => (
                            <div key={rental._id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-blue-50 p-2 rounded-xl">
                                            <Key className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(rental.status)}`}>
                                            {rental.status}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                                        {rental.car?.make} {rental.car?.model}
                                    </h3>
                                    <p className="text-sm font-bold text-slate-400 mb-4">{rental.car?.rego}</p>

                                    <div className="space-y-3 border-t border-slate-50 pt-4">
                                        <div className="flex items-center text-sm font-medium text-slate-600">
                                            <User className="w-4 h-4 mr-3 text-slate-400" />
                                            {rental.customerName}
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-slate-600">
                                            <MapPin className="w-4 h-4 mr-3 text-slate-400" />
                                            {rental.destination}
                                        </div>
                                        <div className="flex items-center text-sm font-medium text-slate-600">
                                            <Clock className="w-4 h-4 mr-3 text-slate-400" />
                                            {new Date(rental.startDate).toLocaleDateString()}
                                            <ChevronRight className="w-3 h-3 mx-2" />
                                            {rental.actualReturnDate
                                                ? new Date(rental.actualReturnDate).toLocaleDateString()
                                                : new Date(rental.plannedEndDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {rental.status === 'active' && (
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                                        <button
                                            onClick={() => handleReturn(rental._id)}
                                            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors text-sm font-bold shadow-sm"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Process Return
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredRentals.length === 0 && (
                            <div className="col-span-full py-20 text-center">
                                <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <History className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">No rentals found</h3>
                                <p className="text-slate-500">There are no {filter !== 'all' ? filter : ''} rental records to display.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Rentals;
