import cors from 'cors';
import { config } from 'dotenv';
import express, { json } from 'express';

config();

const app = express();
app.use(cors());

app.use(json());

app.get('/', (req, res) => {
    const a = 1;
    const b = 2;

    res.send('Hello');
});

app.listen(process.env.PORT, () => {
    console.log(
        `Server is running on port http://localhost:${process.env.PORT}`
    );
});
