import { Cron } from '@less-ifc/types';

export const process: Cron.Handler = async () => {
  console.log('Cron job triggered.');
}
