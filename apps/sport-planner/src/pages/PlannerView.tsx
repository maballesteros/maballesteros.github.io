import { Navigate, useSearchParams } from 'react-router-dom';

export default function PlannerView() {
  const [searchParams] = useSearchParams();
  const next = new URLSearchParams(searchParams);
  next.set('mode', 'edit');
  return <Navigate to={{ pathname: '/', search: `?${next.toString()}` }} replace />;
}
