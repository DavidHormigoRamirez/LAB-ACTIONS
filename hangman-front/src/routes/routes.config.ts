import { Application } from 'express';
import { topicsRoute } from './topics.route';

// TODO CAMBIOS EN ROUTAS
export const routesInitialization = (app: Application) => {
    app.use('/api/topics', topicsRoute());
};
