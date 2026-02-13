import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, updateRequest, createComment, getFileUrl } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, FileText, User, MessageSquare, Send, Save, Building, Calendar } from 'lucide-react';

const RequestDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comment, setComment] = useState('');

    // Comment Author State
    const [commentAuthor, setCommentAuthor] = useState(() => localStorage.getItem('technician_name') || '');

    // Edit State
    const [formData, setFormData] = useState({
        technician: '',
        status: '',
        organization_name: '',
        request_date: '',
        receipt_id: '',
        pickup_date: '',
        computer_model: '',
        computer_type: '',
        computer_price: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadRequest();
    }, [id]);

    const loadRequest = async () => {
        try {
            const data = await getRequest(id);
            setRequest(data);
            setFormData({
                technician: data.technician || '',
                status: data.status,
                organization_name: data.organization_name || '',
                request_date: data.request_date ? data.request_date.split('T')[0] : '',
                receipt_id: data.receipt_id || '',
                pickup_date: data.pickup_date ? data.pickup_date.split('T')[0] : '',
                computer_model: data.computer_model || '',
                computer_type: data.computer_type || '',
                computer_price: data.computer_price || ''
            });
        } catch (error) {
            console.error("Failed to load request", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        // Validation for completion
        if (formData.status === 'completed') {
            const requiredFields = ['receipt_id', 'pickup_date', 'computer_model', 'computer_type', 'computer_price'];
            const missing = requiredFields.filter(field => !formData[field]);

            if (missing.length > 0) {
                alert(`Cannot mark as Completed. Missing fields: ${missing.join(', ')}`);
                return;
            }
        }

        setSaving(true);
        try {
            // Convert empty strings to null for backend compatibility
            const submissionData = Object.keys(formData).reduce((acc, key) => {
                acc[key] = formData[key] === "" ? null : formData[key];
                return acc;
            }, {});

            const updated = await updateRequest(id, submissionData);
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

        // Save author to local storage
        if (commentAuthor) {
            localStorage.setItem('technician_name', commentAuthor);
        }

        try {
            await createComment(id, { content: comment, author: commentAuthor });
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

                                {formData.organization_name && (
                                    <div className="flex items-center gap-2 text-slate-600 mt-1">
                                        <Building className="w-4 h-4 text-slate-400" />
                                        <span className="font-medium">{formData.organization_name}</span>
                                    </div>
                                )}

                                <div className="text-slate-500 space-y-1 mt-2 text-sm">
                                    {(request.requestor_contact || request.client_contact) ? (
                                        <>
                                            {request.requestor_contact && <div><span className="font-semibold text-xs uppercase tracking-wider text-slate-400">Requestor:</span> {request.requestor_contact}</div>}
                                            {request.client_contact && <div><span className="font-semibold text-xs uppercase tracking-wider text-slate-400">Client:</span> {request.client_contact}</div>}
                                        </>
                                    ) : (
                                        <div>{request.contact_info}</div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-4 mt-3">
                                    {formData.request_date && (
                                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                                            <Calendar className="w-4 h-4" />
                                            <span>Requested: {new Date(formData.request_date).toLocaleDateString(undefined, { timeZone: 'UTC' })}</span>
                                        </div>
                                    )}
                                    {request.due_date && (
                                        <div className="flex items-center gap-1 text-red-600 font-medium text-sm">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            Due: {new Date(request.due_date).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
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
                                        <div className="flex justify-between items-center mt-2">
                                            <div className="text-xs font-semibold text-indigo-600">
                                                {c.author || "Unknown Tech"}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {new Date(c.created_at).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="space-y-3">
                            <input
                                type="text"
                                placeholder="Technician Name (for signature)"
                                value={commentAuthor}
                                onChange={(e) => setCommentAuthor(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
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
                </div>

                {/* Sidebar Controls */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Request Details</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="not_started">Not Started</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="ready_for_pickup">Ready for Pickup</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Organization Name</label>
                                <div className="relative">
                                    <Building className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="organization_name"
                                        value={formData.organization_name}
                                        onChange={handleInputChange}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Organization..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Request Date</label>
                                <div className="relative">
                                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="date"
                                        name="request_date"
                                        value={formData.request_date}
                                        onChange={handleInputChange}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Assigned Technician</label>
                                <div className="relative">
                                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        name="technician"
                                        value={formData.technician}
                                        onChange={handleInputChange}
                                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Unassigned"
                                    />
                                </div>
                            </div>

                            <hr className="border-slate-100 my-4" />
                            <h3 className="text-sm font-bold text-slate-900 mb-2">Completion Details</h3>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Receipt ID</label>
                                <input
                                    type="text"
                                    name="receipt_id"
                                    value={formData.receipt_id}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. R-12345"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pickup Date</label>
                                <input
                                    type="date"
                                    name="pickup_date"
                                    value={formData.pickup_date}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Computer Model</label>
                                <input
                                    type="text"
                                    name="computer_model"
                                    value={formData.computer_model}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Dell Latitude 5480"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</label>
                                    <select
                                        name="computer_type"
                                        value={formData.computer_type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">Select...</option>
                                        <option value="Laptop">Laptop</option>
                                        <option value="Desktop">Desktop</option>
                                        <option value="All-in-One">All-in-One</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Price</label>
                                    <input
                                        type="text"
                                        name="computer_price"
                                        value={formData.computer_price}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="$0.00"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleUpdate}
                                disabled={saving}
                                className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex justify-center items-center gap-2 mt-4"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Update & Save'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RequestDetail;
