import { Navigate, Route, Routes } from 'react-router-dom';

import AppLayout from './layouts/AppLayout.jsx';
import { ProtectedRoute, RoleRoute } from './components/RouteGuards.jsx';
import { useAuth } from './context/AuthContext.jsx';
import { homeFor } from './config/navigation.js';

import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

import EmployeeHome from './pages/employee/EmployeeHome.jsx';
import Payslip from './pages/employee/Payslip.jsx';
import MyRequests from './pages/employee/MyRequests.jsx';

import HrHome from './pages/hr/HrHome.jsx';
import Hiring from './pages/hr/Hiring.jsx';
import Employees from './pages/hr/Employees.jsx';
import Attendance from './pages/hr/Attendance.jsx';
import Payroll from './pages/hr/Payroll.jsx';
import Leaves from './pages/hr/Leaves.jsx';

import Dashboard from './pages/management/Dashboard.jsx';
import Kpis from './pages/management/Kpis.jsx';

function HomeRedirect() {
  const { user } = useAuth();
  return <Navigate to={homeFor(user?.role)} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="app" element={<HomeRedirect />} />

          <Route
            path="home"
            element={
              <RoleRoute roles={['emp']}>
                <EmployeeHome />
              </RoleRoute>
            }
          />
          <Route
            path="payslip"
            element={
              <RoleRoute roles={['emp']}>
                <Payslip />
              </RoleRoute>
            }
          />
          <Route
            path="requests"
            element={
              <RoleRoute roles={['emp']}>
                <MyRequests />
              </RoleRoute>
            }
          />

          <Route
            path="hr"
            element={
              <RoleRoute roles={['hr']}>
                <HrHome />
              </RoleRoute>
            }
          />
          <Route
            path="hiring"
            element={
              <RoleRoute roles={['hr']}>
                <Hiring />
              </RoleRoute>
            }
          />
          <Route
            path="attendance"
            element={
              <RoleRoute roles={['hr']}>
                <Attendance />
              </RoleRoute>
            }
          />
          <Route
            path="leaves"
            element={
              <RoleRoute roles={['hr']}>
                <Leaves />
              </RoleRoute>
            }
          />

          <Route
            path="dashboard"
            element={
              <RoleRoute roles={['mgmt']}>
                <Dashboard />
              </RoleRoute>
            }
          />
          <Route
            path="kpis"
            element={
              <RoleRoute roles={['mgmt']}>
                <Kpis />
              </RoleRoute>
            }
          />

          <Route
            path="employees"
            element={
              <RoleRoute roles={['hr', 'mgmt']}>
                <Employees />
              </RoleRoute>
            }
          />
          <Route
            path="payroll"
            element={
              <RoleRoute roles={['hr', 'mgmt']}>
                <Payroll />
              </RoleRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
