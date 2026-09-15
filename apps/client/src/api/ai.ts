import { STORAGE_KEYS } from "../constants";
import { apiClient } from "./client";

const AI_REQUEST_TIMEOUT_MS = 120000;

export interface AiModelConfig {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  apiKeyMasked: string;
  isActive: boolean;
  createdAt: string | number;
  updatedAt: string | number;
}

export interface SaveAiModelPayload {
  name: string;
  baseUrl: string;
  model: string;
  apiKey?: string;
  isActive?: boolean;
}

export interface StatementAiAnalysis {
  cached: boolean;
  source: "personal" | "system" | "generated";
  modelName: string;
  generationCount: number;
  remainingGenerations: number;
  canRegenerate: boolean;
  item: {
    statementId: string;
    english: string;
    chinese: string;
    wordMnemonics: Array<{ word: string; mnemonic: string }>;
    sentenceAnalysis: string;
  };
}

export interface StreamCallbacks {
  onDelta?: (delta: string) => void;
  onDone: (data: StatementAiAnalysis) => void;
  onError: (error: Error) => void;
}

export function getAiModelsApi(): Promise<AiModelConfig[]> {
  return apiClient.get("/admin/ai-models") as unknown as Promise<AiModelConfig[]>;
}

/** @param payload 模型名称、接口地址、模型标识、API Key 和启用状态 */
export function createAiModelApi(payload: SaveAiModelPayload): Promise<AiModelConfig> {
  return apiClient.post("/admin/ai-models", payload) as unknown as Promise<AiModelConfig>;
}

/** @param id 模型配置 ID @param payload 更新后的模型配置，API Key 留空时保留原值 */
export function updateAiModelApi(id: string, payload: SaveAiModelPayload): Promise<AiModelConfig> {
  return apiClient.put(`/admin/ai-models/${id}`, payload) as unknown as Promise<AiModelConfig>;
}

/** @param id 要启用的模型配置 ID */
export function activateAiModelApi(id: string): Promise<AiModelConfig> {
  return apiClient.put(`/admin/ai-models/${id}/activate`) as unknown as Promise<AiModelConfig>;
}

/** @param id 要删除的模型配置 ID */
export function deleteAiModelApi(id: string): Promise<{ id: string }> {
  return apiClient.delete(`/admin/ai-models/${id}`) as unknown as Promise<{ id: string }>;
}

/** @param statementId 要分析的句子 ID @param regenerate 是否跳过缓存并使用个人生成额度 */
export function analyzeStatementApi(statementId: string, regenerate = false): Promise<StatementAiAnalysis> {
  return apiClient.post(`/ai-analysis/statements/${statementId}`, { regenerate }, { timeout: AI_REQUEST_TIMEOUT_MS }) as unknown as Promise<StatementAiAnalysis>;
}

/**
 * 流式分析句子，通过 SSE 实时接收打字机内容并在完成时获得结构化数据
 * @param statementId 待分析的句子 ID
 * @param regenerate 是否跳过缓存并使用个人生成额度
 * @param callbacks 流式事件监听回调
 * @returns 中止连接的函数
 */
export function analyzeStatementStreamApi(statementId: string, regenerate: boolean, callbacks: StreamCallbacks): () => void {
  const controller = new AbortController();
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

  (async () => {
    try {
      const response = await fetch(`/api/ai-analysis/statements/${statementId}/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ regenerate }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("ReadableStream not supported");

      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) {
            currentEvent = "";
            continue;
          }
          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.slice(6).trim();
            continue;
          }
          if (trimmed.startsWith("data:")) {
            const dataStr = trimmed.slice(5).trim();
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === "delta") {
                callbacks.onDelta?.(data.delta || "");
              } else if (currentEvent === "done") {
                callbacks.onDone(data as StatementAiAnalysis);
              } else if (currentEvent === "error") {
                callbacks.onError(new Error(data.message || "AI 分析失败"));
              }
            } catch {
              // 忽略不可解析的数据块
            }
          }
        }
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      callbacks.onError(err instanceof Error ? err : new Error(String(err)));
    }
  })();

  return () => controller.abort();
}
