import { Request, Response } from 'express';
import { Meal } from '../database';

//Add New Meal
export const addMeal = (req: Request, res: Response): void => {
    const {name, description, price} = req.body;
    const query = 'INSERT INTO meals (name, description, price) VALUES (?, ?, ?)';

    connection.query(query, [name, description, price], (err, results) => {
        if (err) {
            res.status(500).json({ message: err.message});
        }
        else {
           res.status(201).json({ id: results.insertID, name, description, price });
        }
    });
};

//Edit a meal
export const editMeal = (req: Request, res: Response): void => {
    const mealId = parseInt(req.params.id);
    const { name, description, price } = req.body;
    const query = 'UPDATE meals SET name = ?, description = ?, price = ? WHERE id = ?';

    connection.query(query, [name, description, price, mealId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } 
        else if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Meal not found' });
        } 
        else {
            res.status(200).json({ id: mealId, name, description, price });
        }
    });
};

//Delete a meal
export const deleteMeal = (req: Request, res: Response): void => {
    const mealId = parseInt(req.params.id);
    const query = 'DELETE FROM meals WHERE id = ?';

    connection.query(query, [mealId], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Meal not found' });
        } else {
            res.status(200).json({ message: 'Meal deleted successfully' });
        }
    });
};
