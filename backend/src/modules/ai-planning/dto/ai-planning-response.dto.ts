import { ApiProperty } from '@nestjs/swagger';

export class CreateConversationResponseDto {
  @ApiProperty({ example: 'conv_123' })
  id!: string;

  @ApiProperty({ example: 'usr_123', nullable: true })
  userId!: string | null;

  @ApiProperty({ example: null, nullable: true })
  anonymousSessionId!: string | null;

  @ApiProperty({ example: { eventType: 'wedding' } })
  contextJson!: Record<string, unknown>;
}

class AiMessageDto {
  @ApiProperty({ example: 'msg_1' })
  id!: string;

  @ApiProperty({ example: 'user' })
  role!: string;

  @ApiProperty({ example: 'Need venue suggestions' })
  content!: string;
}

export class ConversationResponseDto {
  @ApiProperty({ example: 'conv_123' })
  id!: string;

  @ApiProperty({ type: [AiMessageDto] })
  messages!: AiMessageDto[];
}

class SendMessageUsageDto {
  @ApiProperty({ example: 420 })
  promptTokens!: number;

  @ApiProperty({ example: 180 })
  completionTokens!: number;

  @ApiProperty({ example: 600 })
  totalTokens!: number;
}

export class SendMessageResponseDto {
  @ApiProperty({ example: 'conv_123' })
  conversationId!: string;

  @ApiProperty({ example: 'Based on your budget, consider ...' })
  reply!: string;

  @ApiProperty({ type: SendMessageUsageDto })
  usage!: SendMessageUsageDto;
}
