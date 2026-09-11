import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";

interface RequestContextStore {
  requestId: string;
}

/** 在同一异步调用链中保存请求追踪 ID。 */
@Injectable()
export class RequestContextService {
  private readonly storage = new AsyncLocalStorage<RequestContextStore>();

  /**
   * @param requestId 当前请求追踪 ID
   * @param callback 在请求上下文中执行的后续处理
   */
  run(requestId: string, callback: () => void): void {
    this.storage.run({ requestId }, callback);
  }

  /** 获取当前异步调用链的请求追踪 ID。 */
  getRequestId(): string | undefined {
    return this.storage.getStore()?.requestId;
  }
}
