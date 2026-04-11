import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ModuleManagement() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(createPageUrl('UserManagement'), { replace: true });
  }, []);
  return null;
}
