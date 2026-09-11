import { PluginBridgeMessage, PluginRpcRequest, PluginRpcResponse } from '@nirmaanify/types';

export type RpcHandler<TPayload = any, TResult = any> = (payload: TPayload) => Promise<TResult> | TResult;

export class PluginRpcBridge {
  private handlers = new Map<string, RpcHandler>();
  private pendingRequests = new Map<
    string,
    { resolve: (val: any) => void; reject: (err: any) => void; timer: any }
  >();
  private targetOrigin: string;

  constructor(targetOrigin: string = '*') {
    this.targetOrigin = targetOrigin;
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  public registerHandler<P = any, R = any>(action: string, handler: RpcHandler<P, R>): void {
    this.handlers.set(action, handler);
  }

  public async callHost<P = any, R = any>(
    targetWindow: Window,
    action: string,
    payload: P,
    timeoutMs: number = 5000
  ): Promise<R> {
    const id = `rpc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const request: PluginRpcRequest<P> = {
      id,
      type: 'RPC_REQUEST',
      action,
      payload,
    };

    return new Promise<R>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`RPC timeout after ${timeoutMs}ms for action "${action}"`));
      }, timeoutMs);

      this.pendingRequests.set(id, { resolve, reject, timer });
      targetWindow.postMessage(request, this.targetOrigin);
    });
  }

  public replyToRequest<R = any>(targetWindow: Window, requestId: string, action: string, result?: R, error?: string): void {
    const response: PluginRpcResponse<R> = {
      id: requestId,
      type: 'RPC_RESPONSE',
      action,
      result,
      error,
    };
    targetWindow.postMessage(response, this.targetOrigin);
  }

  private async handleMessage(event: MessageEvent): Promise<void> {
    const data = event.data as PluginBridgeMessage;
    if (!data || typeof data !== 'object') return;

    if (data.type === 'RPC_REQUEST') {
      const req = data as PluginRpcRequest;
      const handler = this.handlers.get(req.action);
      if (!handler) {
        this.replyToRequest(event.source as Window, req.id, req.action, undefined, `No handler registered for action "${req.action}"`);
        return;
      }
      try {
        const result = await handler(req.payload);
        this.replyToRequest(event.source as Window, req.id, req.action, result);
      } catch (err: any) {
        this.replyToRequest(event.source as Window, req.id, req.action, undefined, err.message || 'Internal RPC error');
      }
    } else if (data.type === 'RPC_RESPONSE') {
      const res = data as PluginRpcResponse;
      const pending = this.pendingRequests.get(res.id);
      if (pending) {
        clearTimeout(pending.timer);
        this.pendingRequests.delete(res.id);
        if (res.error) {
          pending.reject(new Error(res.error));
        } else {
          pending.resolve(res.result);
        }
      }
    }
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('message', this.handleMessage.bind(this));
    }
    for (const [_, pending] of this.pendingRequests.entries()) {
      clearTimeout(pending.timer);
      pending.reject(new Error('RPC Bridge destroyed'));
    }
    this.pendingRequests.clear();
    this.handlers.clear();
  }
}
