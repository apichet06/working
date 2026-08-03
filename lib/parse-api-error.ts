// src/lib/parse-api-error.ts
type ApiErrorPayload = {
    message?: string;
    details?: {
        provider?: string;
        path?: string;
    };
};

export function parseApiError(err: unknown, defaultMessage: string): string {
    if (err instanceof Error) {
        const match = err.message.match(/API error \d+:\s*(.*)$/);
        if (match && match[1]) {
            try {
                const payload = JSON.parse(match[1]) as ApiErrorPayload;
                if (payload.message) {
                    const provider = payload.details?.provider?.trim();
                    const path = payload.details?.path?.trim();
                    const source = [provider?.toUpperCase(), path].filter(Boolean).join(" ");
                    return source ? `${payload.message} (${source})` : payload.message;
                }
            } catch {
                return defaultMessage;
            }
        }

        if (err.message && err.message !== "Error") {
            return err.message;
        }
    }

    return defaultMessage;
}
