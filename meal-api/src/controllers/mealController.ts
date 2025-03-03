import { Request, Response } from 'express';
import { Meal } from '../models/meal';

//Dummy Data
let meals: Meal[] = [
    {
        id: 1,
        name: 'Fried Rice',
        description: 'Sweet and spicy fried rice',
        price: 15.00
    },
    {
        id: 2,
        name: 'Burger',
        description: 'Beef burger with cheese',
        price: 20.00
    },
];

//Add New Meal
export const addMeal = (req: Request, res: Response): void => {
    const {name, description, price} = req.body;

    const newMeal: Meal = {
        id: meals.length + 1,
        name,
        description,
        price
    };

    meals.push(newMeal);
    res.status(201).json(newMeal);
};

//Edit a meal
export const editMeal = (req: Request, res: Response): void => {
    const mealId = parseInt(req.params.id);
    const {name, description, price} = req.body;

    const mealIndex = meals.findIndex(meal => meal.id === mealId);
    if (mealIndex === -1) {
        res.status(404).json({message: 'Meal not found'});
    }

    const updatedMeal: Meal = { id: mealId, name, description, price };
    meals[mealIndex] = updatedMeal;

    res.json(updatedMeal);
};

//Delete a meal
export const deleteMeal = (req: Request, res: Response): void => {
    const mealId = parseInt(req.params.id);
    const mealIndex = meals.findIndex(meal => meal.id === mealId);

    if (mealIndex === -1) {
        res.status(404).json({message: 'Meal not found'});
    }

    meals = meals.filter(meal => meal.id !== mealId);
    res.status(204).send();
};