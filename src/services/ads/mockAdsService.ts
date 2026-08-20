import type { AdsService } from './types';
import { initialCampaigns } from '../../data/mockData';

export const mockAdsService: AdsService = {
  async getCampaigns() {
    return structuredClone(initialCampaigns);
  },
  async pauseCampaign() {
    return 'paused';
  },
  async resumeCampaign() {
    return 'active';
  },
  async getCampaignStatus(campaignId) {
    return initialCampaigns.find((campaign) => campaign.id === campaignId)?.status ?? 'error';
  },
};

