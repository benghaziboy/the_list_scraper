// #TODO: TEST

import fs from 'fs';
import path from 'path';

import RawDataRepository from '../RawDataRepository';

class FileRawDataRepository extends RawDataRepository {
    constructor(logger) {
        super();
        this.logger = logger;
    }

    setRootPath(rootPath) {
        this.rootPath = rootPath;
    }

    saveToFile(filename, content) {
        this.logger.info(`BEGIN : writing to ${filename}`);

        if (filename.includes('.json')) {
            this.logger.info(`INFO: writing ${content.length} items`);
        }

        fs.writeFileSync(filename, JSON.stringify(content));
        this.logger.info(`FINISH: writing to ${filename}`);
    }

    readFromFile(filename) {
        this.logger.info(`BEGIN : reading from ${filename}`);
        const content = JSON.parse(fs.readFileSync(filename));

        if (filename.includes('.json')) {
            this.logger.info(`INFO: read ${content.length} items`);
        }

        this.logger.info(`FINISH: reading from ${filename}`);
        return content;
    }

    saveHTML(html) {
        if (!this.rootPath) {
            throw new Error('No root path yet assigned to repository');
        }

        this.saveToFile(path.resolve(this.rootPath, 'html/index.html'), html);
    }

    fetchHTML() {
        if (!this.rootPath) {
            throw new Error('No root path yet assigned to repository');
        }

        return this.readFromFile(path.resolve(this.rootPath, 'html/index.html'));
    }

    saveRawShows(rawShows) {
        if (!this.rootPath) {
            throw new Error('No root path yet assigned to repository');
        }

        this.saveToFile(path.resolve(this.rootPath, 'raw_shows/raw_shows.json'), rawShows);
    }

    fetchRawShows() {
        if (!this.rootPath) {
            throw new Error('No root path yet assigned to repository');
        }

        return this.readFromFile(path.resolve(this.rootPath, 'raw_shows/raw_shows.json'));
    }

}

export default FileRawDataRepository;
