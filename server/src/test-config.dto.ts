// test-config.dto.ts
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class QuestionDto {
  @IsString()
  id: string;

  @IsString()
  text: string;

  @IsNotEmpty()
  translations: Record<string, string>;

  isReversed: boolean;

  @IsString()
  target: string;

  weight?: number;
}

class OutcomeDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNotEmpty()
  translations: Record<string, string>;

  @IsString()
  description: string;
}

export class TestConfigDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  scoringType: string;

  @IsString()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  questions: QuestionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OutcomeDto)
  outcomes: OutcomeDto[];

  customScoring?: string;
}