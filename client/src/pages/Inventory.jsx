import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../utils/api';
import Navbar from '../components/Navbar';
import { Search, Filter, Droplet, Hash, Gauge, Edit, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Inventory = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isClient = user.role === 'client' || user.role === 'admin';

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const res = await api.get('/api/cars');
            setCars(res.data);
        } catch (error) {
            console.error('Error fetching cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCars = cars.filter(car =>
        car.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
        car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (car.rego && car.rego.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
                        {isClient && (
                            <Link to="/cars/new" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm font-medium shadow-sm">
                                <Plus className="w-4 h-4 mr-1.5" />
                                Add Car
                            </Link>
                        )}
                    </div>

                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                            placeholder="Search make, model, rego..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredCars.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg">No cars found.</p>
                        {isClient && (
                            <Link to="/cars/new" className="text-blue-600 font-medium hover:underline mt-2 inline-block">Add your first car</Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCars.map((car, index) => (
                            <motion.div
                                key={car._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
                            >
                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                    {car.images && car.images.length > 0 ? (
                                        <img src={`${API_BASE_URL}/${car.images[0]}`} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100">
                                            <span className="text-sm">No Image</span>
                                        </div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-semibold text-slate-700 shadow-sm">
                                        {car.status.toUpperCase()}
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{car.year} {car.make} {car.model}</h3>
                                            <p className="text-blue-600 font-bold text-xl">${car.price.toLocaleString()}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-4 text-sm text-slate-600">
                                        <div className="flex items-center">
                                            <Hash className="w-4 h-4 mr-2 text-slate-400" />
                                            <span className="truncate" title={car.rego}>Reg: {car.rego || 'N/A'}</span>
                                        </div>
                                        {car.color && (
                                            <div className="flex items-center">
                                                <Droplet className="w-4 h-4 mr-2 text-slate-400" />
                                                <span>{car.color}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center">
                                            <Gauge className="w-4 h-4 mr-2 text-slate-400" />
                                            <span>{car.kmsDriven?.toLocaleString() || 0} km</span>
                                        </div>
                                        {car.mvaNumber && (
                                            <div className="flex items-center col-span-2">
                                                <span className="text-xs text-slate-400 uppercase tracking-wider mr-2">MVA:</span>
                                                <span className="font-mono bg-slate-100 px-1 rounded">{car.mvaNumber}</span>
                                            </div>
                                        )}
                                    </div>

                                    {isClient && (
                                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end space-x-2">
                                            <Link to={`/cars/${car._id}/edit`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            {/* Delete functionality would go here */}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Inventory;
