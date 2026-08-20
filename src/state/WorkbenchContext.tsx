import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { initialWorkbenchData } from '../data/mockData';
import type {
  AutomationRule,
  Campaign,
  ExecutionStep,
  ExecutionResult,
  OperationLog,
  RuleDraft,
} from '../types';

interface WorkbenchState {
  campaigns: Campaign[];
  rules: AutomationRule[];
  logs: OperationLog[];
  lastUpdated: string;
}

interface CreateRuleResult {
  ok: boolean;
  error?: string;
  rule?: AutomationRule;
}

interface WorkbenchContextValue extends WorkbenchState {
  refreshData: () => void;
  resetDemo: () => void;
  setCampaignStatus: (campaignId: string, status: 'active' | 'paused') => void;
  createRule: (draft: RuleDraft) => CreateRuleResult;
  toggleRule: (ruleId: string) => void;
  deleteRule: (ruleId: string) => void;
  executeRule: (ruleId: string) => ExecutionResult;
}

const STORAGE_KEY = 'adpilot-demo-state-v1';
const WorkbenchContext = createContext<WorkbenchContextValue | null>(null);

const cloneInitialState = (): WorkbenchState => structuredClone(initialWorkbenchData);

function formatNow(): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
    .format(new Date())
    .replaceAll('/', '-');
}

function loadState(): WorkbenchState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneInitialState();
    const parsed = JSON.parse(stored) as Partial<WorkbenchState>;
    if (!Array.isArray(parsed.campaigns) || !Array.isArray(parsed.rules) || !Array.isArray(parsed.logs)) {
      return cloneInitialState();
    }
    return {
      campaigns: parsed.campaigns,
      rules: parsed.rules,
      logs: parsed.logs,
      lastUpdated: parsed.lastUpdated ?? initialWorkbenchData.lastUpdated,
    };
  } catch {
    return cloneInitialState();
  }
}

function logSteps(action: string, message: string, finalState: OperationLog['status']): ExecutionStep[] {
  const stepState = finalState === 'failed' ? 'failed' : finalState === 'skipped' ? 'skipped' : 'done';
  return [
    { time: '00:00:00', label: '检查 Campaign 状态', detail: '读取 Mock 平台最新状态', state: 'done' as const },
    { time: '00:00:01', label: action, detail: message, state: stepState },
    ...(finalState === 'success'
      ? [{ time: '00:00:02', label: '验证 Campaign 状态', detail: '状态二次校验通过', state: 'done' as const }]
      : []),
  ];
}

