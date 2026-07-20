export class UpdateStatementDto {
  chinese?: string;
  english?: string;
  soundmark?: string;
  posTags?: number[][] | null;
  syntaxTags?: (string | number)[][] | null;
  order?: number;
}