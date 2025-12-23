import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { TrendingUp, FileText, Download, PieChart as PieChartIcon, BarChart as BarChartIcon, Activity, ArrowUpRight, ArrowDownRight, Package, Calendar, MapPin } from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    PieChart,
    Cell,
    Pie,
    Legend
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Reports = () => {
    const reportRef = useRef();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalExpenses: 0,
        fleetValue: 0,
        fuelUsage: 0,
        chemicalExpenses: 0,
        carStatusData: [],
        monthlyData: [],
        fuelByCar: [],
        locationTotals: { Yard: 0, Parking: 0, Showroom: 0 }
    });

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            const [carsRes, fuelRes, chemRes] = await Promise.all([
                api.get('/api/cars'),
                api.get('/api/fuel'),
                api.get('/api/chemicals/orders')
            ]);

            const cars = carsRes.data;
            const fuelLogs = fuelRes.data;
            const chemOrders = chemRes.data;

            // Financials
            const totalRevenue = cars.filter(c => c.status === 'sold').reduce((acc, c) => acc + (c.soldPrice || 0), 0);
            const totalCostPrice = cars.filter(c => c.status === 'sold').reduce((acc, c) => acc + (c.costPrice || 0), 0);
            const totalProfit = totalRevenue - totalCostPrice;

            const fuelExpenses = fuelLogs.reduce((acc, l) => acc + (l.cost || 0), 0);
            const maintenanceExpenses = cars.reduce((acc, car) => {
                return acc + (car.serviceHistory || []).reduce((sAcc, s) => sAcc + (s.cost || 0), 0);
            }, 0);
            const chemicalExpenses = chemOrders.reduce((acc, o) => acc + (o.cost || 0), 0);
            const totalExpenses = fuelExpenses + maintenanceExpenses + chemicalExpenses;

            const fleetValue = cars.filter(c => c.status === 'available' || c.status === 'new').reduce((acc, c) => acc + (c.price || 0), 0);
            const fuelUsage = fuelLogs.reduce((acc, l) => acc + (l.litres || 0), 0);

            // Car Status Distribution for Pie Chart
            const statusCounts = cars.reduce((acc, car) => {
                const s = car.status || 'unknown';
                acc[s] = (acc[s] || 0) + 1;
                return acc;
            }, {});
            const carStatusData = Object.keys(statusCounts).map(status => ({
                name: status.charAt(0).toUpperCase() + status.slice(1),
                value: statusCounts[status]
            }));

            // Real Monthly Trends
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthlyDataMap = {};

            // Initialize last 6 months
            const today = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                const monthName = months[d.getMonth()];
                monthlyDataMap[monthName] = { name: monthName, revenue: 0, expenses: 0, monthIdx: d.getMonth(), year: d.getFullYear() };
            }

            // Fill revenue from sold cars
            cars.forEach(car => {
                if (car.status === 'sold' && car.soldDate) {
                    const d = new Date(car.soldDate);
                    const monthName = months[d.getMonth()];
                    if (monthlyDataMap[monthName]) {
                        monthlyDataMap[monthName].revenue += (car.soldPrice || 0);
                    }
                }
            });

            // Fill expenses from fuel logs
            fuelLogs.forEach(log => {
                const d = new Date(log.date);
                const monthName = months[d.getMonth()];
                if (monthlyDataMap[monthName]) {
                    monthlyDataMap[monthName].expenses += (log.cost || 0);
                }
            });

            // Fill expenses from maintenance
            cars.forEach(car => {
                (car.serviceHistory || []).forEach(service => {
                    const d = new Date(service.date);
                    const monthName = months[d.getMonth()];
                    if (monthlyDataMap[monthName]) {
                        monthlyDataMap[monthName].expenses += (service.cost || 0);
                    }
                });
            });

            // Fill expenses from chemical orders
            chemOrders.forEach(order => {
                const d = new Date(order.date);
                const monthName = months[d.getMonth()];
                if (monthlyDataMap[monthName]) {
                    monthlyDataMap[monthName].expenses += (order.cost || 0);
                }
            });

            // Location Totals
            const locationTotals = cars.reduce((acc, car) => {
                if (car.status === 'available' || car.status === 'new') {
                    const loc = car.location || 'Yard';
                    acc[loc] = (acc[loc] || 0) + 1;
                }
                return acc;
            }, { 'Yard': 0, 'Parking': 0, 'Showroom': 0 });

            const monthlyData = Object.values(monthlyDataMap);

            // Fuel usage by car for Bar Chart
            const fuelByCarMap = fuelLogs.reduce((acc, log) => {
                const rego = log.rego || 'Unknown';
                acc[rego] = (acc[rego] || 0) + (log.litres || 0);
                return acc;
            }, {});
            const fuelByCar = Object.keys(fuelByCarMap).map(rego => ({
                rego,
                litres: fuelByCarMap[rego]
            })).sort((a, b) => b.litres - a.litres).slice(0, 5);

            // Profit by Category
            const categoryProfitMap = cars.filter(c => c.status === 'sold').reduce((acc, car) => {
                const cat = car.category || 'Other';
                const profit = (car.soldPrice || 0) - (car.costPrice || 0);
                acc[cat] = (acc[cat] || 0) + profit;
                return acc;
            }, {});
            const categoryProfitData = Object.keys(categoryProfitMap).map(cat => ({
                name: cat,
                value: categoryProfitMap[cat]
            })).sort((a, b) => b.value - a.value);

            // Insights Logic
            const insights = [];
            if (totalProfit > 0) {
                const topCat = categoryProfitData[0]?.name || 'N/A';
                insights.push({
                    title: 'Profit Performance',
                    text: `Total profit from sales is $${totalProfit.toLocaleString()}. ${topCat} is your most profitable category.`,
                    icon: 'profit'
                });
            }

            const highFuelCar = fuelByCar[0];
            if (highFuelCar) {
                insights.push({
                    title: 'Fuel Consumption Alert',
                    text: `Vehicle ${highFuelCar.rego} has the highest fuel consumption (${highFuelCar.litres.toFixed(1)}L). Consider a service check.`,
                    icon: 'alert'
                });
            }

            if (maintenanceExpenses > (totalExpenses * 0.3)) {
                insights.push({
                    title: 'Maintenance Warning',
                    text: `Maintenance costs account for ${((maintenanceExpenses / totalExpenses) * 100).toFixed(0)}% of total expenses.`,
                    icon: 'warning'
                });
            } else {
                insights.push({
                    title: 'Operational Efficiency',
                    text: 'Maintenance costs are within healthy limits (under 30% of total spend).',
                    icon: 'efficiency'
                });
            }

            setStats({
                totalRevenue,
                totalExpenses,
                fleetValue,
                fuelUsage,
                carStatusData,
                monthlyData,
                fuelByCar,
                totalProfit,
                categoryProfitData,
                insights,
                maintenanceExpenses,
                chemicalExpenses,
                locationTotals
            });
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportPDF = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('Fleetek_Report.pdf');
    };

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

    return (
        <div className="min-h-screen bg-slate-50 pb-12">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Business Analytics</h1>
                        <p className="text-slate-500 mt-1 flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Reporting Period: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                    <button
                        onClick={exportPDF}
                        className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 text-sm font-bold active:scale-95"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF Report
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-white rounded-2xl border border-slate-200"></div>)}
                    </div>
                ) : (
                    <div ref={reportRef} className="space-y-8 bg-slate-50 p-4">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financials</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-slate-400">Net Profit (Sales)</p>
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-2xl font-black text-slate-900">${stats.totalProfit.toLocaleString()}</p>
                                        <span className={`text-xs font-bold ${stats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                                            {stats.totalProfit >= 0 ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                                            {((stats.totalProfit / (stats.totalRevenue || 1)) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-red-50 text-red-600 rounded-lg"><Activity className="w-5 h-5 flip-y" /></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Efficiency</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-slate-400">Total Expenses</p>
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-2xl font-black text-slate-900">${stats.totalExpenses.toLocaleString()}</p>
                                    </div>
                                    <div className="flex mt-1 text-[10px] text-slate-400 font-medium">
                                        <span className="mr-2">Fuel: ${stats.totalExpenses - stats.maintenanceExpenses - stats.chemicalExpenses}</span>
                                        <span className="mr-2">Maint: ${stats.maintenanceExpenses}</span>
                                        <span>Chem: ${stats.chemicalExpenses}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Package className="w-5 h-5" /></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inventory</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-slate-400">Fleet Assets</p>
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-2xl font-black text-slate-900">${stats.fleetValue.toLocaleString()}</p>
                                        <span className="text-xs font-bold text-slate-400">Active</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Activity className="w-5 h-5" /></div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usage</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-semibold text-slate-400">Fuel Consumption</p>
                                    <div className="flex items-baseline space-x-2">
                                        <p className="text-2xl font-black text-slate-900">{stats.fuelUsage.toFixed(1)}L</p>
                                        <span className="text-xs font-bold text-amber-600">Avg: 12.4L/100km</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Location Totals Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Yard</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.locationTotals?.Yard || 0}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Vehicles Present</p>
                                </div>
                                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><MapPin className="w-8 h-8" /></div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Parking</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.locationTotals?.Parking || 0}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Vehicles Present</p>
                                </div>
                                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><MapPin className="w-8 h-8" /></div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">The Garage</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.locationTotals?.Showroom || 0}</p>
                                    <p className="text-[10px] text-slate-400 mt-1 font-bold">Vehicles Present</p>
                                </div>
                                <div className="p-4 bg-green-50 text-green-600 rounded-2xl"><MapPin className="w-8 h-8" /></div>
                            </div>
                        </div>

                        {/* Main Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Revenue vs Expenses Area Chart */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Financial Performance Trend</h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.monthlyData}>
                                            <defs>
                                                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExp)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Fleet Status Pie Chart */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Inventory Status Breakdown</h3>
                                <div className="h-72 w-full flex">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats.carStatusData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats.carStatusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Top Fuel Consumers Bar Chart */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 font-bold">Top Fuel Consuming Vehicles (L)</h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.fuelByCar} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="rego" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }} width={80} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="litres" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Third Row: Profit by Category and Insights */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Profit by Category Bar Chart */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-6">Profit by Vehicle Category ($)</h3>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats.categoryProfitData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 12 }} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} />
                                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Dynamic Business Insights */}
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-3xl shadow-xl text-white">
                                <Activity className="w-10 h-10 mb-6 opacity-80" />
                                <h3 className="text-2xl font-bold mb-4">Business Insights</h3>
                                <div className="space-y-4">
                                    {stats.insights && stats.insights.length > 0 ? stats.insights.map((insight, idx) => (
                                        <div key={idx} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                                            <p className="text-sm font-bold flex items-center">
                                                {insight.icon === 'profit' && <ArrowUpRight className="w-4 h-4 mr-2" />}
                                                {insight.icon === 'alert' && <Activity className="w-4 h-4 mr-2 text-amber-300" />}
                                                {insight.icon === 'warning' && <ArrowDownRight className="w-4 h-4 mr-2 text-red-300" />}
                                                {insight.icon === 'efficiency' && <Package className="w-4 h-4 mr-2 text-emerald-300" />}
                                                {insight.title}
                                            </p>
                                            <p className="text-sm opacity-90 mt-1">{insight.text}</p>
                                        </div>
                                    )) : (
                                        <p className="text-sm opacity-60 italic">Gathering more data to generate insights...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Reports;
