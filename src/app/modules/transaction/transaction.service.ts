import QueryBuilder from '../../builder/QueryBuilder';
import { Transaction } from './transaction.model';

const getAllTransaction = async (query: Record<string, unknown>) => {
  const transactionQuery = new QueryBuilder(Transaction.find(), query)
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await transactionQuery.countTotal();
  const result = await transactionQuery.modelQuery;
  return {
    meta,
    result,
  };
};

const getMyTransaction = async (
  profileId: string,
  query: Record<string, unknown>,
) => {
  const transactionQuery = new QueryBuilder(
    Transaction.find({ user: profileId }),
    query,
  )
    .search([''])
    .filter()
    .sort()
    .paginate()
    .fields();

  const meta = await transactionQuery.countTotal();
  const result = await transactionQuery.modelQuery;
  return {
    meta,
    result,
  };
};

const TransactionService = {
  getAllTransaction,
  getMyTransaction,
};

export default TransactionService;
