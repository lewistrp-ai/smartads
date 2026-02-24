import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role } = useAuth();

    // Handle unauthenticated users
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Handle authorized roles
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect to a dashboard or unauthorized page
        return <Navigate to="/" replace />;
    }

    // User is authenticated and authorized
    return children;
};

export default ProtectedRoute;
