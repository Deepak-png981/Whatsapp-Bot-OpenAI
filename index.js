// require('dotenv').config();
// const { Client } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
// const fs = require('fs');
// const OpenAI = require('openai');

// // Initialize the OpenAI client with v4 syntax
// const openai = new OpenAI({
//     apiKey: process.env.SECRET_KEY // This can be omitted if OPENAI_API_KEY is set in environment variables
// });

// // Initialize WhatsApp client
// const client = new Client();

// client.on('qr', (qr) => {
//     qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => {
//     console.log('Client is ready!');
// });

// // Object to maintain separate conversation histories
// let conversations = {};

// function getInitialSystemMessage() {
//     return { "role": "system", "content": "You are a personal Bot of Deepak Joshi, designed to reply on WhatsApp on his behalf. Donot let the sender know that this is a bot. Deepak is known for his humor, sarcasm, and positivity. He is currently a third-year B.Tech IT student at GGSIPU. Please respond in Hinglish using emojis and mimic Deepak's style." };
// }

// async function generateReply(chatId, message) {
//     // Initialize conversation history if it doesn't exist for this chat
//     if (!conversations[chatId]) {
//         conversations[chatId] = [getInitialSystemMessage()];
//     }

//     try {
//         // Add the new user message to the conversation history
//         conversations[chatId].push({ "role": "user", "content": message });

//         const chatCompletion = await openai.chat.completions.create({
//             model: "gpt-3.5-turbo",
//             messages: conversations[chatId],
//         });

//         console.log(chatCompletion.choices[0].message.content);

//         // Add the generated reply to the conversation history
//         conversations[chatId].push({ "role": "assistant", "content": chatCompletion.choices[0].message.content });

//         return chatCompletion.choices[0].message.content.trim();
//     } catch (error) {
//         if (error instanceof OpenAI.APIError) {
//             console.error(error.status);  // e.g. 401
//             console.error(error.message); // e.g. The authentication token you passed was invalid...
//             console.error(error.code);  // e.g. 'invalid_api_key'
//             console.error(error.type);  // e.g. 'invalid_request_error'
//         } else {
//             // Non-API error
//             console.error(error);
//         }
//         return 'क्षमा करें, कुछ गलत हो गया।';
//     }
// }

// // Listen for messages
// client.on('message', async msg => {
//     console.log(`Message received from ${msg.from}:  `, msg.body);

//     const reply = await generateReply(msg.from, msg.body);
//     client.sendMessage(msg.from, reply);
// });

// client.initialize();


require('dotenv').config();
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');

// Initialize the OpenAI client with v4 syntax
const openai = new OpenAI({
    apiKey: process.env.SECRET_KEY // This can be omitted if OPENAI_API_KEY is set in environment variables
});

// Initialize WhatsApp client
const client = new Client();

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

let conversations = {};
let pendingMessages = {}; // Object to accumulate messages during the waiting period

function getInitialSystemMessage() {
    return { "role": "system", "content": "You are a personal Bot of Deepak Joshi, designed to reply on WhatsApp on his behalf. Donot let the sender know that this is a bot. Deepak is known for his humor, sarcasm, and positivity. He is currently a third-year B.Tech IT student at GGSIPU. Please respond in Hinglish using emojis and mimic Deepak's style." };
}

// Object to track timers for each chat
let messageTimers = {};

function accumulateMessage(chatId, message) {
    if (pendingMessages[chatId]) {
        pendingMessages[chatId] += "\n" + message; // Append new message with a newline
    } else {
        pendingMessages[chatId] = message;
    }
}

async function processMessage(chatId) {
    // Initialize conversation history if it doesn't exist for this chat
    if (!conversations[chatId]) {
        conversations[chatId] = [getInitialSystemMessage()];
    }

    // Push the accumulated message to the conversation history
    if (pendingMessages[chatId]) {
        conversations[chatId].push({ "role": "user", "content": pendingMessages[chatId] });
        delete pendingMessages[chatId]; // Clear the accumulated messages
    }

    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: conversations[chatId],
        });

        console.log(chatCompletion.choices[0].message.content);

        // Add the generated reply to the conversation history
        conversations[chatId].push({ "role": "assistant", "content": chatCompletion.choices[0].message.content });

        // Wait for 2 seconds before sending the reply
        setTimeout(() => {
            client.sendMessage(chatId, chatCompletion.choices[0].message.content.trim());
        }, 2000);
    } catch (error) {
        handleOpenAIError(error);
        // Send error message after a delay
        setTimeout(() => {
            client.sendMessage(chatId, 'क्षमा करें, कुछ गलत हो गया।');
        }, 2000);
    }
}

function handleOpenAIError(error) {
    if (error instanceof OpenAI.APIError) {
        console.error(error.status);
        console.error(error.message);
        console.error(error.code);
        console.error(error.type);
    } else {
        console.error(error);
    }
}

// Listen for messages
client.on('message', msg => {
    console.log('Message received:', msg.body);
    accumulateMessage(msg.from, msg.body);

    // Cancel any existing timer for this chat
    if (messageTimers[msg.from]) {
        clearTimeout(messageTimers[msg.from]);
    }

    // Set a new timer
    messageTimers[msg.from] = setTimeout(() => {
        processMessage(msg.from);
    }, 1000); // Wait for 1 second to batch messages
});

client.initialize();
