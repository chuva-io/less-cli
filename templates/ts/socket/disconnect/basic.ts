import { Socket } from '@less-ifc/types';

export const process: Socket.DisconnectionHandler = async (message: Socket.DisconnectionMessage) => {
  console.log('Client disconnected from Socket:', message.connection_id);
}
