import axios from 'axios';

const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';
const HF_TOKEN = process.env.HUGGINGFACE_API_KEY;

export async function summarizeText(text: string) {
  try {
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/sshleifer/distilbart-cnn-12-6`,
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
      }
    );
    return response.data[0]?.summary_text || '';
  } catch (error) {
    console.error('Summarization Error:', error);
    throw error;
  }
}

export async function askQuestion(question: string, context: string) {
  try {
    const response = await axios.post(
      `${HUGGINGFACE_API_URL}/distilbert/distilbert-base-cased-distilled-squad`,
      {
        inputs: {
          question: question,
          context: context,
        },
      },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('QA Error:', error);
    throw error;
  }
}
