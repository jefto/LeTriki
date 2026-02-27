import React from 'react';
import { FaSpinner } from 'react-icons/fa';

export default function LoadingSpinner({ size = 'lg', className = '' }) {
    const sizeClasses = {
        sm: 'text-2xl',
        md: 'text-4xl',
        lg: 'text-6xl'
    };

    return (
        <div className={`flex justify-center items-center ${className}`}>
            <FaSpinner className={`animate-spin text-[#E3001B] ${sizeClasses[size]}`} />
        </div>
    );
}

