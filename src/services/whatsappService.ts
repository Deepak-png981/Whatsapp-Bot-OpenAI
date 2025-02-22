import { Client, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { processMessage } from './openaiService';
import { accumulateMessage, conversations, pendingMessages } from '../utils/chatUtils';

const clients: { [userId: string]: Client } = {};
const clientStates: { [userId: string]: boolean } = {};
const messageTimers: { [chatId: string]: NodeJS.Timeout } = {};

export const initializeWhatsAppClient = (userId: string, qrCallback: (qrCode: string) => void) => {

    if (clientStates[userId]) {
        console.log(`Client for user ${userId} is already connected.`);
        return;
    }

    const client = new Client({});
    clients[userId] = client;

    client.on('qr', (qr: string) => {
        if (!clientStates[userId]) {
            qrcode.generate(qr, { small: true });
            qrCallback(qr);
        }
    });

    client.on('ready', () => {
        console.log(`Client for user ${userId} is ready!`);
        clientStates[userId] = true;
    });

    client.on('disconnected', (reason) => {
        console.log(`Client for user ${userId} disconnected: ${reason}`);
        clientStates[userId] = false;
    });

    client.on('message', (msg: Message) => {
        console.log('Message received:', msg.body);
        accumulateMessage(msg.from, msg.body);

        if (messageTimers[msg.from]) {
            clearTimeout(messageTimers[msg.from]);
        }

        messageTimers[msg.from] = setTimeout(async () => {
            const reply = await processMessage(msg.from, conversations, pendingMessages);
            client.sendMessage(msg.from, reply);
        }, 1000);
    });

    client.initialize();
} 