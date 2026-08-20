import { Bot, Clock3, MoreHorizontal, Pause, Play, Plus, ShieldCheck, Trash2, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RuleForm } from '../components/automation/RuleForm';
import { SimulationDialog } from '../components/automation/SimulationDialog';
import { Modal, PlatformBadge } from '../components/ui';
import { useWorkbench } from '../state/WorkbenchContext';
import type { AutomationRule } from '../types';

export function AutomationPage() {
  const { campaigns, rules, toggleRule, deleteRule } = useWorkbench();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formOpen, setFormOpen] = useState(false);
  const [simulatingRule, setSimulatingRule] = useState<AutomationRule | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AutomationRule | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setFormOpen(true);
      navigate('/automation', { replace: true });
    }
  }, [navigate, searchParams]);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2400);
  };

  return (
    <div className="page-stack">
      <section className="automation-header-card">
        <div>
          <span className="section-kicker">定时投流策略</span>
          <h2>把凌晨人工操作变成可验证的自动流程</h2>
          <p>规则按当地时区执行；每次操作都会检查状态、发送指令、二次验证并写入日志。</p>
        </div>
        <button className="button button--primary button--large" onClick={() => setFormOpen(true)}><Plus size={17} />新建规则</button>
      </section>

      <section className="rule-overview-grid">
        <div><span className="overview-icon overview-icon--blue"><Bot size={18} /></span><span>规则总数</span><strong>{rules.length}</strong></div>
        <div><span className="overview-icon overview-icon--green"><Play size={18} /></span><span>运行中</span><strong>{rules.filter((rule) => rule.enabled).length}</strong></div>
        <div><span className="overview-icon overview-icon--amber"><Clock3 size={18} /></span><span>今日待执行</span><strong>3</strong></div>
        <div><span className="overview-icon overview-icon--slate"><ShieldCheck size={18} /></span><span>人工保护</span><strong>1</strong></div>
      </section>

      <section className="panel rules-panel">
        <div className="panel__header">
          <div><span className="section-kicker">规则列表</span><h2>自动化投流规则</h2></div>
          <span className="simulation-note">所有执行均为演示模拟</span>
        </div>
        <div className="data-table-wrap">
          <table className="data-table rules-table">
            <thead><tr><th>规则 / Campaign</th><th>运行窗口</th><th>时区</th><th>执行日期</th><th>状态</th><th>下次执行</th><th>操作</th></tr></thead>
            <tbody>
              {rules.map((rule) => {
                const campaign = campaigns.find((item) => item.id === rule.campaignId);
                if (!campaign) return null;
                return (
                  <tr key={rule.id}>
                    <td><div className="rule-name"><PlatformBadge platform={campaign.platform} /><span><strong>{rule.name}</strong><small>{campaign.name}</small></span></div></td>
                    <td><div className="schedule-window"><span><Play size={13} />{rule.startTime}</span><i /><span><Pause size={13} />{rule.stopTime}</span></div></td>
                    <td><span className="timezone-label">{rule.timezone}</span></td>
                    <td><span className="days-label">{rule.days.length === 7 ? '每天' : rule.days.map((day) => `周${day}`).join('、')}</span></td>
                    <td><button className={rule.enabled ? 'switch switch--on' : 'switch'} aria-label={`${rule.enabled ? '停用' : '启用'} ${rule.name}`} aria-pressed={rule.enabled} onClick={() => toggleRule(rule.id)}><span /></button></td>
                    <td><div className="next-execution"><span /><strong>{rule.nextExecution}</strong></div></td>
                    <td><div className="row-actions"><button className="button button--compact button--primary" disabled={!rule.enabled} onClick={() => setSimulatingRule(rule)}><Zap size={14} />模拟执行</button><button className="icon-button" aria-label={`删除 ${rule.name}`} onClick={() => setDeleteTarget(rule)}><Trash2 size={15} /></button><button className="icon-button" aria-label="更多操作"><MoreHorizontal size={16} /></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="automation-note-grid">
        <article><span><ShieldCheck size={18} /></span><div><strong>人工操作优先</strong><p>发现人工暂停时，自动开启任务会安全跳过。</p></div></article>
        <article><span><Zap size={18} /></span><div><strong>失败自动重试</strong><p>平台超时将重试 3 次，随后标记异常并等待人工处理。</p></div></article>
        <article><span><Clock3 size={18} /></span><div><strong>时区与夏令时</strong><p>规则保存 IANA 时区，演示真实跨境业务的时间语义。</p></div></article>
      </section>

      {notice && <div className="toast toast--success">{notice}</div>}
      <RuleForm open={formOpen} onClose={() => setFormOpen(false)} onCreated={() => showNotice('自动化规则创建成功')} />
      <SimulationDialog rule={simulatingRule} open={Boolean(simulatingRule)} onClose={() => setSimulatingRule(null)} />
      <Modal open={Boolean(deleteTarget)} title="删除自动化规则？" description={deleteTarget?.name} onClose={() => setDeleteTarget(null)} size="small">
        <p className="confirm-copy">删除后将不再出现在规则列表中，Campaign 的规则状态也会同步更新。</p>
        <div className="modal-actions"><button className="button button--secondary" onClick={() => setDeleteTarget(null)}>取消</button><button className="button button--danger" onClick={() => { if (deleteTarget) deleteRule(deleteTarget.id); setDeleteTarget(null); showNotice('规则已删除'); }}>确认删除</button></div>
      </Modal>
    </div>
  );
}

