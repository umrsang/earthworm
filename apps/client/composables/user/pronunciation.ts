import { ref } from "vue";

/**
 * 有道 Web 发音 API 接口
 *
 * 美式发音：https://dict.youdao.com/dictvoice?type=2&audio=word
 * 英式发音：https://dict.youdao.com/dictvoice?type=1&audio=word
 */

export enum PronunciationType {
  American = "American",
  British = "British",
}

export const pronunciationLabels: { [key in PronunciationType]: string } = {
  [PronunciationType.American]: "美音",
  [PronunciationType.British]: "英音",
};

const PRONUNCIATION_TYPE = "pronunciationType";
const pronunciation = ref<PronunciationType>(PronunciationType.American); // 默认美音
export function usePronunciation() {
  loadCache();

  function loadCache() {
    const type = getStore() || pronunciation.value;
    setStore(type);
  }

  function setStore(value: PronunciationType) {
    pronunciation.value = value;
    localStorage.setItem(PRONUNCIATION_TYPE, value);
  }

  function getStore(): PronunciationType {
    return localStorage.getItem(PRONUNCIATION_TYPE) as PronunciationType;
  }

  function getPronunciationType(): number {
    return pronunciation.value === PronunciationType.American ? 2 : 1;
  }

  function getPronunciationOptions() {
    return Object.entries(pronunciationLabels).map(([key, value]) => {
      return {
        label: value,
        value: key,
      };
    });
  }

  function getPronunciationUrl(english: string | undefined): string {
    // 有道对连字符和缩写形式（I'm, don't 等）会返回 500
    // 替换连字符为空格，展开常见缩写
    let sanitized = english || "";
    sanitized = sanitized.replace(/-/g, " ");
    sanitized = sanitized.replace(/(\w)'m\b/gi, "$1 am");
    sanitized = sanitized.replace(/(\w)'re\b/gi, "$1 are");
    sanitized = sanitized.replace(/(\w)'s\b/gi, "$1 is");
    sanitized = sanitized.replace(/(\w)'ll\b/gi, "$1 will");
    sanitized = sanitized.replace(/(\w)'ve\b/gi, "$1 have");
    sanitized = sanitized.replace(/(\w)'d\b/gi, "$1 would");
    sanitized = sanitized.replace(/(\w)n't\b/gi, "$1 not");
    sanitized = sanitized.replace(/let's\b/gi, "let us");
    // 去掉剩余的撇号
    sanitized = sanitized.replace(/'/g, "");
    return `https://dict.youdao.com/dictvoice?type=${getPronunciationType()}&audio=${sanitized}`;
  }

  // 切换发音
  function togglePronunciation(type: PronunciationType) {
    if (type !== pronunciation.value) setStore(type);
  }

  return {
    pronunciation,
    getPronunciationOptions,
    getPronunciationUrl,
    togglePronunciation,
  };
}
