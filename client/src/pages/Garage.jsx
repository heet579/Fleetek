import React, { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../utils/api';
import Navbar from '../components/Navbar';
import { Wrench, Sparkles, Tag, AlertTriangle, X, DollarSign, Calendar, Save, Plus, Key } from 'lucide-react';

const Garage = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('new'); // new, service, sales, out
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(null); // 'service', 'sell', 'out'
    const [selectedCar, setSelectedCar] = useState(null);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        rego: '',
        kmsDriven: '',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        status: 'available',
        location: 'Yard',
        customerName: '',
        destination: 'Airport',
        plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchCars();
    }, []);

    const fetchCars = async () => {
        try {
            const res = await api.get('/api/cars');
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
        if (type === 'add') {
            setFormData({
                make: '',
                model: '',
                year: new Date().getFullYear(),
                price: '',
                rego: '',
                kmsDriven: '',
                fuelType: 'Petrol',
                transmission: 'Automatic',
                status: 'available',
                location: 'Yard'
            });
        } else if (type === 'rental') {
            setFormData({
                customerName: '',
                destination: 'Airport',
                plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            });
        } else {
            setFormData({});
        }
        setShowModal(true);
    };

    const handleQuickStatusChange = async (car, newStatus) => {
        try {
            await api.put(`/api/cars/${car._id}`, { status: newStatus, maintenanceNotes: '' });
            fetchCars();
        } catch (error) {
            console.error('Error updating status:', error);
        }
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

            if (modalType === 'add') {
                await api.post('/api/cars', formData);
            } else {
                if (modalType === 'service') {
                    const newHistory = [...(selectedCar.serviceHistory || []), {
                        date: new Date(),
                        kms: formData.kms,
                        description: formData.description,
                        cost: formData.cost
                    }];
                    updatePayload = { status: 'service', serviceHistory: newHistory };
                } else if (modalType === 'rental') {
                    await api.post('/api/rentals', {
                        carId: selectedCar._id,
                        customerName: formData.customerName,
                        destination: formData.destination,
                        plannedEndDate: formData.plannedEndDate
                    });
                    // rentals route handles car status update too
                    setShowModal(false);
                    fetchCars();
                    return;
                }
                await api.put(`/api/cars/${selectedCar._id}`, updatePayload);
            }

            setShowModal(false);
            fetchCars();
        } catch (error) {
            console.error('Error updating car:', error);
            alert('Failed to update car');
        }
    };

    const getFilteredCars = () => {
        switch (activeTab) {
            case 'new': return cars.filter(c => c.status === 'available' || c.status === 'new');
            case 'service': return cars.filter(c => c.status === 'service');
            case 'sales': return cars.filter(c => c.status === 'sold');
            case 'rental': return cars.filter(c => c.status === 'rental');
            case 'out': return cars.filter(c => c.status === 'service' && c.maintenanceNotes); // Only cars specifically flagged with issues
            default: return cars;
        }
    };

    const tabs = [
        { id: 'new', label: 'In Garage', icon: Sparkles },
        { id: 'rental', label: 'Current Rentals', icon: Key },
        { id: 'service', label: 'In Service', icon: Wrench },
        { id: 'sales', label: 'Sales / Sold', icon: Tag },
        { id: 'out', label: 'Needs Attention', icon: AlertTriangle },
    ];

    const filteredCars = getFilteredCars();

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">The Garage</h1>
                        <p className="text-slate-500 mt-1">Manage workshop and inventory status</p>
                    </div>
                    <button
                        onClick={() => handleAction(null, 'add')}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Vehicle
                    </button>
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
                                        <img src={`${API_BASE_URL}/${car.images[0]}`} alt={car.model} className="w-full h-full object-cover" />
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
                                            <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-2">
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
                                        {activeTab === 'sales' && (
                                            <button onClick={() => handleQuickStatusChange(car, 'available')} className="w-full py-2 text-xs font-bold text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all border border-dashed border-slate-200 hover:border-blue-200">
                                                Re-list Car (Back to Yard)
                                            </button>
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
                                        {activeTab === 'service' && (
                                            <button onClick={() => handleQuickStatusChange(car, 'available')} className="flex-1 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm">
                                                Service Done
                                            </button>
                                        )}
                                        {activeTab === 'out' && (
                                            <>
                                                <button onClick={() => handleQuickStatusChange(car, 'available')} className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                                                    Resolved & Available
                                                </button>
                                                <button onClick={() => handleAction(car, 'service')} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-200">
                                                    Move to Service
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'new' && (
                                            <>
                                                <button onClick={() => handleAction(car, 'sell')} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors border border-slate-200 hover:border-green-200">
                                                    Mark Sold
                                                </button>
                                                <button onClick={() => handleAction(car, 'service')} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 hover:border-blue-200">
                                                    Service
                                                </button>
                                                <button onClick={() => handleAction(car, 'rental')} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors border border-slate-200 hover:border-amber-200">
                                                    Start Rental
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'service' && (
                                            <>
                                                <button onClick={() => handleQuickStatusChange(car, 'available')} className="flex-1 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm">
                                                    Work Done & Available
                                                </button>
                                                <button onClick={() => handleAction(car, 'rental')} className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors border border-slate-200 hover:border-amber-200">
                                                    Ready for Rental
                                                </button>
                                            </>
                                        )}
                                        {activeTab === 'rental' && (
                                            <button onClick={() => handleQuickStatusChange(car, 'available')} className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                                                Return to Garage
                                            </button>
                                        )}
                                        {(activeTab === 'new' || activeTab === 'service') && (
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
                                    {modalType === 'add' && 'Add New Vehicle'}
                                    {modalType === 'service' && 'Log Service Entry'}
                                    {modalType === 'sell' && 'Record Sale'}
                                    {modalType === 'out' && 'Report Issue'}
                                    {modalType === 'rental' && 'Start New Rental'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">

                                {modalType === 'add' && (
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1">Make</label>
                                                <input type="text" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1">Model</label>
                                                <input type="text" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1">Year</label>
                                                <input type="number" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-slate-700 block mb-1">Price ($)</label>
                                                <input type="number" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Registration (Rego)</label>
                                            <input type="text" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.rego} onChange={e => setFormData({ ...formData, rego: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">KMs Driven</label>
                                            <input type="number" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.kmsDriven} onChange={e => setFormData({ ...formData, kmsDriven: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Current Status</label>
                                            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                                <option value="available">Available (Yard)</option>
                                                <option value="new">New (Showroom)</option>
                                                <option value="service">In Service</option>
                                            </select>
                                        </div>
                                    </div>
                                )}

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

                                {modalType === 'rental' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Customer Name</label>
                                            <input type="text" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.customerName} onChange={e => setFormData({ ...formData, customerName: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Destination</label>
                                            <select className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })}>
                                                <option value="Airport">Airport</option>
                                                <option value="City">City</option>
                                                <option value="Klemzig">Klemzig</option>
                                                <option value="Salisbury">Salisbury</option>
                                                <option value="Wingfield">Wingfield</option>
                                                <option value="Marleston">Marleston</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-slate-700 block mb-1">Planned Return Date</label>
                                            <input type="date" required className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                                value={formData.plannedEndDate} onChange={e => setFormData({ ...formData, plannedEndDate: e.target.value })} />
                                        </div>
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
