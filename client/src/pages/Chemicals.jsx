import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Package, Plus, History, DollarSign, Download, ExternalLink, X, Droplet, Clock, User, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ChemicalReceipt from '../components/ChemicalReceipt';

const Chemicals = () => {
    const [chemicals, setChemicals] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const receiptRef = useRef();

    const userBuffer = localStorage.getItem('user');
    const user = userBuffer ? JSON.parse(userBuffer) : {};
    const isDealer = user.role === 'dealer';
    const isAdmin = user.role === 'admin' || user.role === 'client';

    const [formData, setFormData] = useState({
        chemicalId: '',
        quantity: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
        paymentStatus: 'pending',
        location: 'Wingfield'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [chemRes, orderRes] = await Promise.all([
                api.get('/api/chemicals'),
                api.get('/api/chemicals/orders')
            ]);
            setChemicals(chemRes.data);
            setOrders(orderRes.data);
        } catch (error) {
            console.error('Error fetching chemicals data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await api.patch(`/api/chemicals/orders/${orderId}`, { paymentStatus: newStatus });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update payment status');
        }
    };

    const handleDownloadReceipt = async (order) => {
        setSelectedOrder(order);
        // Wait for state to update and component to render (simplified here for brevity)
        setTimeout(async () => {
            const element = receiptRef.current;
            const canvas = await html2canvas(element, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`FleeTek_Receipt_${order._id?.slice(-6)}.pdf`);
            setSelectedOrder(null);
        }, 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/api/chemicals/orders', formData);
            setShowModal(false);
            fetchData();
        } catch (error) {
            console.error('Error posting order:', error);
            alert('Failed to save delivery');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Chemical Management</h1>
                        <p className="text-slate-500 mt-1">
                            {isDealer ? 'Log your deliveries and view history' : 'Monitor stock and supply history'}
                        </p>
                    </div>
                    {(isDealer || isAdmin) && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm font-medium"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Record Delivery
                        </button>
                    )}
                </div>

                {!isDealer && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {chemicals.map(chem => (
                            <div key={chem._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Droplet className="w-5 h-5" />
                                    </div>
                                    <h3 className="font-bold text-slate-900">{chem.name}</h3>
                                </div>
                                <p className="text-3xl font-black text-slate-900">{chem.currentStock} <span className="text-sm font-bold text-slate-400 capitalize">{chem.unit}</span></p>
                                <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full" style={{ width: `${Math.min((chem.currentStock / 100) * 100, 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center">
                            <History className="w-4 h-4 mr-2 text-slate-400" />
                            Delivery History
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Item</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Quantity</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Cost</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Payment</th>
                                    {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Dealer</th>}
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Receipt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {orders.map(order => (
                                    <tr key={order._id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                            {new Date(order.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-slate-900">{order.chemical?.name || 'Deleted Chemical'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                            {order.quantity} {order.chemical?.unit}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-blue-600">${order.cost.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-slate-500">
                                            {order.location}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.paymentStatus === 'paid'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {order.paymentStatus || 'pending'}
                                                </span>
                                                {isAdmin && order.paymentStatus === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(order._id, 'paid')}
                                                        className="px-2 py-1 text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg uppercase tracking-tighter"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        {isAdmin && (
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center mr-2">
                                                        <User className="w-3 h-3 text-slate-400" />
                                                    </div>
                                                    <span className="text-sm text-slate-600">{order.dealer?.username}</span>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDownloadReceipt(order)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Download Receipt"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-slate-400 italic">
                                            No delivery records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-900">Record New Delivery</h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Chemical Item</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.chemicalId}
                                    onChange={e => setFormData({ ...formData, chemicalId: e.target.value })}
                                >
                                    <option value="">Select chemical...</option>
                                    {chemicals.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} ({c.unit})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.quantity}
                                        onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-700 block mb-1">Total Cost ($)</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        value={formData.cost}
                                        onChange={e => setFormData({ ...formData, cost: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Delivery Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Delivery Location</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                >
                                    <option value="Wingfield">Wingfield</option>
                                    <option value="Airport">Airport</option>
                                    <option value="City">City</option>
                                    <option value="Klemzig">Klemzig</option>
                                    <option value="Salisbury">Salisbury</option>
                                    <option value="Marleston">Marleston</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700 block mb-1">Payment Status</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.paymentStatus}
                                    onChange={e => setFormData({ ...formData, paymentStatus: e.target.value })}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="paid">Paid / Done</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium shadow-md shadow-blue-500/20">
                                Save Delivery
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Hidden Receipt for jsPDF */}
            <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
                {selectedOrder && <ChemicalReceipt ref={receiptRef} order={selectedOrder} />}
            </div>
        </div>
    );
};

export default Chemicals;
