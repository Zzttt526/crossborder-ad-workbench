import type {
  AutomationRule,
  Campaign,
  HourPerformance,
  OperationLog,
  Platform,
} from '../types';

const nowLabel = '2026-08-20 14:32';

function campaign(
  input: Omit<Campaign, 'revenue' | 'cpa' | 'updatedAt'>,
): Campaign {
  return {
    ...input,
    revenue: Number((input.spend * input.roas).toFixed(2)),
    cpa: Number((input.spend / Math.max(input.conversions, 1)).toFixed(2)),
    updatedAt: nowLabel,
  };
}

export const initialCampaigns: Campaign[] = [
  campaign({ id: 'campaign-tiktok-a', name: 'US-Product-A', campaignCode: 'TT-US-24081', platform: 'TikTok', account: 'US Growth 01', region: '美国', status: 'active', pauseSource: null, spend: 326.4, conversions: 32, roas: 4.25, ruleEnabled: true }),
  campaign({ id: 'campaign-tiktok-retarget', name: 'US-Retargeting-Core', campaignCode: 'TT-US-24096', platform: 'TikTok', account: 'US Growth 01', region: '美国', status: 'active', pauseSource: null, spend: 212.8, conversions: 21, roas: 3.92, ruleEnabled: true }),
  campaign({ id: 'campaign-tiktok-ca', name: 'CA-Creator-Scale', campaignCode: 'TT-CA-18820', platform: 'TikTok', account: 'CA Market', region: '加拿大', status: 'active', pauseSource: null, spend: 148.2, conversions: 14, roas: 3.15, ruleEnabled: false }),
  campaign({ id: 'campaign-tiktok-au', name: 'AU-New-Creative-Test', campaignCode: 'TT-AU-09314', platform: 'TikTok', account: 'AU Store', region: '澳大利亚', status: 'paused', pauseSource: 'automation', spend: 83.1, conversions: 5, roas: 1.42, ruleEnabled: true }),
  campaign({ id: 'campaign-tiktok-uk', name: 'UK-Scale-Prospecting', campaignCode: 'TT-UK-30218', platform: 'TikTok', account: 'UK Market', region: '英国', status: 'active', pauseSource: null, spend: 187.5, conversions: 18, roas: 3.68, ruleEnabled: false }),
  campaign({ id: 'campaign-meta-uk', name: 'UK-Brand-B', campaignCode: 'META-UK-7712', platform: 'Meta', account: 'UK Commerce', region: '英国', status: 'paused', pauseSource: 'manual', spend: 215.3, conversions: 19, roas: 3.6, ruleEnabled: true }),
  campaign({ id: 'campaign-meta-us', name: 'US-Catalog-Advantage', campaignCode: 'META-US-8841', platform: 'Meta', account: 'US Commerce', region: '美国', status: 'active', pauseSource: null, spend: 271.8, conversions: 26, roas: 4.01, ruleEnabled: true }),
  campaign({ id: 'campaign-meta-ca', name: 'CA-Prospecting-Open', campaignCode: 'META-CA-3924', platform: 'Meta', account: 'CA Market', region: '加拿大', status: 'active', pauseSource: null, spend: 134.7, conversions: 11, roas: 2.88, ruleEnabled: false }),
  campaign({ id: 'campaign-meta-au', name: 'AU-Retargeting-DPA', campaignCode: 'META-AU-1185', platform: 'Meta', account: 'AU Store', region: '澳大利亚', status: 'active', pauseSource: null, spend: 121.4, conversions: 12, roas: 3.44, ruleEnabled: false }),
  campaign({ id: 'campaign-google-c', name: 'US-Product-C', campaignCode: 'GGL-US-50831', platform: 'Google', account: 'US Search', region: '美国', status: 'active', pauseSource: null, spend: 98.6, conversions: 4, roas: 1.12, ruleEnabled: true }),
  campaign({ id: 'campaign-google-brand', name: 'US-Brand-Search', campaignCode: 'GGL-US-51109', platform: 'Google', account: 'US Search', region: '美国', status: 'active', pauseSource: null, spend: 176.9, conversions: 24, roas: 5.12, ruleEnabled: false }),
  campaign({ id: 'campaign-google-uk', name: 'UK-Shopping-Core', campaignCode: 'GGL-UK-22801', platform: 'Google', account: 'UK Search', region: '英国', status: 'paused', pauseSource: 'automation', spend: 109.2, conversions: 8, roas: 2.08, ruleEnabled: true }),
];

