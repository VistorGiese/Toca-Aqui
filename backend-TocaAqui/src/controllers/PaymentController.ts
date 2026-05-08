// STRIPE — previsto para produção, desativado no MVP/TCC
// import { Response } from 'express';
// import { paymentService } from '../services/PaymentService';
// import { stripeService } from '../services/StripeService';
// import { contractService } from '../services/ContractService';
// import { asyncHandler } from '../middleware/errorHandler';
// import { AppError } from '../errors/AppError';
// import { AuthRequest } from '../middleware/authmiddleware';

// export const getPaymentsForContract = asyncHandler(async (req: AuthRequest, res: Response) => {
//   if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
//
//   const contratoId = parseInt(req.params.contrato_id as string);
//   const role = await contractService.getUserRole(contratoId, req.user.id);
//   if (!role) throw new AppError('Você não tem acesso a este contrato', 403);
//
//   const payments = await paymentService.getByContract(contratoId);
//   res.json({ data: payments });
// });

// export const getPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
//   if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
//
//   const payment = await paymentService.getById(parseInt(req.params.id as string));
//
//   const role = await contractService.getUserRole(payment.contrato_id, req.user.id);
//   if (!role) throw new AppError('Você não tem acesso a este pagamento', 403);
//
//   res.json(payment);
// });

// export const initiatePayment = asyncHandler(async (req: AuthRequest, res: Response) => {
//   if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
//
//   const payment = await paymentService.getById(parseInt(req.params.id as string));
//
//   // Apenas o contratante (estabelecimento) pode iniciar pagamento
//   const role = await contractService.getUserRole(payment.contrato_id, req.user.id);
//   if (role !== 'contratante') {
//     throw new AppError('Apenas o contratante pode iniciar pagamentos', 403);
//   }
//
//   const clientSecret = await stripeService.getPaymentClientSecret(payment.id!);
//
//   res.json({ client_secret: clientSecret });
// });

// export const createSignalPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
//   if (!req.user?.id) throw new AppError('Usuário não identificado', 401);
//
//   const contratoId = parseInt(req.params.contrato_id as string);
//   const role = await contractService.getUserRole(contratoId, req.user.id);
//   if (role !== 'contratante') {
//     throw new AppError('Apenas o contratante pode criar pagamentos', 403);
//   }
//
//   const result = await stripeService.createSignalPayment(contratoId);
//   res.status(201).json(result);
// });
