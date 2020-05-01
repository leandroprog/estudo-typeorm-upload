import csvparse from 'csv-parse';
import fs from 'fs';
import { getCustomRepository, getRepository, In } from 'typeorm';

// Models
import Transaction from '../models/Transaction';
import Category from '../models/Category';

// Transaction
import TransactionRepository from '../repositories/TransactionsRepository';

interface CSVTransation {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionsRepositories = getCustomRepository(TransactionRepository);
    const categoryRepositories = getRepository(Category);

    const fileReadStream = fs.createReadStream(filePath);

    const parsers = csvparse({
      from_line: 2,
    });

    const parseCSV = fileReadStream.pipe(parsers);

    const transactions: CSVTransation[] = [];
    const categories: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      if (!title || !type || !value) return;

      transactions.push({ title, type, value, category });
      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategory = await categoryRepositories.find({
      where: {
        title: In(categories),
      },
    });

    const existentCategoryTitle = existentCategory.map(item => item.title);

    const categoriesNotExist = categories
      .filter(item => !existentCategoryTitle.includes(item))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepositories.create(
      categoriesNotExist.map(title => ({
        title,
      })),
    );

    await categoryRepositories.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategory];

    const createdTransaction = transactionsRepositories.create(
      transactions.map(item => ({
        title: item.title,
        type: item.type,
        value: item.value,
        category: finalCategories.find(
          category => category.title === item.title,
        ),
      })),
    );

    await transactionsRepositories.save(createdTransaction);

    await fs.promises.unlink(filePath);

    return createdTransaction;
  }
}

export default ImportTransactionsService;
