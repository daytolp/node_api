import { Router, type NextFunction, type Request, type Response } from 'express';
import { 
    getUsuarios,
    getUsuario,
    saveUsuario,
    updateUsuario,
    deleteUsuario,
    loginUsuario
} from '../controllers/usuarios.controllers.js';
import upload from '../middlewares/multerConfig.js';
import { verificarToken } from '../middlewares/verificarToken.js';

const router = Router();

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return function (req: Request, res: Response, next: NextFunction) {
        return fn(req, res, next).catch(next);
    };
};

router.get('/', verificarToken, asyncHandler(getUsuarios));
router.get('/:id', verificarToken, asyncHandler(getUsuario));
router.post('/', verificarToken, upload.single('imagen'), asyncHandler(saveUsuario));
router.put('/:id', verificarToken, upload.single('imagen'), asyncHandler(updateUsuario));
router.delete('/:id', verificarToken, asyncHandler(deleteUsuario));
router.post('/login', asyncHandler(loginUsuario));

export default router;
