import { Router } from 'express';
import { addMeal, editMeal, deleteMeal } from '../controllers/mealController';

const router = Router();

//POST route to add a meal
router.post('/meals', addMeal);

//PUT route to edit a meal
router.put('/meals/:id', editMeal);

//DELETE route to delete a meal
router.delete('/meals/:id', deleteMeal);

export default router;