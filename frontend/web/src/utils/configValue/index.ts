export type ConfigValue = string | number | boolean | null;

export type ConfigValueMap = Record<string, { config_value?: ConfigValue } | undefined>;

export function getConfigValue(
  configData: ConfigValueMap | undefined | null,
  keys: string[],
  fallback = "",
): string {
  for (const key of keys) {
    const value = configData?.[key]?.config_value;

    if (value === undefined || value === null) {
      continue;
    }

    const normalizedValue = String(value).trim();

    if (normalizedValue !== "") {
      return normalizedValue;
    }
  }

  return fallback;
}
