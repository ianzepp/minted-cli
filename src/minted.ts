#!/usr/bin/env ts-node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import axios from 'axios';
import _ from 'lodash';

const argv = yargs(hideBin(process.argv)).argv as {
    [x: string]: unknown;
    _: (string | number)[];
    $0: string;
};

const baseUrl = 'http://localhost:8080/api';

const commands: { [key: string]: string[] } = {
  data: ['select', 'create', 'update', 'upsert', 'delete'],
  test: ['ping'],
};

const command = argv._[0] as string;
const action = argv._[1] as string;
const resource = argv._[2] as string;
const params = argv._.slice(3).reduce((acc: any, curr: string) => {
    const [key, value] = curr.split('=');
    acc[key] = value;
    return acc;
}, {});

if (commands[command]?.includes(action)) {
    let url = `${baseUrl}/${command}/${resource}`;
    let method: 'get' | 'post' = 'get';
    let data = null;

    if (action === 'create') {
        method = 'post';
        data = [{ type: resource, data: params }];
    }

  axios({ method, url, data })
    .then((response) => {
        let status = response.data.status;
        let length = response.data.length;
        let result = response.data.result;

        if (status !== 200) {
            return console.error(status, result);
        }

        if (Array.isArray(result)) {
            console.table(_.map(result, record => record.data));
        }

        else {
            console.table(result);
        }
    })
    .catch((error) => {
        console.error(error);
    });
} 

else {
  console.error('Invalid command');
}
