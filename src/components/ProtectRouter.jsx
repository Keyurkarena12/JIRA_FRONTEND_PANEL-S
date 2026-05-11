import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({children}) =>{
    const {user} = useSelector((state) => state.auth);
    const location = useLocation();
    
    // Check for token in localStorage as fallback
    const token = localStorage.getItem('token');
    
    if(!user && !token){
        return <Navigate to="/login" state={{from: location}} replace/>
    }
    
    return children;
}

export default ProtectedRoute;