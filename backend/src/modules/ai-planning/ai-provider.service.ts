import { Injectable } from '@nestjs/common';

export type PlanningLlmInput = {
  message: string;
  eventType?: string;
  budget?: number;
  location?: string;
  recommendationCount: number;
  memorySummary?: string;
};

@Injectable()
export class AiProviderService {
  async generatePlanningJson(input: PlanningLlmInput): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    if (apiKey) {
      const systemPrompt =
        'Return strictly valid JSON with keys: assistantMessage, followUpQuestions, budgetTips, eventIdeas, ctaHints{openMarketplace,publishJob}.';
      const userPrompt = JSON.stringify(input);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });
      if (!response.ok) {
        throw new Error(`provider_http_${response.status}`);
      }
      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('provider_empty');
      }
      return content;
    }

    const eventTypeText = input.eventType ? ` for ${input.eventType}` : '';
    const locationText = input.location ? ` in ${input.location}` : '';
    const budgetText = input.budget ? ` (budget around ${input.budget})` : '';
    const memoryText = input.memorySummary ? ` Context: ${input.memorySummary}` : '';
    return JSON.stringify({
      assistantMessage: `I found ${input.recommendationCount} supplier options${eventTypeText}${locationText}${budgetText}.${memoryText}`,
      followUpQuestions: ['What is your event date?', 'Do you want premium or budget-friendly options?'],
      budgetTips: input.budget
        ? [`Keep 10-15% of your budget as contingency.`]
        : ['Set a budget range to improve supplier matching.'],
      eventIdeas: ['Consider adding a themed welcome experience.'],
      ctaHints: {
        openMarketplace: true,
        publishJob: input.recommendationCount === 0,
      },
    });
  }
}
