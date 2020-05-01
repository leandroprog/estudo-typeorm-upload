import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: RequestDTO): Promise<Transaction> {
    const transationRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    // let category_id;

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    // category_id = categoryExist?.id;

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
      // category_id = newCategory.id;
      // console.log(newCategory);
    }

    const balance = await transationRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Sem dinheiro', 400);
    }

    const transaction = transationRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transationRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
