import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());

app.use(express.json());

app.get('/', (req, res) => {
    const a = 1


    const b =    2
    res.send('Hello');
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port http://localhost:${process.env.PORT}`);
});