import Groq from 'groq-sdk';


const groq = new Groq();

let generatedSuggestion = '';

export const getGeneratedSuggestion = () => generatedSuggestion;

export const setGeneratedSuggestion = (suggestion: string) => {
    generatedSuggestion = suggestion;
};

export const getCompletion = async (text: string) => {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                { role: 'system', content: 'You take in the incomplete code and return what would be needed to complete it.' },
                { role: 'user', content: text }
            ],
            model: 'llama3-8b-8192',
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false
        });
        return response.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error getting Groq completion:', error);
        return '';
    }
};



