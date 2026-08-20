import { Check, CircleAlert, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useWorkbench } from '../../state/WorkbenchContext';
import type { AutomationRule, ExecutionResult } from '../../types';
import { Modal } from '../ui';

interface StepDefinition {
  label: string;
  detail: string;
  outcome: 'success' | 'failed' | 'skipped';
}

export function SimulationDialog({ rule, open, onClose }: { rule: AutomationRule | null; open: boolean; onClose: () => void }) {
  const { campaigns, executeRule } = useWorkbench();
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const campaign = campaigns.find((item) => item.id === rule?.campaignId);

  const steps = useMemo<StepDefinition[]>(() => {
    if (!rule || !campaign) return [];
    if (rule.simulationScenario === 'failure') return [
      { label: '检查 Campaign 状态', detail: '当前状态：投放中', outcome: 'success' },
      { label: '发送暂停指令', detail: '平台接口响应超时', outcome: 'failed' },
      { label: '自动重试 1/3', detail: '请求仍未响应', outcome: 'failed' },
      { label: '自动重试 2/3', detail: '请求仍未响应', outcome: 'failed' },
      { label: '自动重试 3/3', detail: '达到重试上限，转人工处理', outcome: 'failed' },
    ];
    if (rule.simulationScenario === 'manual-skip') return [
      { label: '检查 Campaign 状态', detail: '当前状态：已暂停', outcome: 'success' },
      { label: '识别暂停来源', detail: '来源：运营人员人工暂停', outcome: 'success' },
      { label: '应用人工优先策略', detail: '自动开启任务已安全跳过', outcome: 'skipped' },
    ];
    return [
      { label: '检查 Campaign 状态', detail: rule.simulationAction === 'pause' ? '当前状态：投放中' : '当前状态：已暂停', outcome: 'success' },
      { label: rule.simulationAction === 'pause' ? '发送暂停指令' : '发送开启指令', detail: 'Mock 平台指令发送成功', outcome: 'success' },
      { label: '验证 Campaign 状态', detail: rule.simulationAction === 'pause' ? '状态已变更为暂停' : '状态已变更为投放中', outcome: 'success' },
      { label: '写入操作日志', detail: '执行步骤与耗时已记录', outcome: 'success' },
    ];
  }, [campaign?.id, rule]);

  useEffect(() => {
    if (!open || !rule || steps.length === 0) return;
    setVisibleSteps(0);
    setResult(null);
    const timers: number[] = [];
    steps.forEach((_, index) => {
      timers.push(window.setTimeout(() => setVisibleSteps(index + 1), 420 + index * 520));
    });
    timers.push(window.setTimeout(() => setResult(executeRule(rule.id)), 620 + steps.length * 520));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [executeRule, open, rule, steps]);

  return (
    <Modal open={open} title="模拟执行自动化任务" description={rule && campaign ? `${rule.name} · ${campaign.name}` : ''} onClose={onClose} size="medium">
      <div className="simulation-banner"><ShieldCheck size={16} /><span>本次操作仅修改 Mock 数据，不会调用真实广告平台。</span></div>
      <div className="simulation-steps">
        {steps.map((step, index) => {
          const visible = index < visibleSteps;
          const running = index === visibleSteps;
          return (
            <div className={`simulation-step${visible ? ' simulation-step--visible' : ''}`} key={`${step.label}-${index}`}>
              <span className={`simulation-step__icon simulation-step__icon--${visible ? step.outcome : 'pending'}`}>
                {visible ? step.outcome === 'failed' ? <CircleAlert size={16} /> : <Check size={16} /> : running && !result ? <LoaderCircle className="spin" size={16} /> : <span>{index + 1}</span>}
              </span>
              <div><strong>{step.label}</strong><p>{visible ? step.detail : '等待上一步完成'}</p></div>
            </div>
          );
        })}
      </div>
      {result ? (
        <div className={`simulation-result simulation-result--${result.status}`}>
          <strong>{result.title}</strong><p>{result.message}</p>
        </div>
      ) : (
        <div className="simulation-running"><LoaderCircle className="spin" size={16} />正在执行自动化任务…</div>
      )}
      <div className="modal-actions"><button className="button button--secondary" onClick={onClose} disabled={!result}>完成</button></div>
    </Modal>
  );
}
