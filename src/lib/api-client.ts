class ApiClient {
  private prefix = "/api";

  private request(url: string, init?: RequestInit) {
    const targetUrl = url.startsWith("/") ? `${this.prefix}${url}` : `${this.prefix}/${url}`;
    
    // Start fetch synchronously and store the promise
    const responsePromise = fetch(targetUrl, init).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
      }
      return res;
    });

    return {
      json: async <T>(): Promise<T> => {
        const res = await responsePromise;
        return res.json() as Promise<T>;
      },
    };
  }

  get(url: string, options?: { searchParams?: Record<string, string> }) {
    let targetUrl = url;
    if (options?.searchParams) {
      const qParams = new URLSearchParams(options.searchParams).toString();
      targetUrl += `?${qParams}`;
    }
    return this.request(targetUrl, { method: "GET" });
  }

  post(url: string, options: { json: any }) {
    return this.request(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.json),
    });
  }

  put(url: string, options: { json: any }) {
    return this.request(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options.json),
    });
  }

  delete(url: string) {
    return this.request(url, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
