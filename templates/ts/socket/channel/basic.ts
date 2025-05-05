import { Socket } from '@less-ifc/types';

export const process: Socket.ChannelHandler = async (message: Socket.ChannelMessage) => {
  console.log('Socket channel received message:', message);
  console.log('Connection ID:', message.connection_id);
  console.log('Payload:', message.data);
}
