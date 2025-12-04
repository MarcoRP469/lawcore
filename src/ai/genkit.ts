
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// Firebase Admin no se inicializa aquí.
// El rol de administrador se maneja a través de la colección /admins en Firestore.

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
