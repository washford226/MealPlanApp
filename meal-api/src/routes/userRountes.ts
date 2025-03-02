import { Router } from 'express';
import { addUser, editUser, deleteUser } from '../controllers/userController';

const router = Router();

//POST route to add a meal
router.post('/user', addUser);

//PUT route to edit a meal
router.put('/user/:id', editUser);

//DELETE route to delete a meal
router.delete('/user/:id', deleteUser);

export default router;