export const initialRules: AutomationRule[] = [
  {
    id: 'rule-us-night',
    name: '美国凌晨低效停投',
    campaignId: 'campaign-tiktok-a',
    startTime: '08:00',
    stopTime: '01:00',
    timezone: 'America/New_York',
    days: ['一', '二', '三', '四', '五', '六', '日'],
    enabled: true,
    simulationScenario: 'success',
    simulationAction: 'pause',
    nextExecution: '今天 01:00 · 自动暂停',
  },
  {
    id: 'rule-google-timeout',
    name: 'Google 低效时段停投',
    campaignId: 'campaign-google-c',
    startTime: '07:30',
    stopTime: '00:30',
    timezone: 'America/Los_Angeles',
    days: ['一', '二', '三', '四', '五'],
    enabled: true,
    simulationScenario: 'failure',
    simulationAction: 'pause',
    nextExecution: '今天 00:30 · 自动暂停',
  },
  {
    id: 'rule-manual-priority',
    name: '人工暂停保护验证',
    campaignId: 'campaign-meta-uk',
    startTime: '08:00',
    stopTime: '00:30',
    timezone: 'Europe/London',
    days: ['一', '二', '三', '四', '五', '六', '日'],
    enabled: true,
    simulationScenario: 'manual-skip',
    simulationAction: 'resume',
    nextExecution: '明天 08:00 · 自动开启',
  },
];

function log(
  id: string,
  timestamp: string,
  platform: Platform,
  campaignId: string,
  campaignName: string,
  action: string,
  status: OperationLog['status'],
  message: string,
): OperationLog {
  return {
    id,
    timestamp,
    platform,
    campaignId,
    campaignName,
    action,
    trigger: 'automation',
    status,
    durationMs: status === 'failed' ? 3104 : 1280,
    message,
    steps: [
      { time: timestamp.slice(11), label: '检查 Campaign 状态', detail: '读取平台侧最新状态', state: 'done' },
      { time: timestamp.slice(11), label: action, detail: message, state: status === 'failed' ? 'failed' : status === 'skipped' ? 'skipped' : 'done' },
    ],
  };
}

export const initialLogs: OperationLog[] = [
  log('log-1', '2026-08-20 08:00:04', 'TikTok', 'campaign-tiktok-au', 'AU-New-Creative-Test', '自动开启', 'success', 'Campaign 状态已验证为投放中'),
  log('log-2', '2026-08-20 07:30:03', 'Google', 'campaign-google-uk', 'UK-Shopping-Core', '自动开启', 'success', 'Campaign 状态已验证为投放中'),
  log('log-3', '2026-08-20 01:00:05', 'TikTok', 'campaign-tiktok-a', 'US-Product-A', '自动暂停', 'success', 'Campaign 状态已验证为暂停'),
  log('log-4', '2026-08-20 00:30:09', 'Google', 'campaign-google-c', 'US-Product-C', '自动暂停', 'failed', '广告平台接口超时，已重试 3 次'),
  log('log-5', '2026-08-19 08:00:02', 'Meta', 'campaign-meta-uk', 'UK-Brand-B', '自动开启', 'skipped', '检测到人工暂停，本次自动开启已跳过'),
];

const roasByHour = [0.72, 0.81, 0.76, 0.92, 1.04, 1.18, 1.92, 2.78, 3.42, 3.88, 4.12, 4.28, 4.36, 4.18, 4.08, 3.92, 3.76, 3.84, 4.02, 3.78, 3.64, 3.42, 2.86, 1.74];
const spendByHour = [42, 38, 36, 34, 39, 44, 61, 72, 84, 92, 98, 103, 108, 106, 101, 96, 94, 99, 102, 97, 89, 78, 66, 53];

export const hourlyPerformance: HourPerformance[] = roasByHour.map((roas, index) => {
  const spend = spendByHour[index];
  const conversions = Math.max(1, Math.round((spend * roas) / 48));
  return {
    hour: `${String(index).padStart(2, '0')}:00`,
    spend,
    revenue: Number((spend * roas).toFixed(2)),
    conversions,
    roas,
    cpa: Number((spend / conversions).toFixed(2)),
  };
});

export const initialWorkbenchData = {
  campaigns: initialCampaigns,
  rules: initialRules,
  logs: initialLogs,
  lastUpdated: nowLabel,
};

