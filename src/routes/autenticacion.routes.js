import { Router } from 'express';
import { login } from '../controladores/autenticacionControl.js';

const router = Router();

router.post('/login', login);

export default router;