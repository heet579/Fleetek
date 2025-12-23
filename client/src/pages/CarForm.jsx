import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Save, X, ArrowLeft } from 'lucide-react';

const CarForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        price: '',
        rego: '',
        mvaNumber: '',
        kmsDriven: '',
        color: '',
        fuelType: 'Petrol',
        transmission: 'Automatic',
        description: '',
        status: 'available',
        costPrice: '',
        vendor: '',
        category: 'Sedan',
        engineNumber: ''
    });

    useEffect(() => {
        if (isEdit) {
            fetchCar();
        }
    }, [id]);

    const fetchCar = async () => {
        try {
            const res = await api.get(`/api/cars/${id}`);
            setFormData(res.data);
        } catch (error) {
            console.error('Error fetching car:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isEdit) {
                await api.put(`/api/cars/${id}`, formData);
            } else {
                await api.post('/api/cars', formData);
            }
            navigate('/');
        } catch (error) {
            console.error('Error saving car:', error);
            alert(error.response?.data?.message || 'Error saving car');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <button onClick={() => navigate('/')} className="flex items-center text-slate-500 hover:text-slate-900 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </button>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="border-b border-slate-100 px-8 py-5 flex justify-between items-center bg-slate-50/50">
                        <h1 className="text-xl font-bold text-slate-800">{isEdit ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Make *</label>
                                <input type="text" name="make" required value={formData.make} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Model *</label>
                                <input type="text" name="model" required value={formData.model} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Year *</label>
                                <input type="number" name="year" required value={formData.year} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">Price ($) *</label>
                                <input type="number" name="price" required value={formData.price} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Vehicle Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Registration Number (Rego) *</label>
                                    <input type="text" name="rego" required value={formData.rego} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="e.g. ABC-123" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Color</label>
                                    <input type="text" name="color" value={formData.color} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Kilometers Driven *</label>
                                    <input type="number" name="kmsDriven" required value={formData.kmsDriven} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">MVA Number</label>
                                    <input type="text" name="mvaNumber" value={formData.mvaNumber} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Fuel Type</label>
                                    <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                                        <option value="Petrol">Petrol</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Electric">Electric</option>
                                        <option value="Hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Transmission</label>
                                    <select name="transmission" value={formData.transmission} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                                        <option value="Automatic">Automatic</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Status</label>
                                    <select name="status" value={formData.status} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                                        <option value="available">Available</option>
                                        <option value="sold">Sold</option>
                                        <option value="reserved">Reserved</option>
                                        <option value="service">Service</option>
                                        <option value="rental">Rental</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-6">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Financial & Tracking</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Cost Price (Acquisition) *</label>
                                    <input type="number" name="costPrice" required value={formData.costPrice} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Vendor / Seller</label>
                                    <input type="text" name="vendor" value={formData.vendor} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="e.g. John Doe Auction" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Category</label>
                                    <select name="category" value={formData.category} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all">
                                        <option value="Sedan">Sedan</option>
                                        <option value="SUV">SUV</option>
                                        <option value="Hatchback">Hatchback</option>
                                        <option value="Truck">Truck</option>
                                        <option value="Luxury">Luxury</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">Engine Number</label>
                                    <input type="text" name="engineNumber" value={formData.engineNumber} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">Description</label>
                            <textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"></textarea>
                        </div>

                        <div className="pt-6 flex justify-end space-x-3">
                            <button type="button" onClick={() => navigate('/')} className="px-6 py-2 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors">Cancel</button>
                            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors shadow-sm shadow-blue-500/30 flex items-center">
                                <Save className="w-4 h-4 mr-2" /> {loading ? 'Saving...' : 'Save Vehicle'}
                            </button>
                        </div>

                    </form>
                </div>
            </main>
        </div>
    );
};

export default CarForm;
