import { describe, expect, it } from 'vitest';
import { hourlyPerformance, initialCampaigns, initialRules } from './mockData';

describe('AdPilot 演示数据', () => {
  it('保留三个可复现的执行场景', () => {
    expect(initialRules).toHaveLength(3);
    expect(initialRules.map((rule) => rule.simulationScenario)).toEqual([
      'success',
      'failure',
      'manual-skip',
    ]);
  });

  it('统计字段由基础 Mock 数据正确推导', () => {
    for (const campaign of initialCampaigns) {
      expect(campaign.revenue).toBe(Number((campaign.spend * campaign.roas).toFixed(2)));
      expect(campaign.cpa).toBe(Number((campaign.spend / Math.max(campaign.conversions, 1)).toFixed(2)));
    }
  });

  it('提供完整的 24 小时表现数据', () => {
    expect(hourlyPerformance).toHaveLength(24);
    expect(hourlyPerformance[0].hour).toBe('00:00');
    expect(hourlyPerformance[23].hour).toBe('23:00');
    expect(hourlyPerformance.slice(0, 6).every((item) => item.roas < 1.2)).toBe(true);
  });
});
