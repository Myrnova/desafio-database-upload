/* eslint-disable no-param-reassign */
/* eslint-disable no-return-assign */
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
    const transactionRepository = getRepository(Transaction);
    const transactions = await transactionRepository.find();
    const income = transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((accumulator, element) => (accumulator += element.value), 0);
    const outcome = transactions
      .filter(transaction => transaction.type === 'outcome')
      .reduce((accumulator, element) => (accumulator += element.value), 0);

    const total = income - outcome;
    return { income, outcome, total };
  }
}

export default TransactionsRepository;
