import {
  Activity,
  BarChart3,
  Bot,
  ChevronRight,
  FileClock,
  Gauge,
  Megaphone,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useWorkbench } from '../state/WorkbenchContext';
import { Modal } from './ui';

const navigation = [
  { to: '/', label: '数据概览', icon: Gauge },
  { to: '/campaigns', label: '广告管理', icon: Megaphone },
  { to: '/automation', label: '自动化规则', icon: Bot },
  { to: '/analytics', label: '时段分析', icon: BarChart3 },
  { to: '/logs', label: '操作日志', icon: FileClock },
];

const pageTitles: Record<string, { title: string; eyebrow: string }> = {
  '/': { title: '广告自动化工作台', eyebrow: '今日运营总览' },
  '/campaigns': { title: '广告管理', eyebrow: 'Campaign 控制中心' },
  '/automation': { title: '自动化规则', eyebrow: '定时投流策略' },
  '/analytics': { title: '时段效果分析', eyebrow: '低效时段识别' },
  '/logs': { title: '操作日志', eyebrow: '执行审计记录' },
};

function SidebarStatus() {
  return (
    <div className="sidebar-status">
      <div className="sidebar-status__icon"><ShieldCheck size={18} /></div>
      <div>
        <strong>系统运行正常</strong>
        <span>3 个平台 · Mock 模式</span>
      </div>
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { lastUpdated, refreshData, resetDemo } = useWorkbench();
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const page = useMemo(() => pageTitles[location.pathname] ?? pageTitles['/'], [location.pathname]);

  const handleReset = () => {
    resetDemo();
    setConfirmReset(false);
    setResetNotice(true);
    window.setTimeout(() => setResetNotice(false), 2600);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand__mark" aria-hidden="true">
            <Activity size={21} />
          </div>
          <div>
            <strong>AdPilot</strong>
            <span>Ads Automation</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="主导航">
          <span className="sidebar-nav__label">工作台</span>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link--active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight className="sidebar-link__arrow" size={15} />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar__bottom">
          <SidebarStatus />
          <p>展示环境 v0.1</p>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="topbar__eyebrow">{page.eyebrow}</span>
            <h1>{page.title}</h1>
          </div>
          <div className="topbar__actions">
            <span className="demo-badge"><span />Demo 环境 · 模拟数据</span>
            <div className="last-updated">
              <span>最近更新</span>
              <strong>{lastUpdated}</strong>
            </div>
            <button className="button button--secondary" onClick={refreshData}>
              <RefreshCw size={16} />刷新数据
            </button>
            <button className="button button--ghost" onClick={() => setConfirmReset(true)}>
              <RotateCcw size={16} />重置演示
            </button>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>

      {resetNotice && <div className="toast toast--success">演示数据已恢复到初始状态</div>}

      <Modal
        open={confirmReset}
        title="重置全部演示数据？"
        description="这会恢复 Campaign、规则和操作日志的初始状态。"
        onClose={() => setConfirmReset(false)}
        size="small"
      >
        <div className="modal-actions">
          <button className="button button--secondary" onClick={() => setConfirmReset(false)}>取消</button>
          <button className="button button--danger" onClick={handleReset}>确认重置</button>
        </div>
      </Modal>
    </div>
  );
}

