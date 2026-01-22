import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, updateRequest, createComment, getFileUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, FileText, User, MessageSquare, Send, Save } from 'lucide-react';

const RequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    // Edit State
    const [technician, setTechnician] = useState('');
    const [status, setStatus] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRequest();
    }, [id]);

    const loadRequest = async () => {
        try {
            const data = await getRequest(id);
            setRequest(data);
            setTechnician(data.technician || '');
            setStatus(data.status);
        } catch (error) {
            console.error("Failed to load request", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        setSaving(true);
        try {
            const updated = await updateRequest(id, { technician, status });
            setRequest(updated);
            alert("Updated successfully!");
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update.");
        } finally {
            setSaving(false);
        }
    };

    const handlePostComment = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return;
        try {
            await createComment(id, comment);
            setComment('');
            loadRequest(); // Reload to see new comment
        } catch (error) {
            console.error("Failed to post comment", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500">Loading details...</div>;
    if (!request) return <div className="p-8 text-center text-red-500">Request not found.</div>;

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/')} className="flex items-center text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{request.recipient_name}</h1>
                                <div className="text-slate-500 space-y-1 mt-1">
                                    {(request.requestor_contact || request.client_contact) ? (
                                        <>
                                            {request.requestor_contact && <div><span className="font-semibold text-xs uppercase tracking-wider text-slate-400">Requestor:</span> {request.requestor_contact}</div>}
                                            {request.client_contact && <div><span className="font-semibold text-xs uppercase tracking-wider text-slate-400">Client:</span> {request.client_contact}</div>}
                                        </>
                                    ) : (
                                        <div>{request.contact_info}</div>
                                    )}
                                </div>
                                {request.due_date && (
                                    <div className="flex items-center gap-2 text-red-600 font-medium text-sm mt-1">
                                        <div className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            Due: {new Date(request.due_date).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <StatusBadge status={request.status} />
                        </div>

                        <div className="prose prose-slate max-w-none mb-6">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-2">Description</h3>
                            <p className="text-slate-600 bg-slate-50 p-4 rounded-lg">{request.description || "No description provided."}</p>
                        </div>

                        {request.filename && (
                            <div className="flex items-center gap-3 p-3 border border-indigo-100 bg-indigo-50 rounded-lg text-indigo-700">
                                <FileText className="w-5 h-5" />
                                <span className="flex-1 font-medium truncate">{request.filename}</span>
                                <a
                                    href={getFileUrl(request.filename)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-bold hover:underline"
                                >
                                    Download File
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-slate-400" />
                            Comments history
                        </h2>

                        <div className="space-y-4 max-h-96 overflow-y-auto mb-4 custom-scrollbar">
                            {request.comments.length === 0 ? (
                                <div className="text-center text-slate-400 py-4 italic">No comments yet.</div>
                            ) : (
                                request.comments.map((c) => (
                                    <div key={c.id} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <div className="text-slate-700 text-sm whitespace-pre-wrap">{c.content}</div>
                                        <div className="text-xs text-slate-400 mt-2 text-right">
                                            {new Date(c.created_at).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <form onSubmit={handlePostComment} className="flex gap-2">
                            <input
                                type="text"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                            <button type="submit" className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors">
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Actions</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="not_started">Not Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="ready_for_pickup">Ready for Pickup</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Technician</label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={technician}
                                        onChange={(e) => setTechnician(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Unassigned"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={saving}
                                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Update Request'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
