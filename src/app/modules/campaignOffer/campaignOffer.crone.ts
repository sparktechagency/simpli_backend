import cron from 'node-cron';
import { CAMPAIGN_STATUS } from '../../utilities/enum';
import Campaign from '../campaign/campaign.model';
import { CampaignOfferStatus } from './campaignOffer.constant';
import { CampaignOffer } from './campaignOffer.model';
cron.schedule('0 0 * * *', async () => {
  console.log('Running cron job to expire campaigns and offers...');
  const now = new Date();

  try {
    const expiredCampaigns = await Campaign.find(
      { endDate: { $lt: now }, status: { $ne: CAMPAIGN_STATUS.EXPIRED } },
      { _id: 1 },
    );

    const expiredCampaignIds = expiredCampaigns.map((c) => c._id);

    await Campaign.updateMany(
      { _id: { $in: expiredCampaignIds } },
      { $set: { status: CAMPAIGN_STATUS.EXPIRED } },
    );

    const offerResult = await CampaignOffer.updateMany(
      {
        campaign: { $in: expiredCampaignIds },
        status: { $ne: CampaignOfferStatus.expired },
      },
      { $set: { status: CampaignOfferStatus.expired } },
    );

    console.log(
      `✅ Cron job completed. Expired campaigns: ${expiredCampaignIds.length}, expired offers: ${offerResult.modifiedCount}`,
    );
  } catch (error) {
    console.error('❌ Error running cron job:', error);
  }
});
