import QueryBuilder from '../../builder/QueryBuilder';
import { IReturn } from './return.interface';
import Return from './return.model';

const createReturn = async (reviewerId: string, payload: IReturn) => {
  const result = await Return.create({ ...payload, reviewer: reviewerId });
  return result;
};

const getAllReturn = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const returnQuery = new QueryBuilder(
    Return.find({ $or: [{ reviewer: profileId }, { bussiness: profileId }] }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await returnQuery.countTotal();
  const result = await returnQuery.modelQuery;
  return {
    meta,
    result,
  };
};

const ReturnService = {
  createReturn,
  getAllReturn,
};

export default ReturnService;
