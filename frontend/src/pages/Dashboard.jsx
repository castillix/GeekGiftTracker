import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRequest, getRequests } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ChevronRight, Calendar, User, Search, Trash2 } from 'lucide-react';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [showCompleted, setShowCompleted] = useState(false);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await getRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            await deleteRequest(id);
            setRequests(requests.filter(r => r.id !== id));
        } catch (error) {
            console.error("Failed to delete request", error);
            alert("Failed to delete request");
        }
    };

    const filteredRequests = requests.filter(r => {
        const matchesFilter = r.recipient_name.toLowerCase().includes(filter.toLowerCase()) ||
            r.technician?.toLowerCase().includes(filter.toLowerCase());
        const matchesStatus = showCompleted ? true : r.status !== 'completed';
        return matchesFilter && matchesStatus;
    });

    if (loading) return <div className="p-8 text-center text-slate-500">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Request Dashboard</h1>
                <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showCompleted}
                            onChange={(e) => setShowCompleted(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        Show Completed
                    </label>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Technician</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredRequests.map((request) => (
                                <tr key={request.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{request.recipient_name}</div>
                                        <div className="text-sm text-slate-500">{request.contact_info}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={request.status} />
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {request.technician ? (
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3" /> {request.technician}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex flex-col gap-1">
                                            {request.due_date && (
                                                <div className="flex items-center gap-2 text-red-600 font-medium" title="Due Date">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(request.due_date).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 text-xs" title="Created Date">
                                                <span className="text-slate-400">Created:</span>
                                                {new Date(request.created_at).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleDelete(request.id)}
                                                className="p-2 rounded-full hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                                                title="Delete Request"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <Link to={`/requests/${request.id}`} className="p-2 rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                                                <ChevronRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                        No requests found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
