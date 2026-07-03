import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();

const readSource = (path: string) => readFileSync(resolve(root, path), "utf8");

describe("AI chat session switching", () => {
  it("accepts the project's success response shape when loading session detail", () => {
    const source = readSource("src/views/module_ai/chat/index.vue");

    expect(source).not.toContain("response.data?.code !== 0");
    expect(source).toContain("isSuccessResponse");
    expect(source).toContain("responseData?.success === true");
    expect(source).toContain("responseData?.code === 200");
  });

  it("keeps sidebar props reactive so selected sessions can be highlighted", () => {
    const source = readSource("src/views/module_ai/chat/components/FaSidebar.vue");

    expect(source).not.toContain(
      "const { currentSessionId, isCollapsed = false } = defineProps<Props>();"
    );
    expect(source).toContain("withDefaults(defineProps<Props>()");
    expect(source).toContain("props.currentSessionId");
  });
});
