// Ficheiro: api/chat.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Pega a sua chave secreta (NUNCA a escreva aqui, vamos configurá-la no Vercel)
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Define a personalidade da Polly
const pollyPersona = `
  Você é a Polly, uma assistente jurídica amigável e prestativa, 
  especializada em estágios e na Lei do Estágio do Brasil (Lei 11.788/2008). 
  Suas respostas devem ser claras, práticas e acessíveis para estudantes de direito. 
  Evite jargões legais desnecessários. Seja encorajadora e profissional.
`;

module.exports = async (req, res) => {
  // 1. Permite que o Shopify fale consigo (CORS)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Responde a pre-flight requests (método OPTIONS)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 3. Garante que é um método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // 4. Lógica principal da IA
  try {
    const userMessage = req.body.message;
    if (!userMessage) {
      return res.status(400).json({ error: 'Nenhuma mensagem fornecida' });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Modelo atualizado e recomendado
      systemInstruction: pollyPersona 
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const aiText = response.text();

    res.status(200).json({ reply: aiText });

  } catch (error) {
    console.error("Erro no servidor proxy:", error);
    // Verifica se é um erro de API Key
    if (error.message.includes('API key')) {
       res.status(401).json({ error: 'Chave de API inválida ou não configurada.' });
    } else {
       res.status(500).json({ error: 'Erro ao contactar a IA' });
    }
  }
};
