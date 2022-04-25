import express from 'express';
import bodyParser from 'body-parser';
import GenericResponse from "./interfaces/generic-response.interface";
import {StatusCodes} from "http-status-codes";

class App {
    public app: express.Application;
    public port: number;

    constructor(controllers: any, port: number) {
        this.app = express();
        this.port = port;

        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }

    private initializeMiddlewares() {
        this.app.use(bodyParser.json());
    }

    private initializeControllers(controllers: any) {
        controllers.forEach((controller: any) => {
            this.app.use("/", controller.router);
        });
        this.app.all('*', function (req, res) {
            const response: GenericResponse = {
                    success: false,
                    statusCode: StatusCodes.NOT_FOUND,
                    message: `${req.path} not found`
                }
            ;
            res.json(response);
        });
    }

    public listen() {
        this.app.listen(this.port, () => {
            console.log(`App listening on the port ${this.port}`);
        });
    }
}

export default App;
