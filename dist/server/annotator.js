import OpenAI from "openai";
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
/**
 * Simple annotation function as requested - calls OpenAI and returns string array
 * @param text The input text to analyze
 * @returns Array of annotation strings
 */
export async function annotate(text) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
    }
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
            messages: [
                {
                    role: "user",
                    content: `Analyze this text and provide 3-5 key insights as annotations: "${text}"`
                }
            ],
            temperature: 0.3,
            max_tokens: 500
        });
        const result = response.choices[0].message.content;
        if (!result) {
            throw new Error("Empty response from OpenAI");
        }
        // Parse the response into an array of strings
        const annotations = result.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => line.replace(/^[-*•]\s*/, '')) // Remove bullet points
            .filter(line => line.length > 0);
        return annotations;
    }
    catch (error) {
        if (error instanceof OpenAI.APIError) {
            if (error.status === 401) {
                throw new Error("Invalid OpenAI API key");
            }
            else if (error.status === 429) {
                throw new Error("OpenAI API rate limit exceeded");
            }
            throw new Error(`OpenAI API error: ${error.message}`);
        }
        throw error;
    }
}
/**
 * Advanced annotation function with structured analysis
 * @param text The input text to analyze
 * @returns Array of annotation strings describing the text analysis
 */
export async function annotateTextWithAI(text) {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OpenAI API key not configured");
    }
    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    });
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert text analyzer for the Fanno AI platform. Analyze the provided text and return annotations as a JSON array of strings. Focus on:

1. Technical complexity and readability
2. Platform-specific terminology (AI, agents, workflows, automation, orchestration)
3. Sentiment and tone analysis
4. Action items and requirements identification
5. Technical concepts and frameworks mentioned
6. Code quality indicators if code is present
7. Security or compliance considerations if relevant

Return your analysis as a JSON object with this exact format:
{
  "annotations": [
    "annotation1",
    "annotation2",
    "annotation3"
  ]
}

Keep annotations concise but informative. Focus on actionable insights.`
                },
                {
                    role: "user",
                    content: text
                }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
            max_tokens: 800
        });
        const result = response.choices[0].message.content;
        if (!result) {
            throw new Error("Empty response from OpenAI");
        }
        const parsed = JSON.parse(result);
        if (!parsed.annotations || !Array.isArray(parsed.annotations)) {
            throw new Error("Invalid response format from OpenAI");
        }
        return parsed.annotations;
    }
    catch (error) {
        if (error instanceof OpenAI.APIError) {
            if (error.status === 401) {
                throw new Error("Invalid OpenAI API key");
            }
            else if (error.status === 429) {
                throw new Error("OpenAI API rate limit exceeded");
            }
            else if (error.status === 403) {
                throw new Error("OpenAI API access forbidden - check your API key permissions");
            }
            throw new Error(`OpenAI API error: ${error.message}`);
        }
        if (error instanceof SyntaxError) {
            throw new Error("Failed to parse OpenAI response");
        }
        throw error;
    }
}
/**
 * Fallback annotation function for when OpenAI is unavailable
 * This provides basic text analysis as a backup
 */
export function generateBasicAnnotations(text) {
    const annotations = [];
    // Basic text metrics
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const avgWordsPerSentence = Math.round(wordCount / sentenceCount);
    annotations.push(`Text contains ${wordCount} words across ${sentenceCount} sentences`);
    if (avgWordsPerSentence > 20) {
        annotations.push("Complex sentence structure detected - consider breaking into shorter sentences");
    }
    else if (avgWordsPerSentence < 10) {
        annotations.push("Simple sentence structure - good for readability");
    }
    // Technical keyword detection
    const technicalTerms = [
        'API', 'SDK', 'OpenAPI', 'microservice', 'database', 'authentication', 'authorization',
        'JWT', 'OAuth', 'REST', 'GraphQL', 'docker', 'kubernetes', 'cloud', 'deployment',
        'typescript', 'javascript', 'react', 'node', 'express', 'webhook', 'endpoint'
    ];
    const foundTerms = technicalTerms.filter(term => text.toLowerCase().includes(term.toLowerCase()));
    if (foundTerms.length > 0) {
        annotations.push(`Technical concepts identified: ${foundTerms.join(', ')}`);
    }
    // Platform-specific terms
    const fannoTerms = ['agent', 'workflow', 'automation', 'AI', 'platform', 'orchestration', 'integration'];
    const foundFannoTerms = fannoTerms.filter(term => text.toLowerCase().includes(term.toLowerCase()));
    if (foundFannoTerms.length > 0) {
        annotations.push(`Platform-related content detected: ${foundFannoTerms.join(', ')}`);
    }
    // Basic sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'perfect', 'successful', 'efficient'];
    const negativeWords = ['bad', 'terrible', 'awful', 'failed', 'error', 'broken', 'issue'];
    const positiveCount = positiveWords.filter(word => text.toLowerCase().includes(word)).length;
    const negativeCount = negativeWords.filter(word => text.toLowerCase().includes(word)).length;
    if (positiveCount > negativeCount) {
        annotations.push("Positive tone detected");
    }
    else if (negativeCount > positiveCount) {
        annotations.push("Negative tone detected - may require attention");
    }
    else {
        annotations.push("Neutral tone");
    }
    // Action items detection
    const actionWords = ['should', 'must', 'need to', 'required', 'implement', 'create', 'build', 'deploy'];
    const foundActions = actionWords.filter(word => text.toLowerCase().includes(word.toLowerCase()));
    if (foundActions.length > 0) {
        annotations.push("Action items or requirements identified");
    }
    return annotations;
}
//# sourceMappingURL=annotator.js.map