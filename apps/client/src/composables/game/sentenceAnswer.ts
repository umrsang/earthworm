const TERMINAL_PUNCTUATION_PATTERN = /[.!?。！？]+$/;
const MULTIPLE_SPACE_PATTERN = /\s+/g;
const QUOTE_PATTERN = /[‘’“”]/g;
const TOKEN_PATTERN = /[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*|[^A-Za-z0-9\s]+/g;
const WORD_TOKEN_PATTERN = /^[A-Za-z0-9]+(?:['’-][A-Za-z0-9]+)*$/;

export interface SentenceToken {
  value: string;
  type: "word" | "punctuation";
  wordIndex: number | null;
}

/** 统一判题容错规则，忽略大小写、多余空格、弯引号和句末标点。 */
export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(QUOTE_PATTERN, "'")
    .replace(TERMINAL_PUNCTUATION_PATTERN, "")
    .replace(MULTIPLE_SPACE_PATTERN, " ");
}

/** 将英文句子拆为可输入的单词槽和只读标点。 */
export function tokenizeSentence(sentence: string): SentenceToken[] {
  const rawTokens = sentence.match(TOKEN_PATTERN) || [];
  let wordIndex = 0;
  return rawTokens.map((value) => {
    if (!WORD_TOKEN_PATTERN.test(value)) return { value, type: "punctuation", wordIndex: null };
    return { value, type: "word", wordIndex: wordIndex++ };
  });
}

export function splitInputWords(value: string): string[] {
  return value.trim().split(MULTIPLE_SPACE_PATTERN).filter(Boolean);
}

export function getExpectedWords(sentence: string): string[] {
  return tokenizeSentence(sentence)
    .filter((token) => token.type === "word")
    .map((token) => token.value);
}

export function getIncorrectWordIndexes(answer: string, expectedSentence: string): number[] {
  const inputWords = splitInputWords(answer);
  return getExpectedWords(expectedSentence).flatMap((word, index) =>
    normalizeAnswer(word) === normalizeAnswer(inputWords[index] || "") ? [] : [index],
  );
}
