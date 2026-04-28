import { BadRequestException } from '@nestjs/common';

export type ParsedAiOutput = {
  assistantMessage: string;
  followUpQuestions: string[];
  budgetTips: string[];
  eventIdeas: string[];
  ctaHints: { openMarketplace: boolean; publishJob: boolean };
};

export function parseAiOutput(raw: string): ParsedAiOutput {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new BadRequestException('AI output parse_error');
  }

  const candidate = parsed as Partial<ParsedAiOutput>;
  if (
    typeof candidate.assistantMessage !== 'string' ||
    !Array.isArray(candidate.followUpQuestions) ||
    !Array.isArray(candidate.budgetTips) ||
    !Array.isArray(candidate.eventIdeas) ||
    typeof candidate.ctaHints !== 'object' ||
    candidate.ctaHints === null
  ) {
    throw new BadRequestException('AI output schema_error');
  }

  return {
    assistantMessage: candidate.assistantMessage,
    followUpQuestions: candidate.followUpQuestions.map(String),
    budgetTips: candidate.budgetTips.map(String),
    eventIdeas: candidate.eventIdeas.map(String),
    ctaHints: {
      openMarketplace: Boolean(candidate.ctaHints.openMarketplace),
      publishJob: Boolean(candidate.ctaHints.publishJob),
    },
  };
}
