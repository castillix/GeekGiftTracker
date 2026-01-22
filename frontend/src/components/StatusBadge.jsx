import React from 'react';

const StatusBadge = ({ status }) => {
    const styles = {
        not_started: 'bg-slate-100 text-slate-700 border-slate-200',
        in_progress: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        ready_for_pickup: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        completed: 'bg-blue-50 text-blue-700 border-blue-200',
    };

    const labels = {
        not_started: 'Not Started',
        in_progress: 'In Progress',
        ready_for_pickup: 'Ready for Pickup',
        completed: 'Completed',
    };

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.not_started}`}>
            {labels[status] || status}
        </span>
    );
};

export default StatusBadge;
