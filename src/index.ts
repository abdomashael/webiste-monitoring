import App from './app';
import AuthController from "./controllers/auth.controller";
import {AppDataSource} from "./data-source";
import 'dotenv/config'
import MonitorController from "./controllers/monitor.controller";
import AxiosConfig from "./axios-config";
import ReportController from "./controllers/report.controller";
import CronJobService from "./services/cron-job.service";

const port: number = Number(process.env.port) || 3000;
(async () => {
    await AppDataSource.initialize();
    AxiosConfig.addTimeConfigurations();
    await new CronJobService().startAllJobs()
    const app = new App(
        [
            new AuthController(),
            new MonitorController(),
            new ReportController()
        ], port,
    );

    app.listen();

})()
