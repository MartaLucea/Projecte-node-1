import fs from 'node:fs';

export const readData = (file) => {
    try {
        const data = fs.readFileSync(`./db/${file}.json`, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const writeData = (file, data) => {
    try {
        fs.writeFileSync(
            `./db/${file}.json`,
            JSON.stringify(data, null, 2),
            'utf8'
        );
    } catch (error) {
        console.log(error);
    }
};
