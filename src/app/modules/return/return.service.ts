import { IReturn } from './return.interface';
import Return from './return.model';

const createReturn = async (reviewerId: string, payload: IReturn) => {
  const result = await Return.create({ ...payload, reviewer: reviewerId });
  return result;
};

const ReturnService = {
  createReturn,
};

export default ReturnService;
