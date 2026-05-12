import { Navigate } from "react-router-dom";

// Wraps any route and redirects if the user's role isn't in allowedRoles
function ProtectedRoute({ children, allowedRoles }) {
    const role = localStorage.getItem('role');

    if (!role) {
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoute;
