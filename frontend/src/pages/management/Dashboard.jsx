import { useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../../api/index.js';
import { Avatar, Badge, Card, ErrorState, LoadingState, PageHeader, Progress, Ring, SectionTitle } from '../../components/ui.jsx';
import { useApi } from '../../hooks/useApi.js';

const SPLIT_TONES = ['navy', 'blue', 'sky', 'muted'];
const EVENT_CLASS = { light: 'is-light', blue: 'is-blue' };

export default function Dashboard() {
  const { data, loading, error, reload, setData } = useApi(() =>
    Promise.all([api.dashboard.management(), api.kpis.overview()]).then(([dashboard, kpis]) => ({
      ...dashboard,
      top: kpis.top,
    })),
  );

  const [openAccordion, setOpenAccordion] = useState(null);
  const [busyApproval, setBusyApproval] = useState(null);

  if (loading && !data) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (!data) return null;

  const topEmployee = data.top?.[0];
  const maxHours = Math.max(9, ...data.week.map((day) => day.hours || 0));
  const attendanceRate = data.attendanceSplit[0]?.percent || 0;
  const currentAccordion = openAccordion ?? data.accordion[0]?.id;

  const toggleApproval = async (item) => {
    setBusyApproval(item.id);
    try {
      const result = await api.dashboard.toggleChecklist('approvals', item.id);
      setData((previous) => ({
        ...previous,
        approvals: result.items,
        approvalsDone: result.done,
      }));
    } catch {
      await reload();
    } finally {
      setBusyApproval(null);
    }
  };

  return (
    <>
      <PageHeader
        title={`أهلاً، ${data.greetingName}`}
        subtitle="نظرة شاملة على الفريق، الحضور، الرواتب والاعتمادات."
        actions={
          <div className="headline-stats">
            <div>
              <span>موظف</span>
              <strong>{data.headcount}</strong>
            </div>
            <div>
              <span>تعيين جديد</span>
              <strong>{data.newHires}</strong>
            </div>
            <div>
              <span>متوسط الأداء</span>
              <strong>
                {data.avgKpi}
                <small>%</small>
              </strong>
            </div>
          </div>
        }
      />

      <Card className="card--pad attendance-split-card">
        <div className="attendance-split">
          {data.attendanceSplit.map((item, index) => (
            <div
              className="attendance-split__item"
              key={item.key}
              style={{ flexGrow: Math.max(10, item.percent) }}
            >
              <span>{item.label}</span>
              <div className={`attendance-split__bar attendance-split__bar--${SPLIT_TONES[index]}`}>
                {item.percent}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid--4">
        <Card tone="photo" className="employee-month">
          <div className="employee-month__body">
            <Avatar name={topEmployee?.name || 'نسق'} size={76} square />
            <div>
              <span className="employee-month__label">موظف الشهر</span>
              <strong>{topEmployee?.name || '—'}</strong>
              <span className="employee-month__dept">{topEmployee?.dept || ''}</span>
            </div>
          </div>
          <div className="employee-month__badge">
            <Badge tone="glass">KPI {topEmployee?.kpi || 0}%</Badge>
          </div>
        </Card>

        <Card className="card--pad">
          <SectionTitle
            action={
              <Link to="/attendance" className="btn btn--ghost btn--sm">
                التفاصيل
              </Link>
            }
          >
            متوسط ساعات العمل
          </SectionTitle>
          <div className="hours-card__value">
            <strong>{data.hoursThisWeek}</strong>
            <span>
              ساعة
              <br />
              هذا الأسبوع
            </span>
          </div>

          <div className="bars">
            {data.week.map((day) => {
              const height = Math.max(6, Math.round(((day.hours || 0) / maxHours) * 90));
              return (
                <div className={`bar ${day.isToday ? 'is-today' : ''}`} key={day.date}>
                  {day.isToday ? <span className="bar__tip">{day.hours || 0} س</span> : null}
                  <span
                    className={`bar__fill ${day.hours ? '' : 'is-empty'} ${day.isToday ? 'is-today' : ''}`}
                    style={{ height }}
                  />
                  <small>{day.label}</small>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="card--pad">
          <SectionTitle hint="اليوم">مؤشر الحضور</SectionTitle>
          <div className="ring-block">
            <Ring progress={attendanceRate / 100} size={150}>
              <strong className="ring__big">{attendanceRate}%</strong>
              <span className="ring__hint">حضور فعلي</span>
            </Ring>
          </div>
          <div className="mini-legend">
            <span>
              <i className="dot-color dot-color--green" /> {data.attendance.present} حاضر
            </span>
            <span>
              <i className="dot-color dot-color--blue" /> {data.attendance.remote} عن بُعد
            </span>
            <span>
              <i className="dot-color dot-color--red" /> {data.attendance.absent + data.attendance.late} غياب/تأخير
            </span>
          </div>
        </Card>

        <div className="stack row-2">
          <Card className="card--pad">
            <SectionTitle hint={data.payroll.monthLabel}>
              دورة رواتب الشهر
            </SectionTitle>
            <div className="cycle">
              <div className="cycle__head">
                <strong>{data.payroll.progress}%</strong>
                <span>مكتمل</span>
              </div>
              <Progress value={data.payroll.progress} tone="blue" height={10} />
              <div className="cycle__phases">
                <span style={{ flex: data.payroll.cycle.prepared }}>إعداد</span>
                <span style={{ flex: data.payroll.cycle.review }}>مراجعة</span>
                <span style={{ flex: data.payroll.cycle.approval }}>اعتماد</span>
              </div>
            </div>
            <Link to="/payroll" className="btn btn--soft btn--block">
              فتح مسيّر الرواتب
            </Link>
          </Card>

          <Card tone="navy" className="approvals-card">
            <div className="readiness-card__head">
              <SectionTitle>طلبات بانتظار اعتمادك</SectionTitle>
              <strong className="readiness-card__count">
                {data.approvalsDone}/{data.approvalsTotal}
              </strong>
            </div>

            <div className="checklist">
              {data.approvals.map((item) => (
                <button
                  type="button"
                  className="checklist__item checklist__item--tag"
                  key={item.id}
                  onClick={() => toggleApproval(item)}
                  disabled={busyApproval === item.id}
                >
                  <span className="checklist__tag">{item.tag}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <span>{item.sub}</span>
                  </div>
                  <span className={`check ${item.done ? 'is-done' : ''}`}>{item.done ? '✓' : ''}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <Card className="card--pad accordion-card">
          {data.accordion.map((section) => {
            const isOpen = currentAccordion === section.id;
            return (
              <div className="accordion" key={section.id}>
                <button
                  type="button"
                  className="accordion__head"
                  onClick={() => setOpenAccordion(isOpen ? null : section.id)}
                >
                  <span>{section.title}</span>
                  <span>{isOpen ? '▴' : '▾'}</span>
                </button>

                {isOpen ? (
                  <div className="accordion__body">
                    {section.rows.map((row) => (
                      <div className="accordion__row" key={row.key}>
                        <span>{row.key}</span>
                        <strong>{row.value}</strong>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </Card>

        <Card className="card--pad span-2 calendar-card">
          <SectionTitle
            hint={
              <span className="calendar-card__nav">
                <span>أكتوبر {new Date().getFullYear()}</span>
              </span>
            }
          >
            تقويم الاجتماعات
          </SectionTitle>

          <div className="calendar">
            <div className="calendar__days">
              <span />
              {data.calendar.days.map((day) => (
                <span className={`calendar__day ${day.isToday ? 'is-today' : ''}`} key={day.day}>
                  <small>{day.name}</small>
                  <strong>{day.day}</strong>
                </span>
              ))}
            </div>

            <div className="calendar__body">
              <div className="calendar__hours">
                {['9:00 ص', '10:00 ص', '11:00 ص', '12:00 م'].map((hour) => (
                  <span key={hour}>{hour}</span>
                ))}
              </div>

              {data.calendar.days.map((day, dayIndex) => (
                <div className="calendar__column" key={`${day.name}-${day.day}`}>
                  {data.calendar.events
                    .filter((event) => event.dayIndex === dayIndex)
                    .map((event) => (
                      <div
                        className={`calendar__event ${EVENT_CLASS[event.tone] || ''}`}
                        key={event.id}
                        style={{
                          top: `${(event.start / 60) * 42}px`,
                          height: `${Math.max(42, (event.duration / 60) * 42)}px`,
                        }}
                      >
                        <div>
                          <strong>{event.title}</strong>
                          <span>{event.subtitle}</span>
                        </div>
                        <div className="calendar__attendees">
                          {Array.from({ length: event.attendees }).map((_, index) => (
                            <i key={index} />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
