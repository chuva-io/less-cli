import { Topic } from '@less-ifc/types';

export const process: Topic.Handler = async (message: Topic.Message) => {
  console.log('Received message from Topic:', message);
}
