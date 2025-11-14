import { conmysql } from '../db.js';

export const getCategorias = async (req, res) => {
    try {
        const [result] = await conmysql.query('SELECT * FROM categorias');
        res.json({
            cantidad: result.length,
            data: result
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const getCategoriaxID = async (req, res) => {
    try {
        const [result] = await conmysql.query(
            'SELECT * FROM categorias WHERE cat_id = ?',
            [req.params.id]
        );

        if (result.length <= 0) {
            return res.json({
                cantidad: 0,
                message: "Categoría no encontrada"
            });
        }

        res.json({
            cantidad: 1,
            dataCat: result[0]
        });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};

export const postCategoria = async (req, res) => {
    try {
        const { cat_nombre, cat_descripcion } = req.body;

        const [existe] = await conmysql.query(
            'SELECT * FROM categorias WHERE cat_nombre = ?',
            [cat_nombre]
        );

        if (existe.length > 0) {
            return res.status(400).json({ estado: 0, mensaje: `La categoría '${cat_nombre}' ya existe` });
        }

        const [result] = await conmysql.query(
            'INSERT INTO categorias (cat_nombre, cat_descripcion) VALUES (?, ?)',
            [cat_nombre, cat_descripcion]
        );

        res.status(201).json({
            estado: 1,
            mensaje: 'Categoría registrada exitosamente',
            data: {
                cat_id: result.insertId
            }
        });
    } catch (error) {
        res.status(500).json({ estado: 0, mensaje: "Error en el servidor" });
    }
};

export const putCategoria = async (req, res) => {
    try {
        const { id } = req.params;
        const { cat_nombre, cat_descripcion } = req.body;

        const [existe] = await conmysql.query(
            'SELECT * FROM categorias WHERE cat_nombre = ? AND cat_id <> ?',
            [cat_nombre, id]
        );

        if (existe.length > 0) {
            return res.status(400).json({ estado: 0, mensaje: `La categoría '${cat_nombre}' ya existe en otra categoría` });
        }

        const [result] = await conmysql.query(
            'UPDATE categorias SET cat_nombre = ?, cat_descripcion = ? WHERE cat_id = ?',
            [cat_nombre, cat_descripcion, id]
        );

        if (result.affectedRows <= 0) {
            return res.status(404).json({ estado: 0, mensaje: "Categoría no encontrada" });
        }

        const [fila] = await conmysql.query(
            'SELECT * FROM categorias WHERE cat_id = ?',
            [id]
        );

        res.json({ estado: 1, mensaje: "Categoría actualizada", data: fila[0] });
    } catch (error) {
        res.status(500).json({ estado: 0, mensaje: "Error en el servidor" });
    }
};

export const deleteCategoria = async (req, res) => {
    try {
        const { id } = req.params;

        const [result] = await conmysql.query(
            'DELETE FROM categorias WHERE cat_id = ?',
            [id]
        );

        if (result.affectedRows <= 0) {
            return res.status(404).json({ message: "Categoría no encontrada" });
        }

        res.json({ message: "Categoría eliminada correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor" });
    }
};
