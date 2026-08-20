import {
  ExternalLink,
  Filter,
  Pause,
  Play,
  Search,
  ShieldAlert,
  SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { CampaignStatusBadge, EmptyState, Modal, PlatformBadge } from '../components/ui';
import { useWorkbench } from '../state/WorkbenchContext';
import type { Campaign, CampaignStatus, Platform } from '../types';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const statusOptions: Array<{ value: CampaignStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部状态' },
  { value: 'active', label: '投放中' },
  { value: 'paused', label: '已暂停' },
  { value: 'error', label: '执行异常' },
];

export function CampaignsPage() {
  const { campaigns, setCampaignStatus } = useWorkbench();
  const [query, setQuery] = useState('');
  const [platform, setPlatform] = useState<Platform | 'all'>('all');
  const [status, setStatus] = useState<CampaignStatus | 'all'>('all');
  const [region, setRegion] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<{ campaign: Campaign; nextStatus: 'active' | 'paused' } | null>(null);
  const [notice, setNotice] = useState('');

  const selectedCampaign = campaigns.find((campaign) => campaign.id === selectedId) ?? null;
  const regions = useMemo(() => Array.from(new Set(campaigns.map((campaign) => campaign.region))), [campaigns]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return campaigns.filter((campaign) => {
      const matchesSearch = !normalizedQuery || `${campaign.name} ${campaign.campaignCode} ${campaign.account}`.toLowerCase().includes(normalizedQuery);
      return matchesSearch
        && (platform === 'all' || campaign.platform === platform)
        && (status === 'all' || campaign.status === status)
        && (region === 'all' || campaign.region === region);
    });
  }, [campaigns, platform, query, region, status]);

  const confirmAction = () => {
    if (!pendingAction) return;
    setCampaignStatus(pendingAction.campaign.id, pendingAction.nextStatus);
    setNotice(pendingAction.nextStatus === 'paused' ? 'Campaign 已人工暂停' : 'Campaign 已人工开启');
    setPendingAction(null);
    window.setTimeout(() => setNotice(''), 2400);
  };

  return (
    <div className="page-stack">
      <section className="campaign-summary">
        <div>
          <span className="section-kicker">实时状态</span>
          <h2>{campaigns.length} 条 Campaign 正在统一管理</h2>
          <p>手动操作会立即写入操作日志；人工暂停的 Campaign 不会被自动任务擅自恢复。</p>
        </div>
        <div className="campaign-summary__stats">
          <span><strong>{campaigns.filter((item) => item.status === 'active').length}</strong>投放中</span>
          <span><strong>{campaigns.filter((item) => item.status === 'paused').length}</strong>已暂停</span>
          <span><strong>{campaigns.filter((item) => item.pauseSource === 'manual').length}</strong>人工保护</span>
        </div>
      </section>

      <section className="panel campaigns-panel">
        <div className="filters-bar">
          <label className="search-field">
            <Search size={17} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索 Campaign、ID 或账户" aria-label="搜索 Campaign" />
          </label>
          <label className="select-field"><Filter size={16} /><select value={platform} onChange={(event) => setPlatform(event.target.value as Platform | 'all')} aria-label="按平台筛选"><option value="all">全部平台</option><option value="TikTok">TikTok</option><option value="Meta">Meta</option><option value="Google">Google</option></select></label>
          <label className="select-field"><SlidersHorizontal size={16} /><select value={status} onChange={(event) => setStatus(event.target.value as CampaignStatus | 'all')} aria-label="按状态筛选">{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label className="select-field"><select value={region} onChange={(event) => setRegion(event.target.value)} aria-label="按地区筛选"><option value="all">全部地区</option>{regions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
          <span className="filters-result">显示 {filtered.length} / {campaigns.length}</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="没有符合条件的 Campaign" description="调整搜索词或筛选条件后再试。" />
        ) : (
          <div className="data-table-wrap">
            <table className="data-table campaigns-table">
              <thead><tr><th>平台 / Campaign</th><th>地区</th><th>状态</th><th>今日消耗</th><th>转化</th><th>CPA</th><th>ROAS</th><th>自动规则</th><th>操作</th></tr></thead>
              <tbody>
                {filtered.map((campaign) => (
                  <tr key={campaign.id}>
                    <td>
                      <button className="campaign-name" onClick={() => setSelectedId(campaign.id)}>
                        <PlatformBadge platform={campaign.platform} />
                        <span><strong>{campaign.name}</strong><small>{campaign.campaignCode}</small></span>
                      </button>
                    </td>
                    <td>{campaign.region}</td>
                    <td><CampaignStatusBadge status={campaign.status} />{campaign.pauseSource === 'manual' && <span className="manual-lock"><ShieldAlert size={13} />人工保护</span>}</td>
                    <td className="numeric">{money.format(campaign.spend)}</td>
                    <td className="numeric">{campaign.conversions}</td>
                    <td className="numeric">{money.format(campaign.cpa)}</td>
                    <td><strong className={campaign.roas < 1.5 ? 'text-red' : campaign.roas >= 3.5 ? 'text-green' : ''}>{campaign.roas.toFixed(2)}</strong></td>
                    <td>{campaign.ruleEnabled ? <span className="rule-state rule-state--on">已开启</span> : <span className="rule-state">未开启</span>}</td>
                    <td>
                      <div className="row-actions">
                        {campaign.status === 'active' ? (
                          <button className="icon-text-button icon-text-button--danger" onClick={() => setPendingAction({ campaign, nextStatus: 'paused' })}><Pause size={14} />暂停</button>
                        ) : (
                          <button className="icon-text-button icon-text-button--success" onClick={() => setPendingAction({ campaign, nextStatus: 'active' })}><Play size={14} />开启</button>
                        )}
                        <button className="icon-button" aria-label={`查看 ${campaign.name} 详情`} onClick={() => setSelectedId(campaign.id)}><ExternalLink size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {notice && <div className="toast toast--success">{notice}，已生成操作日志</div>}

      <Modal open={Boolean(selectedCampaign)} title={selectedCampaign?.name ?? ''} description={selectedCampaign ? `${selectedCampaign.platform} · ${selectedCampaign.campaignCode}` : ''} onClose={() => setSelectedId(null)} size="large">
        {selectedCampaign && (
          <div className="campaign-detail">
            <div className="detail-status-row">
              <CampaignStatusBadge status={selectedCampaign.status} />
              <span>最近更新：{selectedCampaign.updatedAt}</span>
            </div>
            <div className="detail-metrics">
              <div><span>今日消耗</span><strong>{money.format(selectedCampaign.spend)}</strong></div>
              <div><span>广告销售额</span><strong>{money.format(selectedCampaign.revenue)}</strong></div>
              <div><span>转化</span><strong>{selectedCampaign.conversions}</strong></div>
              <div><span>CPA</span><strong>{money.format(selectedCampaign.cpa)}</strong></div>
              <div><span>ROAS</span><strong>{selectedCampaign.roas.toFixed(2)}</strong></div>
            </div>
            <div className="detail-section">
              <h3>Campaign 信息</h3>
              <dl><div><dt>广告账户</dt><dd>{selectedCampaign.account}</dd></div><div><dt>投放地区</dt><dd>{selectedCampaign.region}</dd></div><div><dt>暂停来源</dt><dd>{selectedCampaign.pauseSource === 'manual' ? '人工操作' : selectedCampaign.pauseSource === 'automation' ? '自动规则' : '—'}</dd></div><div><dt>自动规则</dt><dd>{selectedCampaign.ruleEnabled ? '已启用' : '未启用'}</dd></div></dl>
            </div>
            <div className="modal-actions modal-actions--spread">
              <span className="simulation-note">Demo 操作不会调用真实广告平台</span>
              {selectedCampaign.status === 'active' ? <button className="button button--danger" onClick={() => { setSelectedId(null); setPendingAction({ campaign: selectedCampaign, nextStatus: 'paused' }); }}><Pause size={16} />立即暂停</button> : <button className="button button--primary" onClick={() => { setSelectedId(null); setPendingAction({ campaign: selectedCampaign, nextStatus: 'active' }); }}><Play size={16} />立即开启</button>}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={Boolean(pendingAction)} title={pendingAction?.nextStatus === 'paused' ? '确认暂停 Campaign？' : '确认开启 Campaign？'} description={pendingAction?.campaign.name} onClose={() => setPendingAction(null)} size="small">
        <p className="confirm-copy">该操作将模拟发送平台指令，并同步更新 Dashboard 和操作日志。</p>
        <div className="modal-actions"><button className="button button--secondary" onClick={() => setPendingAction(null)}>取消</button><button className={pendingAction?.nextStatus === 'paused' ? 'button button--danger' : 'button button--primary'} onClick={confirmAction}>确认{pendingAction?.nextStatus === 'paused' ? '暂停' : '开启'}</button></div>
      </Modal>
    </div>
  );
}
