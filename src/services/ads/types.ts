import type { Campaign } from '../../types';

export interface AdsService {
  getCampaigns(): Promise<Campaign[]>;
  pauseCampaign(campaignId: string): Promise<Campaign['status']>;
  resumeCampaign(campaignId: string): Promise<Campaign['status']>;
  getCampaignStatus(campaignId: string): Promise<Campaign['status']>;
}

