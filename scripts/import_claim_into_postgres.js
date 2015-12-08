import path from 'path';
import parseArgs from 'minimist';
import dotenv from 'dotenv';
import postgres from 'pg-promise';

// Entities
import WinstonLogger from '../src/WinstonLogger';
import FileParsedDataRepository from '../src/ParsedDataRepository/File';
import DBParsedDataRepository from '../src/ParsedDataRepository/DB';

// Robert C. Martin Interactor / Entity (plugin) model
// https://vimeo.com/97530863

class Interactor {

    constructor(logger, fileParsedDataRepository, dbParsedDataRepository) {
        this.logger = logger;        
        this.unsanitizedParsedDataRepository = fileParsedDataRepository;        
        this.sanitizedParsedDataRepository = dbParsedDataRepository;        
    }

    logBatchTime(batchStartTime) {
        const batchEndTime = new Date();
        const batchTime = batchEndTime - batchStartTime;

        const hours = Math.floor(batchTime / 36e5);
        const minutes = Math.floor(batchTime % 36e5 / 60000);
        const seconds = Math.floor(batchTime % 60000 / 1000);
        const result = `${(hours < 10 ? '0' + hours : hours)}:${(minutes < 10 ? '0' + minutes : minutes)}:${(seconds < 10 ? '0' + seconds : seconds)}`;

        this.logger.info(`Batch completed in: ${result}`);
    }

    execute() {
        return new Promise(

            (resolve, reject) => {
                // TODO: convert to a promise
                this.batchStartTime = new Date();
                const {unsanitizedParsedDataRepository, sanitizedParsedDataRepository, batchStartTime, config} = this;

                this.claimRootPath = path.resolve(config.rootPath, config.claimID);
                this.unsanitizedParsedDataRepository.setRootPath(this.claimRootPath);
                        
                const parsedShows = unsanitizedParsedDataRepository.fetchParsedShows();
                this.logger.info(`Claim retrieved from ${this.claimRootPath}`);

                sanitizedParsedDataRepository.saveParsedShows(parsedShows)
                    .then(()=>{
                        this.logBatchTime(batchStartTime);
                        resolve();                    
                    })
                    .catch((error)=>{
                        this.logger.error(error);
                        reject(error);
                    });
            }
        );
    }
}

const mainExport = (rootPath, claimID, options) => {
    let appRootPath;
    let appClaimID;

    if (typeof rootPath === 'undefined') {
        if (typeof options !== 'undefined') {
            if ('rootPath' in options) {
                appRootPath = options.rootPath;
            } else {
                throw new Error('No rootPath passed to application.');
            }
        } else {
            throw new Error('No options hash passed to application');
        }
    }

    if (typeof claimID === 'undefined') {
        if (typeof options !== 'undefined') {
            if ('claimID' in options) {
                appClaimID = options.claimID;
            } else {
                throw new Error('No claimID passed to application.');
            }
        } else {
            throw new Error('No options hash passed to application');
        }
    }

    if (typeof options !== 'undefined') {
        if ('rootPath' in options) {
            appRootPath = options.rootPath;
        } else {
            throw new Error('No rootPath passed to application.');
        }
        if ('claimID' in options) {
            appClaimID = options.claimID;
        } else {
            throw new Error('No appClaimID passed to application.');
        }
    }

    if (typeof appRootPath === 'undefined') {
        throw new Error('No rootPath passed to application.');
    }

    if (typeof appClaimID === 'undefined') {
        throw new Error('No rootPath passed to application.');
    }

    const pgp = postgres();
    const db = pgp({...options.db, database: options.db.name});

    const logger = new WinstonLogger({
        type: 'console',
        label: 'the-list-logger',
        colorize: true,
        prettyPrint: true,
    });

    const fileParsedDataRepository = new FileParsedDataRepository(logger);
    const dbParsedDataRepository = new DBParsedDataRepository(logger, db);

    const interactor = new Interactor(logger, fileParsedDataRepository, dbParsedDataRepository);
    interactor.config = {
        rootPath: appRootPath,
        claimID: appClaimID,
    };

    interactor.execute().then(()=>{pgp.end()});
};

export default mainExport;

if (require.main === module) {
    dotenv.load();

    const opts = {
        alias: {
            'r': 'root',
            'c': 'claim',
        },
    };

    const argv = parseArgs(process.argv.slice(2), opts);


    const db = {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
    };

    const config = {
        rootPath: argv.root,
        claimID: argv.claim,
        db: db,
    };

    mainExport(null, null, config);
}
