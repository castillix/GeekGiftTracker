import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteRequest, getRequests } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ChevronRight, Calendar, User, Search, Trash2, Building } from 'lucide-react';

const Dashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

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
        return r.recipient_name.toLowerCase().includes(filter.toLowerCase()) ||
            (r.organization_name && r.organization_name.toLowerCase().includes(filter.toLowerCase())) ||
            (r.technician && r.technician.toLowerCase().includes(filter.toLowerCase()));
    });

    // Group requests by status
    const sections = [
        { title: "Not Started", status: "not_started", color: "bg-slate-100 border-slate-200" },
        { title: "In Progress", status: "in_progress", color: "bg-blue-50 border-blue-100" },
        { title: "Ready for Pickup", status: "ready_for_pickup", color: "bg-amber-50 border-amber-100" },
        { title: "Completed", status: "completed", color: "bg-green-50 border-green-100" },
    ];

    if (loading) return <div className="p-8 text-center text-slate-500">Loading requests...</div>;

    const RequestCard = ({ request }) => (
        <div key={request.id} className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="font-bold text-slate-900">{request.recipient_name}</div>
                    {request.organization_name && (
                        <div className="text-xs font-medium text-slate-600 flex items-center gap-1">
                            <Building className="w-3 h-3" /> {request.organization_name}
                        </div>
                    )}
                </div>
                <Link to={`/requests/${request.id}`} className="text-indigo-600 hover:text-indigo-800 p-1">
                    <ChevronRight className="w-5 h-5" />
                </Link>
            </div>

            <div className="text-sm text-slate-500 mb-3 line-clamp-2">
                {(request.description || "No description")}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{request.technician || "Unassigned"}</span>
                    </div>
                    {request.due_date && (
                        <div className="flex items-center gap-1 text-red-600 font-medium">
                            <Calendar className="w-3 h-3" />
                            {new Date(request.due_date).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={() => handleDelete(request.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete Request"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Request Dashboard</h1>
                <div className="relative w-full sm:w-auto">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search requests..."
                        className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto pb-4">
                {sections.map(section => (
                    <div key={section.status} className="flex flex-col min-w-[280px]">
                        <div className={`p-3 rounded-t-lg border-b-0 border ${section.color} flex justify-between items-center`}>
                            <h2 className="font-bold text-slate-700">{section.title}</h2>
                            <span className="bg-white px-2 py-0.5 rounded-full text-xs font-bold text-slate-500 border border-slate-200">
                                {filteredRequests.filter(r => r.status === section.status).length}
                            </span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-b-lg border border-slate-200 space-y-3 min-h-[500px]">
                            {filteredRequests.filter(r => r.status === section.status).map(request => (
                                <RequestCard key={request.id} request={request} />
                            ))}
                            {filteredRequests.filter(r => r.status === section.status).length === 0 && (
                                <div className="text-center text-slate-400 py-8 text-sm italic">
                                    No requests
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
