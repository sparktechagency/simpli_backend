import ReferralSales from './referralSales.model';

const getReferralSales = async () => {
  const result = await ReferralSales.find().populate({
    path: 'product',
    select: 'name images',
  });
  return result;
};

const ReferralSalesService = {
  getReferralSales,
};

export default ReferralSalesService;
