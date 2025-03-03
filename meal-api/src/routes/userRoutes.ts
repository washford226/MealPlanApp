import { Router } from 'express';
import { addUser, editUser, deleteUser, saveUsersToDatabase } from '../controllers/userController';

const router = Router();

router.post('/signup', addUser);
router.put('/user/:id', editUser);
router.delete('/user/:id', deleteUser);
router.post('/save', saveUsersToDatabase);

export default router;