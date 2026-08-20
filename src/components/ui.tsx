import { X } from 'lucide-react';
import { useEffect, useRef, type ReactNode } from 'react';
import type { CampaignStatus, LogStatus, Platform } from '../types';

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  size = 'medium',
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'small' | 'medium' | 'large';
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`modal modal--${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="modal__header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button ref={closeButtonRef} className="icon-button" aria-label="关闭弹窗" onClick={onClose}>
            <X size={18} />
          </button>
        </header>
        <div className="modal__content">{children}</div>
      </section>
    </div>
  );
}

export function PlatformBadge({ platform }: { platform: Platform }) {
  const short = platform === 'TikTok' ? 'TK' : platform === 'Google' ? 'G' : 'M';
  return (
    <span className={`platform platform--${platform.toLowerCase()}`}>
      <span aria-hidden="true">{short}</span>
      {platform}
    </span>
  );
}

const campaignStatusLabels: Record<CampaignStatus, string> = {
  active: '投放中',
  paused: '已暂停',
  pending: '等待执行',
  error: '执行异常',
};

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className="status-badge__dot" aria-hidden="true" />
      {campaignStatusLabels[status]}
    </span>
  );
}

const logStatusLabels: Record<LogStatus, string> = {
  success: '成功',
  failed: '失败',
  skipped: '已跳过',
};

export function LogStatusBadge({ status }: { status: LogStatus }) {
  return <span className={`log-status log-status--${status}`}>{logStatusLabels[status]}</span>;
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tone = 'blue',
}: {
  label: string;
  value: string;
  helper: string;
  icon: ReactNode;
  tone?: 'blue' | 'green' | 'amber' | 'slate';
}) {
  return (
    <article className="metric-card">
      <div className={`metric-card__icon metric-card__icon--${tone}`}>{icon}</div>
      <div className="metric-card__copy">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{helper}</small>
      </div>
    </article>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="empty-state" role="status">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

