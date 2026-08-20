import { ArrowDownRight, Calculator, Clock3, Info, TrendingUp } from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { hourlyPerformance } from '../data/mockData';

const segments = [
  { period: '00:00–06:00', spend: 233, conversions: 8, cpa: 29.13, roas: 0.92, tone: 'poor' },
  { period: '06:00–12:00', spend: 510, conversions: 39, cpa: 13.08, roas: 3.48, tone: 'good' },
  { period: '12:00–18:00', spend: 604, conversions: 48, cpa: 12.58, roas: 4.06, tone: 'best' },
  { period: '18:00–24:00', spend: 485, conversions: 34, cpa: 14.26, roas: 3.31, tone: 'good' },
];

export function AnalyticsPage() {
  return (
    <div className="page-stack">
      <section className="analysis-hero">
        <div>
          <span className="section-kicker section-kicker--amber">分析结论</span>
          <h2>00:00–06:00 是当前账户表现最差的投放时段</h2>
          <p>凌晨 ROAS 仅为 0.92，比全天平均值低约 72%。建议先用固定规则暂停低效 Campaign，再观察 7–14 天表现。</p>
        </div>
        <div className="analysis-hero__metrics">
          <div><ArrowDownRight size={18} /><span>凌晨 ROAS</span><strong>0.92</strong></div>
          <div><TrendingUp size={18} /><span>全天平均</span><strong>3.26</strong></div>
          <div><Clock3 size={18} /><span>建议关闭</span><strong>6 小时</strong></div>
        </div>
      </section>

      <section className="panel analytics-chart-panel">
        <div className="panel__header">
          <div><span className="section-kicker">每小时数据</span><h2>广告消耗与 ROAS 对比</h2></div>
          <span className="demo-badge demo-badge--plain">最近 7 日均值</span>
        </div>
        <div className="analytics-chart" aria-label="每小时消耗与 ROAS 图表">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={hourlyPerformance} margin={{ top: 10, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid stroke="#e7ecf3" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#77839a', fontSize: 11 }} interval={1} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#77839a', fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 6]} axisLine={false} tickLine={false} tick={{ fill: '#77839a', fontSize: 11 }} />
              <Tooltip contentStyle={{ border: '1px solid #dfe5ee', borderRadius: 10 }} />
              <Legend iconType="circle" />
              <Bar yAxisId="left" dataKey="spend" name="广告消耗 ($)" fill="#dbe7fb" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="roas" name="ROAS" stroke="#2563eb" strokeWidth={2.5} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="analytics-bottom-grid">
        <article className="panel">
          <div className="panel__header"><div><span className="section-kicker">分段表现</span><h2>时段数据表</h2></div></div>
          <div className="segment-table">
            <div className="segment-row segment-row--header"><span>时间段</span><span>消耗</span><span>转化</span><span>CPA</span><span>ROAS</span></div>
            {segments.map((segment) => (
              <div className={`segment-row segment-row--${segment.tone}`} key={segment.period}>
                <strong>{segment.period}</strong>
                <span>${segment.spend}</span>
                <span>{segment.conversions}</span>
                <span>${segment.cpa}</span>
                <strong>{segment.roas.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="savings-card">
          <span className="savings-card__icon"><Calculator size={22} /></span>
          <span className="section-kicker section-kicker--green">预算节省模拟</span>
          <h2>预计每月减少低效支出</h2>
          <strong className="savings-card__value">约 $5,800</strong>
          <div className="savings-formula">
            <div><span>近 7 日凌晨消耗</span><strong>$1,420</strong></div>
            <div><span>凌晨时段 ROAS</span><strong>0.83</strong></div>
            <div><span>月度简单外推</span><strong>$5,800</strong></div>
          </div>
          <p><Info size={15} />模拟测算，不代表实际收益；未计入关闭时段可能损失的转化。</p>
        </article>
      </section>
    </div>
  );
}

