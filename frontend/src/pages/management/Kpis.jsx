import { api } from '../../api/index.js';
import { Badge, Card, ErrorState, LoadingState, PageHeader, Progress, SectionTitle } from '../../components/ui.jsx';
import Table from '../../components/Table.jsx';
import { useApi } from '../../hooks/useApi.js';
import { kpiTone } from '../../utils/format.js';

export default function Kpis() {
  const { data, loading, error, reload } = useApi(() => api.kpis.overview());

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  return (
    <>
      <PageHeader
        title="مؤشرات الأداء"
        subtitle={`${data.quarter} · متوسط الشركة ${data.average}% · ${data.employees.length} موظف`}
      />

      <div className="grid grid--4">
        {data.departments.map((department) => (
          <Card className="card--pad department-card" key={department.id}>
            <div className="department-card__head">
              <div>
                <strong>{department.name}</strong>
                <span>{department.metric}</span>
              </div>
              <strong className={`department-card__score text-${kpiTone(department.score)}`}>
                {department.score}%
              </strong>
            </div>

            <Progress
              value={department.score}
              tone={kpiTone(department.score)}
              height={10}
              target={department.target}
            />

            <div className="department-card__foot">
              <span>المستهدف {department.target}%</span>
              <span>{department.employees} موظف</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid--kpi">
        <Card className="card--pad">
          <SectionTitle hint={`${data.employees.length} موظف`}>
            تقييم الموظفين
          </SectionTitle>

          <Table
            rows={data.employees}
            getKey={(employee) => employee.id}
            columns={[
              {
                key: 'name',
                label: 'الموظف',
                width: '1.8fr',
                render: (employee) => (
                  <div className="cell-person">
                    <strong>{employee.name}</strong>
                    <span dir="ltr">{employee.role}</span>
                  </div>
                ),
              },
              {
                key: 'dept',
                label: 'القسم',
                width: '1.2fr',
                render: (employee) => <span className="muted">{employee.dept}</span>,
              },
              {
                key: 'goal',
                label: 'المؤشر الرئيسي',
                width: '2.4fr',
                render: (employee) => <span className="muted small">{employee.goal}</span>,
              },
              {
                key: 'progress',
                label: 'الإنجاز',
                width: '1.4fr',
                render: (employee) => (
                  <Progress value={employee.kpi} tone={kpiTone(employee.kpi)} height={6} />
                ),
              },
              {
                key: 'kpi',
                label: 'التقييم',
                width: '0.8fr',
                number: true,
                render: (employee) => <strong>{employee.kpi}%</strong>,
              },
            ]}
          />
        </Card>

        <Card tone="navy" className="card--pad top-card">
          <SectionTitle>الأعلى أداءً</SectionTitle>

          <div className="top-list">
            {data.top.map((employee) => (
              <div className="top-list__row" key={employee.id}>
                <span className="top-list__rank">{employee.rank}</span>
                <div>
                  <strong>{employee.name}</strong>
                  <span>{employee.dept}</span>
                </div>
                <Badge tone="glass">{employee.kpi}%</Badge>
              </div>
            ))}
          </div>

          <p className="muted-on-navy">
            يُصرف حافز أداء تلقائيًا في مسيّر الرواتب لمن يتجاوز 90%.
          </p>
        </Card>
      </div>
    </>
  );
}
