import { db } from '../lib/db.js';

const average = (values) =>
  values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

export const kpiOverview = () => {
  const employees = [...db.data.employees].sort((a, b) => b.kpi - a.kpi);
  const departments = db.data.departments
    .map((department) => {
      const members = employees.filter((employee) => employee.dept === department.name);
      return {
        id: department.id,
        name: department.name,
        metric: department.metric,
        target: department.target,
        score: average(members.map((member) => member.kpi)),
        employees: members.length,
      };
    })
    .filter((department) => department.employees > 0);

  const now = new Date();
  const quarters = ['الأول', 'الثاني', 'الثالث', 'الرابع'];

  return {
    quarter: `الربع ${quarters[Math.floor(now.getMonth() / 3)]} ${now.getFullYear()}`,
    average: average(employees.map((employee) => employee.kpi)),
    employees: employees.map((employee) => ({
      id: employee.id,
      name: employee.name,
      dept: employee.dept,
      role: employee.role,
      goal: employee.goal,
      kpi: employee.kpi,
    })),
    departments,
    top: employees.slice(0, 4).map((employee, index) => ({
      rank: index + 1,
      id: employee.id,
      name: employee.name,
      dept: employee.dept,
      kpi: employee.kpi,
    })),
  };
};
