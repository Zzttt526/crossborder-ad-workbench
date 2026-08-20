import {
  ArrowRight,
  Bot,
  CircleDollarSign,
  Clock3,
  Megaphone,
  MousePointerClick,
  ShoppingBag,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { hourlyPerformance } from '../data/mockData';
import { useWorkbench } from '../state/WorkbenchContext';
import type { Platform } from '../types';
import { LogStatusBadge, MetricCard, PlatformBadge } from '../components/ui';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function DashboardPage() {
  const navigate = useNavigate();
  const { campaigns, rules, logs } = useWorkbench();

  const totals = useMemo(() => {
    const spend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);
    const revenue = campaigns.reduce((sum, campaign) => sum + campaign.revenue, 0);
    const conversions = campaigns.reduce((sum, campaign) => sum + campaign.conversions, 0);
    return {
      spend,
      revenue,
      conversions,
      roas: revenue / spend,
      active: campaigns.filter((campaign) => campaign.status === 'active').length,
      abnormal: campaigns.filter((campaign) => campaign.status === 'error').length,
    };
  }, [campaigns]);

  const platformStats = useMemo(
    () => (['TikTok', 'Meta', 'Google'] as Platform[]).map((platform) => {
      const items = campaigns.filter((campaign) => campaign.platform === platform);
      const spend = items.reduce((sum, campaign) => sum + campaign.spend, 0);
      const revenue = items.reduce((sum, campaign) => sum + campaign.revenue, 0);
      return {
        platform,
        count: items.length,
        spend,
        roas: revenue / spend,
        active: items.filter((campaign) => campaign.status === 'active').length,
      };
    }),
    [campaigns],
  );

  const chartData = hourlyPerformance.map((item) => ({
    ...item,
    lowEfficiency: Number(item.hour.slice(0, 2)) < 6 ? item.roas : null,
  }));

  return (
    <div className="page-stack">
      <section className="metrics-grid" aria-label="今日核心指标">
        <MetricCard label="今日广告消耗" value={money.format(totals.spend)} helper="较昨日 +6.2%" icon={<CircleDollarSign size={19} />} tone="blue" />
        <MetricCard label="广告销售额" value={money.format(totals.revenue)} helper="较昨日 +11.8%" icon={<ShoppingBag size={19} />} tone="green" />
        <MetricCard label="综合 ROAS" value={totals.roas.toFixed(2)} helper="目标值 3.20" icon={<TrendingUp size={19} />} tone="green" />
        <MetricCard label="今日转化" value={String(totals.conversions)} helper="较昨日 +9.1%" icon={<MousePointerClick size={19} />} tone="blue" />
        <MetricCard label="投放中广告" value={String(totals.active)} helper={`${campaigns.length - totals.active} 条暂停或异常`} icon={<Megaphone size={19} />} tone="slate" />
        <MetricCard label="今日自动任务" value="12" helper="成功 11 · 失败 1" icon={<Bot size={19} />} tone="amber" />
      </section>

      <section className="dashboard-grid dashboard-grid--hero">
        <article className="insight-card">
          <div className="insight-card__header">
            <span className="insight-card__icon"><Sparkles size={20} /></span>
            <div>
              <span className="section-kicker section-kicker--amber">低效投放提醒</span>
              <h2>凌晨预算正在低回报时段持续消耗</h2>
            </div>
          </div>
          <div className="insight-card__numbers">
            <div><span>低效时段</span><strong>00:00–06:00</strong></div>
            <div><span>时段 ROAS</span><strong className="text-amber">0.92</strong></div>
            <div><span>全天平均</span><strong>3.26</strong></div>
            <div><span>效率差距</span><strong className="text-red">−72%</strong></div>
          </div>
          <div className="insight-card__footer">
            <p>按近 7 日数据简单外推，预计每月可减少约 <strong>$5,800</strong> 低效广告支出。</p>
            <button className="button button--primary" onClick={() => navigate('/automation?create=1')}>
              创建自动关闭规则<ArrowRight size={16} />
            </button>
          </div>
        </article>

        <article className="panel automation-pulse">
          <div className="panel__header">
            <div><span className="section-kicker">自动化脉冲</span><h2>下一次任务</h2></div>
            <span className="live-indicator"><span />调度正常</span>
          </div>
          <div className="pulse-track">
            <div className="pulse-track__line" />
            <div className="pulse-event pulse-event--active">
              <span className="pulse-event__dot"><Clock3 size={15} /></span>
              <small>00:30</small>
              <strong>Google 暂停</strong>
              <p>US-Product-C</p>
            </div>
            <div className="pulse-event">
              <span className="pulse-event__dot"><Bot size={15} /></span>
              <small>01:00</small>
              <strong>TikTok 暂停</strong>
              <p>US-Product-A</p>
            </div>
            <div className="pulse-event">
              <span className="pulse-event__dot"><TrendingUp size={15} /></span>
              <small>08:00</small>
              <strong>自动恢复</strong>
              <p>2 个 Campaign</p>
            </div>
          </div>
          <div className="pulse-summary">
            <span>{rules.filter((rule) => rule.enabled).length} 条规则运行中</span>
            <button className="text-button" onClick={() => navigate('/automation')}>查看规则<ArrowRight size={14} /></button>
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid--main">
        <article className="panel chart-panel">
          <div className="panel__header">
            <div><span className="section-kicker">24 小时表现</span><h2>ROAS 时段趋势</h2></div>
            <div className="chart-legend"><span><i className="legend-dot legend-dot--blue" />ROAS</span><span><i className="legend-dot legend-dot--amber" />低效区间</span></div>
          </div>
          <div className="chart-wrap" aria-label="24 小时 ROAS 趋势图">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="roasFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#e7ecf3" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#77839a', fontSize: 11 }} interval={2} />
                <YAxis domain={[0, 6]} axisLine={false} tickLine={false} tick={{ fill: '#77839a', fontSize: 11 }} />
                <Tooltip contentStyle={{ border: '1px solid #dfe5ee', borderRadius: 10, boxShadow: '0 12px 30px rgba(15,23,42,.10)' }} formatter={(value) => [Number(value).toFixed(2), 'ROAS']} />
                <Area type="monotone" dataKey="roas" stroke="#2563eb" strokeWidth={2.5} fill="url(#roasFill)" />
                <Area type="monotone" dataKey="lowEfficiency" stroke="#d97706" strokeWidth={2.5} fill="transparent" connectNulls={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel platform-panel">
          <div className="panel__header">
            <div><span className="section-kicker">渠道健康度</span><h2>广告平台概览</h2></div>
          </div>
          <div className="platform-list">
            {platformStats.map((item) => (
              <div className="platform-row" key={item.platform}>
                <PlatformBadge platform={item.platform} />
                <div className="platform-row__metric"><span>Campaign</span><strong>{item.count}</strong></div>
                <div className="platform-row__metric"><span>今日消耗</span><strong>{money.format(item.spend)}</strong></div>
                <div className="platform-row__metric"><span>ROAS</span><strong>{item.roas.toFixed(2)}</strong></div>
                <span className="health-label"><span />{item.active} 条运行</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="panel recent-panel">
        <div className="panel__header">
          <div><span className="section-kicker">执行记录</span><h2>最近自动化任务</h2></div>
          <button className="text-button" onClick={() => navigate('/logs')}>查看全部日志<ArrowRight size={14} /></button>
        </div>
        <div className="recent-table">
          {logs.slice(0, 4).map((item) => (
            <div className="recent-row" key={item.id}>
              <span className="recent-row__time">{item.timestamp}</span>
              <PlatformBadge platform={item.platform} />
              <strong>{item.campaignName}</strong>
              <span>{item.action}</span>
              <LogStatusBadge status={item.status} />
              <small>{(item.durationMs / 1000).toFixed(1)}s</small>
            </div>
          ))}
        </div>
      </section>

      <p className="data-disclaimer">以上均为 Mock 模拟数据；预算节省为简单外推，未计入关闭时段可能损失的转化。</p>
    </div>
  );
}

