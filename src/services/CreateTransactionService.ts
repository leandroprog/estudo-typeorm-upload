// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
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
    let category_id;

    const categoryExist = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    category_id = categoryExist?.id;

    // console.log(await categoryRepository.find());
    if (!categoryExist) {
      const newCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(newCategory);
      category_id = newCategory.id;
      console.log(newCategory);
    }

    const transaction = transationRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transationRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
