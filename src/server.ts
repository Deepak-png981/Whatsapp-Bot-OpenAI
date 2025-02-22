import express, { Request, Response } from 'express';
import './config/dotenv';
import { initializeWhatsAppClient } from './services/whatsappService';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/generate-qr', (req: Request, res: Response) => {
  const userId = req.query.userId as string;
  if (!userId) {
    return res.status(400).send('User ID is required');
  }

  initializeWhatsAppClient(userId, (qrCode: string) => {
    res.send(`<img src="${qrCode}" alt="QR Code" />`);
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