export function WorkbenchProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WorkbenchState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const refreshData = useCallback(() => {
    setState((current) => ({ ...current, lastUpdated: formatNow() }));
  }, []);

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(cloneInitialState());
  }, []);

  const setCampaignStatus = useCallback((campaignId: string, status: 'active' | 'paused') => {
    setState((current) => {
      const target = current.campaigns.find((campaign) => campaign.id === campaignId);
      if (!target || target.status === status) return current;
      const action = status === 'paused' ? '人工暂停' : '人工开启';
      const message = status === 'paused' ? '运营人员手动暂停 Campaign' : '运营人员手动恢复 Campaign';
      const timestamp = formatNow();
      const nextLog: OperationLog = {
        id: `log-manual-${Date.now()}`,
        timestamp,
        platform: target.platform,
        campaignId: target.id,
        campaignName: target.name,
        action,
        trigger: 'manual',
        status: 'success',
        durationMs: 420,
        message,
        steps: logSteps(action, message, 'success'),
      };
      return {
        ...current,
        lastUpdated: timestamp,
        campaigns: current.campaigns.map((campaign) =>
          campaign.id === campaignId
            ? {
                ...campaign,
                status,
                pauseSource: status === 'paused' ? 'manual' : null,
                updatedAt: timestamp,
              }
            : campaign,
        ),
        logs: [nextLog, ...current.logs],
      };
    });
  }, []);

  const createRule = useCallback((draft: RuleDraft): CreateRuleResult => {
    if (!draft.name.trim()) return { ok: false, error: '请输入规则名称。' };
    if (!draft.campaignId) return { ok: false, error: '请选择 Campaign。' };
    if (draft.startTime === draft.stopTime) return { ok: false, error: '开启时间和关闭时间不能相同。' };
    if (draft.days.length === 0) return { ok: false, error: '至少选择一个执行日期。' };

    let result: CreateRuleResult = { ok: false, error: '规则创建失败。' };
    setState((current) => {
      const campaign = current.campaigns.find((item) => item.id === draft.campaignId);
      if (!campaign) {
        result = { ok: false, error: '未找到所选 Campaign。' };
        return current;
      }
      const conflict = current.rules.some(
        (rule) => rule.campaignId === draft.campaignId && rule.enabled && draft.enabled,
      );
      if (conflict) {
        result = { ok: false, error: '该 Campaign 已存在启用中的自动化规则，请先停用原规则。' };
        return current;
      }
      const rule: AutomationRule = {
        id: `rule-${Date.now()}`,
        ...draft,
        simulationScenario: 'success',
        simulationAction: 'pause',
        nextExecution: `今天 ${draft.stopTime} · 自动暂停`,
      };
      result = { ok: true, rule };
      return {
        ...current,
        rules: [rule, ...current.rules],
        campaigns: current.campaigns.map((item) =>
          item.id === draft.campaignId ? { ...item, ruleEnabled: draft.enabled } : item,
        ),
      };
    });
    return result;
  }, []);

  const toggleRule = useCallback((ruleId: string) => {
    setState((current) => ({
      ...current,
      rules: current.rules.map((rule) =>
        rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule,
      ),
    }));
  }, []);

  const deleteRule = useCallback((ruleId: string) => {
    setState((current) => {
      const target = current.rules.find((rule) => rule.id === ruleId);
      if (!target) return current;
      const remainingRules = current.rules.filter((rule) => rule.id !== ruleId);
      const stillEnabled = remainingRules.some(
        (rule) => rule.campaignId === target.campaignId && rule.enabled,
      );
      return {
        ...current,
        rules: remainingRules,
        campaigns: current.campaigns.map((campaign) =>
          campaign.id === target.campaignId ? { ...campaign, ruleEnabled: stillEnabled } : campaign,
        ),
      };
    });
  }, []);

  const executeRule = useCallback((ruleId: string): ExecutionResult => {
    let result: ExecutionResult = {
      status: 'failed',
      title: '任务执行失败',
      message: '未找到自动化规则。',
    };
    setState((current) => {
      const rule = current.rules.find((item) => item.id === ruleId);
      const campaign = rule
        ? current.campaigns.find((item) => item.id === rule.campaignId)
        : undefined;
      if (!rule || !campaign) return current;

      const timestamp = formatNow();
      const action = rule.simulationAction === 'pause' ? '自动暂停' : '自动开启';
      let status: OperationLog['status'] = 'success';
      let message = rule.simulationAction === 'pause'
        ? 'Campaign 已暂停并完成状态验证'
        : 'Campaign 已开启并完成状态验证';

      if (rule.simulationScenario === 'failure') {
        status = 'failed';
        message = '广告平台接口超时，已完成 3 次重试';
        result = { status, title: '自动关闭失败', message };
      } else if (rule.simulationScenario === 'manual-skip' || (rule.simulationAction === 'resume' && campaign.pauseSource === 'manual')) {
        status = 'skipped';
        message = '检测到 Campaign 由运营人员手动暂停，本次自动开启已跳过';
        result = { status, title: '任务已安全跳过', message };
      } else {
        result = { status, title: '自动化任务执行成功', message };
      }

      const nextLog: OperationLog = {
        id: `log-sim-${Date.now()}`,
        timestamp,
        platform: campaign.platform,
        campaignId: campaign.id,
        campaignName: campaign.name,
        action,
        trigger: 'simulation',
        status,
        durationMs: status === 'failed' ? 3260 : status === 'skipped' ? 740 : 2140,
        message,
        ruleName: rule.name,
        steps: status === 'failed'
          ? [
              { time: '00:00:00', label: '检查 Campaign 状态', detail: `当前状态：${campaign.status}`, state: 'done' as const },
              { time: '00:00:01', label: '发送暂停指令', detail: 'API Timeout', state: 'failed' as const },
              { time: '00:00:03', label: '重试 3/3', detail: '平台接口仍未响应', state: 'failed' as const },
            ]
          : logSteps(action, message, status),
      };

      return {
        ...current,
        lastUpdated: timestamp,
        campaigns: current.campaigns.map((item) => {
          if (item.id !== campaign.id || status !== 'success') return item;
          return {
            ...item,
            status: rule.simulationAction === 'pause' ? 'paused' : 'active',
            pauseSource: rule.simulationAction === 'pause' ? 'automation' : null,
            updatedAt: timestamp,
          };
        }),
        logs: [nextLog, ...current.logs],
      };
    });
    return result;
  }, []);

  const value = useMemo<WorkbenchContextValue>(
    () => ({
      ...state,
      refreshData,
      resetDemo,
      setCampaignStatus,
      createRule,
      toggleRule,
      deleteRule,
      executeRule,
    }),
    [state, refreshData, resetDemo, setCampaignStatus, createRule, toggleRule, deleteRule, executeRule],
  );

  return <WorkbenchContext.Provider value={value}>{children}</WorkbenchContext.Provider>;
}

export function useWorkbench() {
  const context = useContext(WorkbenchContext);
  if (!context) throw new Error('useWorkbench 必须在 WorkbenchProvider 内使用');
  return context;
}
