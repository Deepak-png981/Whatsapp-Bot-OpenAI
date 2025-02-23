import express, { Request, Response } from 'express';
import './config/dotenv';
import { initializeWhatsAppClient, initializeAllClients } from './services/whatsappService';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

initializeAllClients((userId, qr) => {
  console.log(`Client ${userId} requires a new QR code: ${qr}`);
});

app.get('/generate-qr', async (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).send('User ID is required');
  }
  console.log('UserID', userId);

  const didInitialize = await initializeWhatsAppClient(userId, (qr: string) => {
    res.send(`<img src="${qr}" alt="QR Code" />`);
  });

  if (!didInitialize) {
    return res.send('Client is already connected. No QR needed.');
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
