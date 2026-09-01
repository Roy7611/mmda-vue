export type LocaleMessages = Record<string, unknown>;

function isMessageGroup(value: unknown): value is LocaleMessages {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function mergeLocaleMessages(
  ...messages: LocaleMessages[]
): LocaleMessages {
  const result: LocaleMessages = {};

  for (const message of messages) {
    for (const [key, value] of Object.entries(message)) {
      const current = result[key];
      result[key] =
        isMessageGroup(current) && isMessageGroup(value)
          ? mergeLocaleMessages(current, value)
          : isMessageGroup(value)
            ? mergeLocaleMessages(value)
            : value;
    }
  }

  return result;
}
