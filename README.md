# website-monitoring
## Note
    the project built using typescript
#### Build commands

* `yarn run test:unit` ─ code unit test check
* `npm run start` ─ build and run app as production
* `npm run start:dev` ─  run app for development
* `npm run build` ─  build app and transform all *.ts files to *.js

## Structure

Shorten directories and files structure which you'll see after build:

```shell
website-monitor/
├── build/                 # output folder with production build (don't edit)
│   ├── index.js            # entry point of app
│   └── [...]               
├── data/                   # database folder (don't edit)
│   ├── db.sqlite          # database file
├── node_modules/           # Node.js packages (don't edit)
│   └── [...]
├── src/                   # source code in Typescript
│   ├── constants          
│   |   ├── enums          
│   |   |   ├── ....enum.ts          
│   |   |   └── [...]
│   |   └── [...]
│   ├── controllers          
│   |  ├── dtos          
│   |  |   └── [...]
│   |  ├── auth.controller.ts          
│   |  ├── monitor.controller.ts         
│   |  └── report.controller.ts          
│   ├── db          
│   |   └── entities
│   |       ├── ....entity.ts          
│   |       └── [...]
│   ├── interfaces
│   |   ├── ....interface.ts          
│   |   └── [...]
|   |── middlewares
│   |   ├── ....middleware.ts          
│   |   └── [...]
|   |── modules
│   |   ├── ....module.ts          
│   |   └── [...]
|   |── services
│   |   ├── __tests__       # unit test jest folder          
│   |   ├── ...service.ts          
│   |   └── [...]
|   |── app.ts              # app entrypoint
|   |── axios-config.ts     # axios interceptor configuration
|   |── data-source.ts      # typeorm database source config
|   |── index.ts            # project entrypoint contains database,old cron jobs and database initialization 
├── └── [...]
├── package.json            # Node.js dependencies and scripts
├── yarn.json               # Node.js dependencies lock file (don't edit)
└── [...]                   # other...
```
