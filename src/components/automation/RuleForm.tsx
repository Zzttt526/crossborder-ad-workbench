import { CalendarDays, Clock3, Globe2 } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { useWorkbench } from '../../state/WorkbenchContext';
import type { RuleDraft } from '../../types';
import { Modal, PlatformBadge } from '../ui';

const allDays = ['一', '二', '三', '四', '五', '六', '日'];
const timezones = [
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Asia/Singapore',
  'Asia/Shanghai',
];

const initialDraft: RuleDraft = {
  name: '',
  campaignId: '',
  startTime: '08:00',
  stopTime: '01:00',
  timezone: 'America/New_York',
  days: [...allDays],
  enabled: true,
};

export function RuleForm({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { campaigns, createRule } = useWorkbench();
  const [draft, setDraft] = useState<RuleDraft>(initialDraft);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDraft(initialDraft);
      setError('');
    }
  }, [open]);

  const toggleDay = (day: string) => {
    setDraft((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((item) => item !== day)
        : [...current.days, day],
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = createRule(draft);
    if (!result.ok) {
      setError(result.error ?? '规则创建失败。');
      return;
    }
    onCreated();
    onClose();
  };

  return (
    <Modal open={open} title="新建自动化规则" description="设置广告暂停与恢复时间；当前仅保存为 Mock 规则。" onClose={onClose} size="large">
      <form className="rule-form" onSubmit={handleSubmit}>
        <label className="form-field form-field--full">
          <span>规则名称</span>
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="例如：美国凌晨低效停投" />
        </label>

        <label className="form-field form-field--full">
          <span>Campaign</span>
          <select value={draft.campaignId} onChange={(event) => setDraft({ ...draft, campaignId: event.target.value })}>
            <option value="">选择一个 Mock Campaign</option>
            {campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.platform} · {campaign.name} · {campaign.region}</option>)}
          </select>
          {draft.campaignId && <div className="selected-campaign">{(() => { const item = campaigns.find((campaign) => campaign.id === draft.campaignId); return item ? <><PlatformBadge platform={item.platform} /><span>{item.account}</span></> : null; })()}</div>}
        </label>

        <label className="form-field">
          <span><Clock3 size={15} />自动开启时间</span>
          <input type="time" value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} />
        </label>
        <label className="form-field">
          <span><Clock3 size={15} />自动关闭时间</span>
          <input type="time" value={draft.stopTime} onChange={(event) => setDraft({ ...draft, stopTime: event.target.value })} />
        </label>

        <label className="form-field form-field--full">
          <span><Globe2 size={15} />执行时区</span>
          <select value={draft.timezone} onChange={(event) => setDraft({ ...draft, timezone: event.target.value })}>
            {timezones.map((timezone) => <option key={timezone} value={timezone}>{timezone}</option>)}
          </select>
          <small>使用 IANA 时区，自动适配当地夏令时。</small>
        </label>

        <fieldset className="days-field form-field--full">
          <legend><CalendarDays size={15} />执行日期</legend>
          <div className="days-selector">
            {allDays.map((day) => <button type="button" key={day} className={draft.days.includes(day) ? 'day-button day-button--active' : 'day-button'} onClick={() => toggleDay(day)}>周{day}</button>)}
          </div>
        </fieldset>

        <label className="toggle-field form-field--full">
          <span><strong>创建后立即启用</strong><small>规则会出现在调度列表中，可随时停用。</small></span>
          <input type="checkbox" checked={draft.enabled} onChange={(event) => setDraft({ ...draft, enabled: event.target.checked })} />
        </label>

        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="modal-actions form-field--full">
          <button type="button" className="button button--secondary" onClick={onClose}>取消</button>
          <button type="submit" className="button button--primary">保存规则</button>
        </div>
      </form>
    </Modal>
  );
}
