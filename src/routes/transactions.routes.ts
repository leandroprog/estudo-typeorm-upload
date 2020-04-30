import { Router } from 'express';

// import TransactionsRepository from '../repositories/TransactionsRepository';
import { getCustomRepository } from 'typeorm';
import CreateTransactionService from '../services/CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);
  const balance = await transactionRepository.getBalance();
  const transactions = await transactionRepository.find();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const transactionService = new CreateTransactionService();
  const transaction = await transactionService.execute({
    title,
    value,
    type,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactionDeleted = await transactionRepository.delete(id);

  return response.status(200).json(transactionDeleted);
});

transactionsRouter.post('/import', async (request, response) => {
  return response.json({ message: 'Falta fazer' });
});

export default transactionsRouter;
