export type GunPeer = {
  id: string;
  url: string;
  queue: string[];
  wire: null | WebSocket | RTCDataChannel;
};
