import { request } from './client.js';

export const api = {
  auth: {
    login: (email, password) =>
      request('/auth/login', { method: 'POST', body: { email, password } }),
    me: () => request('/auth/me'),
    demoAccounts: () => request('/auth/demo-accounts'),
  },

  dashboard: {
    employee: () => request('/dashboard/employee'),
    hr: () => request('/dashboard/hr'),
    management: () => request('/dashboard/management'),
    toggleChecklist: (list, id) =>
      request(`/dashboard/checklists/${list}/${id}`, { method: 'PATCH' }),
  },

  employees: {
    list: (params) => request('/employees', { query: params }),
    departments: () => request('/employees/departments'),
    get: (id) => request(`/employees/${id}`),
    create: (body) => request('/employees', { method: 'POST', body }),
    update: (id, body) => request(`/employees/${id}`, { method: 'PATCH', body }),
    remove: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  },

  attendance: {
    daily: (date) => request('/attendance/daily', { query: { date } }),
    me: () => request('/attendance/me'),
    checkIn: () => request('/attendance/check-in', { method: 'POST' }),
    checkOut: () => request('/attendance/check-out', { method: 'POST' }),
  },

  leaves: {
    list: (status) => request('/leaves', { query: { status } }),
    mine: () => request('/leaves/me'),
    balance: () => request('/leaves/balance/me'),
    create: (body) => request('/leaves', { method: 'POST', body }),
    decide: (id, status) =>
      request(`/leaves/${id}/decision`, { method: 'PATCH', body: { status } }),
  },

  requests: {
    mine: () => request('/requests/me'),
    create: (body) => request('/requests/me', { method: 'POST', body }),
    list: (status) => request('/requests', { query: { status } }),
    setStatus: (id, status) =>
      request(`/requests/${id}/status`, { method: 'PATCH', body: { status } }),
  },

  payroll: {
    runs: () => request('/payroll/runs'),
    latest: () => request('/payroll/runs/latest'),
    get: (id) => request(`/payroll/runs/${id}`),
    create: (body) => request('/payroll/runs', { method: 'POST', body }),
    approve: (id) => request(`/payroll/runs/${id}/approve`, { method: 'POST' }),
    payslip: (month, year) =>
      request('/payroll/me/payslip', { query: { month, year } }),
  },

  kpis: {
    overview: () => request('/kpis'),
    me: () => request('/kpis/me'),
    update: (employeeId, body) =>
      request(`/kpis/${employeeId}`, { method: 'PATCH', body }),
  },

  recruitment: {
    board: () => request('/recruitment/board'),
    addCandidate: (body) => request('/recruitment/candidates', { method: 'POST', body }),
    setStage: (id, stage) =>
      request(`/recruitment/candidates/${id}/stage`, { method: 'PATCH', body: { stage } }),
    removeCandidate: (id) =>
      request(`/recruitment/candidates/${id}`, { method: 'DELETE' }),
  },

  settings: () => request('/settings'),
};
