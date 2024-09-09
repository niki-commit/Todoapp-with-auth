import express from "express";
import { v4 as uuidv4 } from "uuid";
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const port = 8000;
const saltRounds = 10;
env.config();

app.use(cors());
app.use(express.json());

const db = new pg.Client({
    user: process.env.USER_NAME,
    host: process.env.HOST,
    database: "todoapp",
    password: process.env.PASSWORD,
    port: process.env.DBPORT,
})
db.connect();

// get all todos
app.get("/todos/:userEmail", async (req, res) => {
    const { userEmail } = req.params;

    try {
        const todos = await db.query("SELECT * FROM todos WHERE user_email = $1;", [userEmail]);
        res.json(todos.rows);
    } catch (error) {
        console.error(error);
    }
})

// create a new todo
app.post("/todos", async (req, res) => {
    const { user_email, title, progress, date } = req.body;
    const id = uuidv4();
    try {
        const newToDo = await db.query("INSERT INTO todos(id, user_email, title, progress, date) VALUES($1, $2, $3, $4, $5);",
            [id, user_email, title, progress, date])
        res.json(newToDo);
    } catch (error) {
        console.error(error);
    }
})

// edit a todo
app.put("/todos/:id", async (req, res) => {
    const { id } = req.params;
    const { user_email, title, progress, date } = req.body;
    try {
        const editToDo = await db.query("UPDATE todos SET user_email=$1, title=$2, progress=$3, date=$4 WHERE id=$5;",
            [user_email, title, progress, date, id]);
        res.json(editToDo);
    } catch (error) {
        console.error(error);
    }
})

// Delete a todo
app.delete("/todos/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deleteToDo = await db.query("DELETE FROM todos WHERE id=$1;", [id]);
        res.json(deleteToDo);
    } catch (error) {
        console.error(error);
    }
})

// signup
app.post("/signup", async (req, res) => {
    const { email, password } = req.body
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)

    try {
        const signUp = await db.query(`INSERT INTO users (email, hashed_password) VALUES($1, $2)`,
            [email, hashedPassword])

        const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' })

        res.json({ email, token })
    } catch (err) {
        console.error(err)
        if (err) {
            res.json({ detail: err.detail })
        }
    }
})


// login
app.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const users = await db.query('SELECT * FROM users WHERE email = $1', [email])

        if (!users.rows.length) return res.json({ detail: 'User does not exist!' })

        const success = await bcrypt.compare(password, users.rows[0].hashed_password)
        const token = jwt.sign({ email }, 'secret', { expiresIn: '1hr' })

        if (success) {
            res.json({ 'email': users.rows[0].email, token })
        } else {
            res.json({ detail: "Login failed" })
        }
    } catch (err) {
        console.error(err)
    }
})

app.listen(port, () => {
    console.log(`server running on ${port}`);
})