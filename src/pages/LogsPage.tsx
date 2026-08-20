import { CheckCircle2, ChevronRight, Clock3, Filter, Search, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { EmptyState, LogStatusBadge, Modal, PlatformBadge } from '../components/ui';
import { useWorkbench } from '../state/WorkbenchContext';
import type { LogStatus, OperationLog, TriggerSource } from '../types';

const triggerLabels: Record<TriggerSource, string> = {
  manual: '人工操作',
  automation: '自动规则',
  simulation: '模拟任务',
};

export function LogsPage() {
  const { logs } = useWorkbench();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<LogStatus | 'all'>('all');
  const [trigger, setTrigger] = useState<TriggerSource | 'all'>('all');
  const [selected, setSelected] = useState<OperationLog | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesSearch = !needle || `${log.campaignName} ${log.action} ${log.ruleName ?? ''}`.toLowerCase().includes(needle);
      return matchesSearch
        && (status === 'all' || log.status === status)
        && (trigger === 'all' || log.trigger === trigger);
    });
  }, [logs, query, status, trigger]);

  return (
    <div className="page-stack">
      <section className="logs-summary">
        <div><span className="section-kicker">可追踪执行</span><h2>每一次广告状态变化都有记录</h2><p>查看自动任务、模拟执行和人工操作的结果、耗时与关键步骤。</p></div>
        <div className="logs-summary__stats"><span><CheckCircle2 size={17} /><strong>{logs.filter((log) => log.status === 'success').length}</strong>成功</span><span><ShieldCheck size={17} /><strong>{logs.filter((log) => log.status === 'skipped').length}</strong>安全跳过</span><span><Clock3 size={17} /><strong>{logs.filter((log) => log.status === 'failed').length}</strong>需要处理</span></div>
      </section>

      <section className="panel logs-panel">
        <div className="filters-bar">
          <label className="search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 Campaign、规则或操作" aria-label="搜索日志" /></label>
          <label className="select-field"><Filter size={16} /><select value={status} onChange={(event) => setStatus(event.target.value as LogStatus | 'all')} aria-label="按结果筛选"><option value="all">全部结果</option><option value="success">成功</option><option value="failed">失败</option><option value="skipped">已跳过</option></select></label>
          <label className="select-field"><select value={trigger} onChange={(event) => setTrigger(event.target.value as TriggerSource | 'all')} aria-label="按来源筛选"><option value="all">全部来源</option><option value="manual">人工操作</option><option value="automation">自动规则</option><option value="simulation">模拟任务</option></select></label>
          <span className="filters-result">共 {filtered.length} 条记录</span>
        </div>

        {filtered.length === 0 ? <EmptyState title="没有符合条件的日志" description="调整筛选条件后再试。" /> : (
          <div className="data-table-wrap">
            <table className="data-table logs-table">
              <thead><tr><th>执行时间</th><th>平台 / Campaign</th><th>操作</th><th>触发方式</th><th>执行结果</th><th>执行耗时</th><th>说明</th><th /></tr></thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id}>
                    <td><span className="log-time">{log.timestamp}</span></td>
                    <td><div className="log-campaign"><PlatformBadge platform={log.platform} /><strong>{log.campaignName}</strong></div></td>
                    <td><strong>{log.action}</strong></td>
                    <td><span className={`trigger-label trigger-label--${log.trigger}`}>{triggerLabels[log.trigger]}</span></td>
                    <td><LogStatusBadge status={log.status} /></td>
                    <td className="numeric">{(log.durationMs / 1000).toFixed(2)}s</td>
                    <td><span className="log-message">{log.message}</span></td>
                    <td><button className="icon-button" aria-label={`查看 ${log.campaignName} 日志详情`} onClick={() => setSelected(log)}><ChevronRight size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <Modal open={Boolean(selected)} title="任务执行详情" description={selected ? `${selected.id} · ${selected.timestamp}` : ''} onClose={() => setSelected(null)} size="large">
        {selected && (
          <div className="log-detail">
            <div className="log-detail__summary">
              <div><span>Campaign</span><strong>{selected.campaignName}</strong></div>
              <div><span>规则</span><strong>{selected.ruleName ?? '—'}</strong></div>
              <div><span>触发方式</span><strong>{triggerLabels[selected.trigger]}</strong></div>
              <div><span>执行结果</span><LogStatusBadge status={selected.status} /></div>
            </div>
            <div className="execution-timeline">
              <h3>执行步骤</h3>
              {selected.steps.map((step, index) => (
                <div className={`timeline-step timeline-step--${step.state}`} key={`${step.label}-${index}`}>
                  <span className="timeline-step__dot" />
                  <time>{step.time}</time>
                  <div><strong>{step.label}</strong><p>{step.detail}</p></div>
                </div>
              ))}
            </div>
            <div className={`log-detail__message log-detail__message--${selected.status}`}>{selected.message}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

