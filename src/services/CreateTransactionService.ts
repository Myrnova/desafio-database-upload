import { getCustomRepository, getRepository } from 'typeorm'; // getRepository quando nao tem repositories e getCustomRepository quando voce criou um arquivo de repository
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    if (!title || !value || !type || !category) {
      throw new AppError('Need to inform all 3 information requested', 400);
    }

    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome') {
      if (total < value) {
        throw new AppError('Not enough money in the bank', 400);
      }
    }

    let categoryToSave = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!categoryToSave) {
      categoryToSave = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(categoryToSave);
    }
    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category: categoryToSave,
    });
    await transactionRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
