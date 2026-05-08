import { Router } from 'express';
// STRIPE — previsto para produção, desativado no MVP/TCC
// import {
//   getPaymentsForContract,
//   getPayment,
//   initiatePayment,
//   createSignalPayment,
// } from '../controllers/PaymentController';
// import { authMiddleware } from '../middleware/authmiddleware';

const router = Router();

// // Listar pagamentos de um contrato
// router.get('/contrato/:contrato_id', authMiddleware, getPaymentsForContract);

// // Criar pagamento do sinal para um contrato
// router.post('/contrato/:contrato_id/sinal', authMiddleware, createSignalPayment);

// // Buscar pagamento por ID
// router.get('/:id', authMiddleware, getPayment);

// // Iniciar pagamento (retorna client_secret do Stripe)
// router.post('/:id/iniciar', authMiddleware, initiatePayment);

export default router;
