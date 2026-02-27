import React from 'react';

export default function ErrorAlert({ message }) {
    if (!message) return null;

    return (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8">
            <p className="font-semibold">⚠️ Erreur: {message}</p>
        </div>
    );
}

