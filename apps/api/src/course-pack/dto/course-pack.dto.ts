import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  registerDecorator,
  type ValidationArguments,
  type ValidationOptions,
  ValidateNested,
  ValidatorConstraint,
  type ValidatorConstraintInterface,
} from "class-validator";

const MAX_TAG_COUNT_PER_STATEMENT = 200;
const MAX_TOTAL_VOCAB = 1_000_000;
const POS_TAG_TUPLE_LENGTH = 3;
const SYNTAX_TAG_TUPLE_LENGTH = 4;

export type PosTagTuple = [startIndex: number, endIndex: number, label: string];
export type SyntaxTagTuple = [startIndex: number, endIndex: number, label: string, type: string];

/** 校验标注 tuple 的长度、索引顺序和文本标签，索引上界由服务层结合英文单词数校验。 */
function isValidTagTupleList(value: unknown, tupleLength: number): boolean {
  if (!Array.isArray(value) || value.length > MAX_TAG_COUNT_PER_STATEMENT) return false;
  return value.every((item) =>
    Array.isArray(item)
    && item.length === tupleLength
    && Number.isInteger(item[0])
    && Number.isInteger(item[1])
    && item[0] >= 0
    && item[1] >= item[0]
    && item.slice(2).every((label) => typeof label === "string" && Boolean(label.trim())),
  );
}

@ValidatorConstraint({ name: "isPosTagTupleList", async: false })
class IsPosTagTupleListConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidTagTupleList(value, POS_TAG_TUPLE_LENGTH);
  }

  defaultMessage(_args: ValidationArguments): string {
    return "posTags must contain [startIndex, endIndex, label] tuples";
  }
}

@ValidatorConstraint({ name: "isSyntaxTagTupleList", async: false })
class IsSyntaxTagTupleListConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isValidTagTupleList(value, SYNTAX_TAG_TUPLE_LENGTH);
  }

  defaultMessage(_args: ValidationArguments): string {
    return "syntaxTags must contain [startIndex, endIndex, label, type] tuples";
  }
}

function IsPosTagTupleList(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsPosTagTupleListConstraint,
    });
  };
}

function IsSyntaxTagTupleList(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsSyntaxTagTupleListConstraint,
    });
  };
}

export class CourseStatementDto {
  @IsString()
  @Length(1, 1000)
  @Matches(/\S/)
  chinese!: string;

  @IsString()
  @Length(1, 1000)
  @Matches(/\S/)
  english!: string;

  @IsOptional()
  @IsString()
  @Length(0, 1000)
  soundmark?: string;

  @IsOptional()
  @IsArray()
  @IsPosTagTupleList()
  posTags?: PosTagTuple[];

  @IsOptional()
  @IsArray()
  @IsSyntaxTagTupleList()
  syntaxTags?: SyntaxTagTuple[];
}

export class CourseUnitDto {
  @IsString()
  @Length(1, 256)
  @Matches(/\S/)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(1000)
  @ValidateNested({ each: true })
  @Type(() => CourseStatementDto)
  statements!: CourseStatementDto[];
}

export class CreateCoursePackDto {
  @IsOptional()
  @IsString()
  @Length(0, 256)
  name?: string;

  @IsString()
  @Length(1, 256)
  @Matches(/\S/)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 4000)
  description?: string;

  @IsOptional()
  @IsString()
  @Length(0, 64)
  version?: string;

  @IsOptional()
  @IsString()
  @Length(0, 128)
  level?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(50)
  @ArrayUnique()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Matches(/\S/, { each: true })
  @MaxLength(128, { each: true })
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  totalUnits?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(MAX_TOTAL_VOCAB)
  totalVocab?: number;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CourseUnitDto)
  courses!: CourseUnitDto[];
}

export class SaveCourseProgressDto {
  @IsString()
  @Length(1, 128)
  courseId!: string;

  @IsInt()
  @Min(0)
  @Max(999999)
  statementIndex!: number;
}
