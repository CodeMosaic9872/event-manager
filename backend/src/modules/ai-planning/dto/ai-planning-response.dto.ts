import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationResponseDto {
  @ApiProperty({ example: 'conv_123' })
  id!: string;

  @ApiProperty({ example: 'usr_123', nullable: true })
  userId!: string | null;

  @ApiProperty({ example: null, nullable: true })
  anonymousSessionId!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: { eventType: 'wedding' } })
  contextJson!: Record<string, unknown>;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

class AiMessageDto {
  @ApiProperty({ example: 'msg_1' })
  id!: string;

  @ApiProperty({ example: 'USER' })
  role!: string;

  @ApiProperty({ example: 'Need venue suggestions' })
  content!: string;

  @ApiPropertyOptional({ nullable: true })
  tokenCount!: number | null;

  @ApiPropertyOptional({ nullable: true })
  latencyMs!: number | null;

  @ApiProperty()
  createdAt!: Date;
}

class AiConversationMetaDto {
  @ApiProperty({ example: 'conv_123' })
  id!: string;

  @ApiProperty({ example: 'usr_123', nullable: true })
  userId!: string | null;

  @ApiProperty({ example: null, nullable: true })
  anonymousSessionId!: string | null;

  @ApiProperty({ example: 'ACTIVE' })
  status!: string;

  @ApiProperty({ example: { eventType: 'wedding' } })
  contextJson!: Record<string, unknown> | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class ConversationResponseDto {
  @ApiProperty({ type: AiConversationMetaDto })
  conversation!: AiConversationMetaDto;

  @ApiProperty({ type: [AiMessageDto] })
  items!: AiMessageDto[];

  @ApiProperty({ example: 42 })
  totalItems!: number;
}

class SendMessageUsageDto {
  @ApiProperty({ example: 420 })
  promptTokens!: number;

  @ApiProperty({ example: 180 })
  completionTokens!: number;

  @ApiProperty({ example: 600 })
  totalTokens!: number;
}

class RecommendationItemDto {
  @ApiProperty({ example: 'sup_123' })
  supplierId!: string;

  @ApiProperty({ example: 'verified, category fit, location fit' })
  reason!: string;

  @ApiProperty({ example: 0.83 })
  confidence!: number;
}

class DecisionTraceDto {
  @ApiProperty({ example: 17 })
  retrievalCandidates!: number;

  @ApiProperty({ example: null, nullable: true })
  failureTag!: string | null;

  @ApiProperty({ example: 'wedding', nullable: true })
  eventTypeResolved!: string | null;

  @ApiProperty({ description: 'True when the user changed event type vs prior conversation context' })
  contextReset!: boolean;
}

export class SendMessageResponseDto {
  @ApiProperty({ example: 'conv_123' })
  conversationId!: string;

  @ApiProperty({ example: 'Based on your budget, consider ...' })
  reply!: string;

  @ApiProperty({ type: [String], example: ['What is your event date?'] })
  followUpQuestions!: string[];

  @ApiProperty({ type: [String] })
  budgetTips!: string[];

  @ApiProperty({ type: [String] })
  eventIdeas!: string[];

  @ApiProperty({ type: SendMessageUsageDto })
  usage!: SendMessageUsageDto;

  @ApiProperty({ type: [RecommendationItemDto] })
  recommendations!: RecommendationItemDto[];

  @ApiProperty({ type: [String], example: ['cat_music', 'cat_photo'] })
  suggestedCategories!: string[];

  @ApiProperty({
    example: {
      openMarketplace: true,
      publishJob: false,
    },
  })
  hints!: Record<string, boolean>;

  @ApiProperty({ example: 'msg_assistant_1' })
  messageId!: string;

  @ApiProperty({ example: 'continue' })
  gatingStatus!: string;

  @ApiProperty({ type: DecisionTraceDto })
  decisionTrace!: DecisionTraceDto;
}

export class AiRecommendationLogResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  conversationId!: string;

  @ApiProperty()
  messageId!: string;

  @ApiPropertyOptional({ nullable: true })
  supplierId!: string | null;

  @ApiPropertyOptional({ nullable: true, description: 'Decimal stored as number in JSON' })
  score!: number | null;

  @ApiPropertyOptional({ nullable: true })
  reasonsJson!: Record<string, unknown> | null;

  @ApiPropertyOptional({ nullable: true })
  failureTag!: string | null;

  @ApiPropertyOptional({ nullable: true })
  latencyMs!: number | null;

  @ApiPropertyOptional({ nullable: true })
  clickedAt!: Date | null;

  @ApiPropertyOptional({ nullable: true })
  acceptedAt!: Date | null;

  @ApiProperty()
  createdAt!: Date;
}
