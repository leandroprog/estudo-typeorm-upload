import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = getRepository(Transaction);

    const resultTransaction = await transactions
      .createQueryBuilder('transactions')
      .select('transactions.type,  sum(transactions.value)')
      .groupBy('transactions.type')
      .getRawMany();

    console.log(resultTransaction);

    const result = resultTransaction.reduce(
      (acc, item) => {
        acc[item.type] = Number(item.sum) || 0;
        acc.total =
          item.type === 'income'
            ? acc.total + Number(item.sum)
            : acc.total - Number(item.sum);
        return acc;
      },
      { total: 0 },
    );
    console.log(result);

    return result;
  }
}

export default TransactionsRepository;
