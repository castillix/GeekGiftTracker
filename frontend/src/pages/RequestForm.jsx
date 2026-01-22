import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../services/api';
import { Upload, Save, X } from 'lucide-react';

const RequestForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        recipient_name: '',
        recipient_name: '',
        requestor_contact: '',
        client_contact: '',
        description: '',
        technician: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('recipient_name', formData.recipient_name);
        if (formData.requestor_contact) data.append('requestor_contact', formData.requestor_contact);
        if (formData.client_contact) data.append('client_contact', formData.client_contact);
        data.append('description', formData.description);
        if (formData.due_date) data.append('due_date', formData.due_date);
        if (formData.technician) data.append('technician', formData.technician);
        if (file) data.append('file', file);

        try {
            await createRequest(data);
            navigate('/');
        } catch (error) {
            console.error("Failed to create request", error);
            alert("Failed to create request. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-slate-900">New Geek Gift Request</h1>
                <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-700">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Recipient Name</label>
                        <input
                            type="text"
                            name="recipient_name"
                            required
                            value={formData.recipient_name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Requestor Contact Info (Optional)</label>
                        <input
                            type="text"
                            name="requestor_contact"
                            value={formData.requestor_contact}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Email or Phone Number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Client Contact Info (Optional)</label>
                        <input
                            type="text"
                            name="client_contact"
                            value={formData.client_contact}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Email or Phone Number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                        <input
                            type="date"
                            name="due_date"
                            value={formData.due_date || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description / Notes</label>
                        <textarea
                            name="description"
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            placeholder="Reason for request, specific needs, etc."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Attachment</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="w-8 h-8 text-slate-400 mb-2" />
                            <div className="text-sm text-slate-600 font-medium">
                                {file ? file.name : "Click to upload file"}
                            </div>
                            {!file && <div className="text-xs text-slate-400 mt-1">Any file type allowed</div>}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Create Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestForm;
