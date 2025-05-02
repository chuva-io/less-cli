import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const api = {
  load_route_ts: () => fs.readFileSync(path.resolve(__dirname, '../templates/ts/api/get/basic.ts'), 'utf8'),
};

export const socket = {
  load_connect_ts: () => fs.readFileSync(path.resolve(__dirname, '../templates/ts/socket/connect/basic.ts'), 'utf8'),
  load_disconnect_ts: () => fs.readFileSync(path.resolve(__dirname, '../templates/ts/socket/disconnect/basic.ts'), 'utf8'),
  load_channel_ts: () => fs.readFileSync(path.resolve(__dirname, '../templates/ts/socket/channel/basic.ts'), 'utf8'),
};

export const cron = {
  load_cron_ts: () => fs.readFileSync(path.resolve(__dirname, '../templates/ts/cron/basic.ts'), 'utf8'),
};

export const topic = {
  load_topic_subscriber_ts: () => fs.readFileSync(path.resolve(__dirname, '../templates/ts/topic/subscriber/basic.ts'), 'utf8'),
};

export const cloud_function = {
  load_function_ts: () => fs.readFileSync(path.resolve(__dirname, '../templates/ts/cloud_function/basic.ts'), 'utf8'),
};
