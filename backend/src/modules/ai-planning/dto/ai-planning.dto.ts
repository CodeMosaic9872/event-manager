import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateConversationDto {
  @ApiPropertyOptional({ description: 'Anonymous token for unauthenticated sessions', example: 'anon_abc123' })
  @IsOptional()
  @IsString()
  anonymousToken?: string;

  @ApiPropertyOptional({ description: 'Optional context payload for conversation initialization' })
  @IsOptional()
  @IsObject()
  context?: Record<string, unknown>;
}

export class SendMessageDto {
  @ApiProperty({ description: 'User prompt to AI planner', example: 'Suggest venues for 150 guests in Haifa.' })
  @IsString()
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({ description: 'Anonymous token for quota/accounting', example: 'anon_abc123' })
  @IsOptional()
  @IsString()
  anonymousToken?: string;

  @ApiPropertyOptional({ description: 'Event type context', example: 'wedding' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ description: 'Budget context', example: 12000 })
  @IsOptional()
  @IsNumber()
  budget?: number;

  @ApiPropertyOptional({ description: 'Location context', example: 'Haifa' })
  @IsOptional()
  @IsString()
  location?: string;
}
