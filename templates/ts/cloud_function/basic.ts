import { CloudFunction } from '@less-ifc/types';

export const process: CloudFunction.Handler = async (message: CloudFunction.Message) => {
  console.log('Cloud function triggered:', message);
}
