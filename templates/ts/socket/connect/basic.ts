import { Socket } from '@less-ifc/types';

export const process: Socket.ConnectionHandler = async (message: Socket.ConnectionMessage) => {
  console.log('Client connected to Socket:', message.connection_id);
}
