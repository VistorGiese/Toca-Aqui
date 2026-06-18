import { Router } from 'express';
import { mockCriarSinal, mockConfirmarPagamento } from '../controllers/MockPaymentController';

const router = Router();

router.post('/mock-pagamento/sinal', mockCriarSinal);

router.post('/mock-pagamento/confirmar', mockConfirmarPagamento);

export default router;
