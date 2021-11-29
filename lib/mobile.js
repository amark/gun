import Buffer from "buffer";
import { TextEncoder, TextDecoder } from "text-encoding";
global.Buffer = global.Buffer || Buffer.Buffer;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;