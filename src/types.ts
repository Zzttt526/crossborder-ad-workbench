export type Platform = 'TikTok' | 'Meta' | 'Google';
export type CampaignStatus = 'active' | 'paused' | 'pending' | 'error';
export type PauseSource = 'manual' | 'automation' | 'platform' | null;
export type LogStatus = 'success' | 'failed' | 'skipped';
export type TriggerSource = 'manual' | 'automation' | 'simulation';
export type SimulationScenario = 'success' | 'failure' | 'manual-skip';
export type RuleAction = 'pause' | 'resume';

export interface Campaign {
  id: string;
  name: string;
  campaignCode: string;
  platform: Platform;
  account: string;
  region: string;
  status: CampaignStatus;
  pauseSource: PauseSource;
  spend: number;
  revenue: number;
  conversions: number;
  cpa: number;
  roas: number;
  ruleEnabled: boolean;
  updatedAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  campaignId: string;
  startTime: string;
  stopTime: string;
  timezone: string;
  days: string[];
  enabled: boolean;
  simulationScenario: SimulationScenario;
  simulationAction: RuleAction;
  nextExecution: string;
}

export interface ExecutionStep {
  time: string;
  label: string;
  detail: string;
  state: 'done' | 'failed' | 'skipped';
}

export interface OperationLog {
  id: string;
  timestamp: string;
  platform: Platform;
  campaignId: string;
  campaignName: string;
  action: string;
  trigger: TriggerSource;
  status: LogStatus;
  durationMs: number;
  message: string;
  ruleName?: string;
  steps: ExecutionStep[];
}

export interface HourPerformance {
  hour: string;
  spend: number;
  revenue: number;
  conversions: number;
  roas: number;
  cpa: number;
}

export interface RuleDraft {
  name: string;
  campaignId: string;
  startTime: string;
  stopTime: string;
  timezone: string;
  days: string[];
  enabled: boolean;
}

export interface ExecutionResult {
  status: LogStatus;
  title: string;
  message: string;
}

