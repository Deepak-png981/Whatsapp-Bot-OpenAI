import { Client, Message, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { processMessage } from './openaiService';
import { accumulateMessage, conversations, pendingMessages } from '../utils/chatUtils';
import { promises as fs } from 'fs';
import path from 'path';

const clientStateFile = path.join(__dirname, '../clientStates.json');

const clients: { [userId: string]: Client } = {};
// We'll persist client state (active/inactive) in a JSON file.
let clientStates: { [userId: string]: boolean } = {};

// Helper: Load client states from the JSON file
const loadClientStates = async (): Promise<{ [userId: string]: boolean }> => {
  try {
    const data = await fs.readFile(clientStateFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
};

// Helper: Save client states to the JSON file
const saveClientStates = async (): Promise<void> => {
  try {
    await fs.writeFile(clientStateFile, JSON.stringify(clientStates, null, 2));
  } catch (err) {
    console.error('Error saving client states:', err);
  }
};

/**
 * Initialize a WhatsApp client for the given userId.
 * The LocalAuth strategy automatically loads the saved session from the given dataPath.
 */
export const initializeWhatsAppClient = async (
  userId: string,
  qrCallback: (qrCode: string) => void
): Promise<boolean> => {
  if (clients[userId]) {
    console.log(`Client for user ${userId} is already connected.`);
    return false;
  }
  const dataPath = path.join(__dirname, '..', 'sessions');

  const client = new Client({
    authStrategy: new LocalAuth({
      clientId: userId,
      dataPath
    })
  });

  clients[userId] = client;

  client.on('qr', (qr: string) => {
    qrcode.generate(qr, { small: true });
    qrCallback(qr);
  });

  client.on('ready', async () => {
    console.log(`Client for user ${userId} is ready!`);
    clientStates[userId] = true;
    await saveClientStates();
  });

  client.on('disconnected', async (reason) => {
    console.log(`Client for user ${userId} disconnected: ${reason}`);
    clientStates[userId] = false;
    await saveClientStates();
  });

  client.on('message', (msg: Message) => {
    console.log('Message received:', msg.body);
    accumulateMessage(msg.from, msg.body);

    setTimeout(async () => {
      const reply = await processMessage(msg.from, conversations, pendingMessages);
      client.sendMessage(msg.from, reply);
    }, 1000);
  });

  client.initialize();
  
  return true;
};

export const initializeAllClients = async (qrCallback: (userId: string, qr: string) => void) => {
  clientStates = await loadClientStates();
  for (const userId in clientStates) {
    if (clientStates[userId]) {
      console.log(`Reinitializing client for user ${userId}...`);
      await initializeWhatsAppClient(userId, (qr: string) => {
        qrCallback(userId, qr);
      });
    }
  }
};
