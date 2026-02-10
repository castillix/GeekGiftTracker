import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRequests } from '../services/api';
import { ChevronRight, Calendar, User, Search, Download, FileText } from 'lucide-react';

const CompletedRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await getRequests();
            // Filter for completed requests only
            setRequests(data.filter(r => r.status === 'completed'));
        } catch (error) {
            console.error("Failed to load requests", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredRequests = requests.filter(r => {
        return r.recipient_name.toLowerCase().includes(filter.toLowerCase()) ||
            (r.organization_name && r.organization_name.toLowerCase().includes(filter.toLowerCase())) ||
            (r.technician && r.technician.toLowerCase().includes(filter.toLowerCase())) ||
            (r.receipt_id && r.receipt_id.toLowerCase().includes(filter.toLowerCase()));
    });

    const handleExport = () => {
        // Define headers
        const headers = [
            'ID', 'Recipient', 'Organization', 'Status', 'Technician',
            'Request Date', 'Completed Date', 'Receipt ID', 'Pickup Date',
            'Model', 'Type', 'Price'
        ];

        // Format data rows
        const rows = filteredRequests.map(r => [
            r.id,
            `"${r.recipient_name || ''}"`,
            `"${r.organization_name || ''}"`,
            r.status,
            `"${r.technician || ''}"`,
            r.request_date ? new Date(r.request_date).toLocaleDateString() : '',
            r.created_at ? new Date(r.created_at).toLocaleDateString() : '',
            `"${r.receipt_id || ''}"`,
            r.pickup_date ? new Date(r.pickup_date).toLocaleDateString() : '',
            `"${r.computer_model || ''}"`,
            `"${r.computer_type || ''}"`,
            `"${r.computer_price || ''}"`
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `completed_requests_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading requests...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-slate-900">Completed Requests</h1>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
                        {filteredRequests.length}
                    </span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search completed..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Export to CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold">
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Organization</th>
                                <th className="px-6 py-4">Technician</th>
                                <th className="px-6 py-4">Completion Details</th>
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
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {request.organization_name || '-'}
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
                                    <td className="px-6 py-4 text-sm">
                                        <div className="space-y-1">
                                            {request.receipt_id && (
                                                <div className="text-slate-700 font-medium">ID: {request.receipt_id}</div>
                                            )}
                                            {request.computer_model && (
                                                <div className="text-slate-500 text-xs">{request.computer_model}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            {request.pickup_date ? new Date(request.pickup_date).toLocaleDateString() : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link to={`/requests/${request.id}`} className="inline-flex p-2 rounded-full hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors">
                                            <ChevronRight className="w-4 h-4" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        No completed requests found.
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

export default CompletedRequests;
