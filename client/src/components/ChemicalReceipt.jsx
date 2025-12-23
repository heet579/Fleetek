import React, { forwardRef } from 'react';
import { Car, Clock, Hash, DollarSign, Package, CheckCircle } from 'lucide-react';

const ChemicalReceipt = forwardRef(({ order }, ref) => {
    if (!order) return null;

    return (
        <div ref={ref} className="bg-white p-12 max-w-2xl mx-auto border border-slate-200 text-slate-900 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-8 mb-8">
                <div>
                    <div className="flex items-center mb-2">
                        <div className="bg-blue-600 rounded-lg p-2 mr-3">
                            <Car className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-3xl font-black tracking-tight">Flee<span className="text-blue-600">Tek</span></span>
                    </div>
                    <p className="text-sm text-slate-500 font-bold tracking-widest uppercase">Professional Fleet Management</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black uppercase text-slate-900">Delivery Receipt</h2>
                    <p className="text-sm text-slate-500">Order ID: #{order._id?.slice(-8).toUpperCase()}</p>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Supplier (Dealer)</p>
                        <p className="text-lg font-bold">{order.dealer?.username}</p>
                        <p className="text-sm text-slate-500">{order.dealer?.email}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Delivery Date</p>
                        <p className="text-lg font-bold">{new Date(order.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 border-t border-slate-100 pt-6">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>
                        <p className="text-md font-bold">{order.location || 'Wingfield Warehouse'}</p>
                    </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <th className="text-left pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Description</th>
                                <th className="text-right pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Qty</th>
                                <th className="text-right pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Cost</th>
                                <th className="text-right pb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-6">
                                    <p className="font-bold text-lg text-slate-900">{order.chemical?.name}</p>
                                    <p className="text-sm text-slate-500">{order.chemical?.description}</p>
                                </td>
                                <td className="py-6 text-right font-bold">{order.quantity} {order.chemical?.unit}</td>
                                <td className="py-6 text-right font-bold">${(order.cost / order.quantity).toFixed(2)}</td>
                                <td className="py-6 text-right font-bold text-blue-600">${order.cost.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="border-t-2 border-slate-900 pt-8 mt-12">
                    <div className="flex justify-between items-center">
                        <div className={`flex items-center ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.paymentStatus === 'paid' ? <CheckCircle className="w-5 h-5 mr-2" /> : <Clock className="w-5 h-5 mr-2" />}
                            <span className="font-bold uppercase tracking-widest text-xs">
                                {order.paymentStatus === 'paid' ? 'Payment Received / Delivered' : 'Payment Pending / Processing'}
                            </span>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grand Total</p>
                            <p className="text-4xl font-black text-slate-900">${order.cost.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center border-t border-slate-100 pt-8">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Automated Record by FleeTek Digital Inventory System</p>
            </div>
        </div>
    );
});

export default ChemicalReceipt;
