import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const useAuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: 'Please login to access this page',
        confirmButtonColor: '#0f7a4a',
        confirmButtonText: 'Go to Login'
      }).then(() => {
        navigate('/login');
      });
    }
  }, [navigate]);

  return localStorage.getItem('token');
};

export default useAuthCheck;