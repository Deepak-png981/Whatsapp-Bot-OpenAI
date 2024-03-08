# Deepak's WhatsApp Bot

This project is a WhatsApp bot that leverages the OpenAI API to simulate conversations in a style mimicking Deepak Joshi, who is known for his humor, sarcasm, and positivity. Deepak is a third-year B.Tech IT student at GGSIPU. The bot is designed to interact with friends, family, or colleagues on WhatsApp on behalf of Deepak, responding in Hinglish and using emojis to enhance the conversational experience. 

## Features

- **Personalized Responses**: Mimics Deepak's unique style of communication, incorporating humor, sarcasm, and positivity.
- **Hinglish and Emojis**: Uses a mix of Hindi and English (Hinglish) along with emojis for a more engaging and authentic conversation.
- **Batch Processing**: Waits for 1 second after receiving a message to allow for additional messages to be appended, minimizing API hits.
- **Human-Like Interaction**: Introduces a 2-second delay before sending replies to make interactions appear less bot-oriented and more natural.

## Setup

### Prerequisites

- Node.js installed on your machine.
- An OpenAI API key.
- A setup for running a WhatsApp bot (e.g., a smartphone with WhatsApp installed to scan the QR code).

### Installation

1. Clone the repository to your local machine:

```bash
git clone https://github.com/Deepak-png981/Whatsapp-Bot-OpenAI
```
2. Install the required dependencies:
```bash
npm install
```
3. Create a .env file at the root of your project and add your OpenAI API key:
```bash
SECRET_KEY=your_openai_api_key_here
```

### Running the Bot
To start the bot, run:
```bash
node index.js
```
Upon startup, scan the QR code with your smartphone to authenticate the WhatsApp Web session. The bot will then be ready to interact with incoming messages.

### Usage
Send a message to Deepak's WhatsApp number. The bot will respond following a brief delay, incorporating Deepak's conversational style. It handles conversation context, ensuring that responses are relevant and personalized.

### Contributing
Contributions are welcome! If you'd like to improve the bot or suggest new features, please feel free to fork the repository and submit a pull request.

### Acknowledgments
- `OpenAI` for providing the GPT API.
- The `whatsapp-web.js` library for enabling WhatsApp integration.