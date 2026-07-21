import { getHttp } from "./http";

export interface StatementApiResponse {
  id: string;
  order: number;
  chinese: string;
  english: string;
  soundmark: string;
  posTags: string | null;
  syntaxTags: string | null;
  courseId: string;
}

export async function updateStatement(
  statementId: string,
  data: {
    chinese?: string;
    english?: string;
    soundmark?: string;
    posTags?: number[][] | null;
    syntaxTags?: (string | number)[][] | null;
    order?: number;
  },
) {
  const http = getHttp();
  return await http<StatementApiResponse>(`/statement/${statementId}`, {
    method: "PUT",
    body: data,
  });
}

export async function deleteStatement(statementId: string) {
  const http = getHttp();
  return await http<{ success: boolean; message: string }>(`/statement/${statementId}`, {
    method: "DELETE",
  });
}
