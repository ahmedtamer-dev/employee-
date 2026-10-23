import { Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext.jsx';
import { homeFor } from '../config/navigation.js';

export default function NotFound() {
  const { user } = useAuth();

  return (
    <div className="not-found">
      <span className="not-found__code">404</span>
      <h1>الصفحة غير موجودة</h1>
      <p>قد يكون الرابط قديمًا أو غير متاح لحسابك الحالي.</p>
      <Link className="btn btn--primary" to={user ? homeFor(user.role) : '/login'}>
        العودة للرئيسية
      </Link>
    </div>
  );
}
