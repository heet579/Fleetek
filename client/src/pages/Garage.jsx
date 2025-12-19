import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Wrench, Sparkles, Tag, AlertTriangle, X, DollarSign, Calendar, Save } from 'lucide-react';

const Garage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('new'); // new, service, sales, out
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); // 'service', 'sell', 'out'
    const [selectedCar, setSelectedCar] = useState(null);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/cars', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCars(res.data);
        } catch (error) {
            console.error('Error fetching garage cars:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = (car, type) => {
        setSelectedCar(car);
        setModalType(type);
        setFormData({}); // Reset form
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            let updatePayload = { ...formData };

            if (modalType === 'service') {
                updatePayload = {
                    status: 'service',
                    $push: {
                        serviceHistory: {
                            date: new Date(),
                            kms: formData.kms,
                            description: formData.description,
                            cost: formData.cost
                        }
                    }
                };
            } else if (modalType === 'sell') {
                updatePayload = {
                    status: 'sold',
                    location: 'Showroom', // or where sold cars go logic
                    soldPrice: formData.soldPrice,
                    soldDate: new Date()
                };
            } else if (modalType === 'out') {
                updatePayload = {
                    status: 'yard', // 'yard' but with out of service logic or specific status 'out_of_service' if added to enum. 
                    // User plan said status: 'service' for out? Or I should use 'yard' + notes?
                    // Let's assume 'service' or 'yard' with notes. 
                    // Actually, looking at previous enum update, we have 'available', 'sold', 'reserved', 'service', 'new', 'yard'.
                    // Let's use 'service' for mechanic, and maybe 'yard' with notes for 'Out of Service' or just 'service' with big notes?
                    // User request: "out of service what does it need attention to".
                    // I'll map 'out' tab to cars in 'yard' or 'service' that have maintenanceNotes? 
                    // Let's use status 'service' for now for simplicity as "Out of Service" usually implies maintenance.
                    // Or better, let's use 'service' for active service, and 'yard' for sitting there broken?
                    // Let's stick to status: 'service' for capturing attention needed.
                    status: 'service',
                    maintenanceNotes: formData.maintenanceNotes
                };
            }

            // Note: $push for serviceHistory won't work with simple findByIdAndUpdate body spread in generic route.
            // The route does `req.body`, so I need to send the full array or modify backend.
            // The backend route uses `findByIdAndUpdate(id, req.body)`. `req.body` containing `$push` is not standard for simple updates unless using specific Mongo commands which `findByIdAndUpdate` supports IF the body IS the command object.
            // However, usually we send the new state. 
            // Let's be safe and fetch-modify-save OR assume the generic route accepts mongo operators (it does if passed directly).
            // But standard REST PUT usually replaces fields.
            // Let's try sending the operator. If it fails, I'll need to fetch current, push to array, and send back array.

            // Actually, simpler approach for this generic backend:
            // 1. If service, I will fetch existing car, add to array, and send full array back.
            // Wait, I have `selectedCar`. I can just append to its serviceHistory.

            if (modalType === 'service') {
                const newHistory = [...(selectedCar.serviceHistory || []), {
                    date: new Date(),
                    kms: formData.kms,
                    description: formData.description,
                    cost: formData.cost
                }];
                updatePayload = { status: 'service', serviceHistory: newHistory };
            }

            await axios.put(`http://localhost:5000/api/cars/${selectedCar._id}`, updatePayload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowModal(false);
            fetchCars();
        } catch (error) {
            console.error('Error updating car:', error);
            alert('Failed to update car');
        }
    };

    const getFilteredCars = () => {
        switch (activeTab) {
            case 'new': return cars.filter(c => c.status === 'new' || (c.status === 'available' && c.location === 'Showroom'));
            case 'service': return cars.filter(c => c.status === 'service' && !c.maintenanceNotes); // Active service
            case 'sales': return cars.filter(c => c.status === 'sold');
            case 'out': return cars.filter(c => c.maintenanceNotes); // Cars with issues notes
            default: return cars;
        }
    };

    const tabs = [
        { id: 'new', label: 'New / Available', icon: Sparkles },
        { id: 'service', label: 'In Service', icon: Wrench },
        { id: 'sales', label: 'Sales / Sold', icon: Tag },
        { id: 'out', label: 'Needs Attention', icon: AlertTriangle },
    ];

    const filteredCars = getFilteredCars();

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">The Garage</h1>
                    <p className="text-slate-500 mt-1">Manage workshop and inventory status</p>
                </div>

                {/* Tabs, same as before */}
                <div className="flex space-x-2 mb-8 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            <tab.icon className="w-4 h-4 mr-2" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center mt-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCars.map(car => (
                            <div key={car._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="h-48 bg-slate-200 relative overflow-hidden">
                                    {car.images?.[0] ? (
                                        <img src={`http://localhost:5000/${car.images[0]}`} alt={car.model} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-slate-400 bg-slate-100">
                                            <Wrench className="w-12 h-12 opacity-20" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-white/90 backdrop-blur rounded text-xs font-bold uppercase tracking-wide shadow-sm text-slate-700">
                                        {car.status}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="font-bold text-slate-900 text-lg">{car.year} {car.make} {car.model}</h3>
                                    <p className="text-sm text-slate-500">{car.rego}</p>

                                    {/* Tab specific details */}
                                    <div className="mt-4 flex-1">
                                        {activeTab === 'sales' && car.soldPrice && (
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                                                <div className="flex justify-between text-sm mb-1">
                                                    <span className="text-green-700">Sold Price:</span>
                                                    <span className="font-bold text-green-700">${car.soldPrice.toLocaleString()}</span>
                                                </div>
                                                {car.costPrice && (
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-green-600">Profit:</span>
                                                        <span className="font-bold text-green-600">+${(car.soldPrice - car.costPrice).toLocaleString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'out' && car.maintenanceNotes && (
                                            <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                                                <p className="text-xs font-bold text-red-800 uppercase mb-1">Needs Attention</p>
                                                <p className="text-sm text-red-700">{car.maintenanceNotes}</p>
                                            </div>
                                        )}

                                        {activeTab === 'service' && car.serviceHistory?.length > 0 && (
                                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                                <p className="text-xs font-bold text-blue-800 uppercase mb-1">Latest Service</p>
                                                <p className="text-sm text-blue-700 truncate">{car.serviceHistory[car.serviceHistory.length - 1].description}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-100 mt-4 pt-4 flex gap-2">
                                        {activeTab !== 'sales' && (
                                            <button onClick={() => handleAction(car, 'sell')} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors border border-slate-200 hover:border-green-200">
                                                Mark Sold
                                            </button>
                                        )}
                                        {activeTab !== 'service' && activeTab !== 'sales' && (
                                            <button onClick={() => handleAction(car, 'service')} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-blue-200">
                                                Service
                                            </button>
                                        )}
                                        {activeTab !== 'out' && activeTab !== 'sales' && (
                                            <button onClick={() => handleAction(car, 'out')} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors border border-slate-200 hover:border-red-200">
                                                Report Issue
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Single Modal for all actions */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="text-lg font-bold text-slate-900">
                                    {modalType === 'service' && 'Log Service Entry'}
                                    {modalType === 'sell' && 'Record Sale'}
                                    {modalType === 'out' && 'Report Issue'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">

                                {modalType === 'service' && (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Odometer (kms)</label>
                                            <input type="number" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={e => setFormData({ ...formData, kms: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Description of Work</label>
                                            <textarea required rows="3" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Cost ($)</label>
                                            <input type="number" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {modalType === 'sell' && (
                                    <>
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-4">
                                            <p className="text-sm text-slate-500">Acquisition Cost</p>
                                            <p className="text-xl font-bold text-slate-900">${selectedCar.costPrice?.toLocaleString() || '0'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Sold Price ($)</label>
                                            <input type="number" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                onChange={e => setFormData({ ...formData, soldPrice: e.target.value })} />
                                        </div>
                                    </>
                                )}

                                {modalType === 'out' && (
                                    <div>
                                        <label className="text-sm font-medium text-slate-700 block mb-1">What needs attention?</label>
                                        <textarea required rows="4" className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="e.g., Engine light on, flat tyre..."
                                            onChange={e => setFormData({ ...formData, maintenanceNotes: e.target.value })}></textarea>
                                    </div>
                                )}

                                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md shadow-blue-500/20">
                                    Save Record
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Garage;
