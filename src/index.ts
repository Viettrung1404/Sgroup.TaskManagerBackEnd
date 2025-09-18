import cors from 'cors';
import { config } from 'dotenv';
import express, { json } from 'express';
import routers from './apis';
import { AppDataSource } from './config/database.config';
import { setupSwagger } from './config/swagger.config';

config();

const app = express();

AppDataSource.initialize()
    .then(() => {
        console.log('✅ Database connected');
        app.use(cors());
        app.use(json());
        setupSwagger(app);
        app.use('/apis', routers);

        app.get('/', (req, res) => {
            const a = 1;
            const b = 2;
            console.log(a + b);

            res.send('Hello');
        });

        app.listen(process.env.PORT, () => {
            console.log(
                `Server is running on port http://localhost:${process.env.PORT}`
            );
            console.log(
                `Swagger docs at http://localhost:${process.env.PORT}/api-docs`
            );
        });
    })
    .catch((error) => console.log('❌ DB connection error:', error));
