import { beforeEach, describe, expect, it, vi } from "vitest";
import RoleAPI from "@/api/module_system/role";

const { request } = vi.hoisted(() => ({ request: vi.fn() }));

vi.mock("@utils", () => ({ request }));

describe("Role export API contract", () => {
  beforeEach(() => vi.clearAllMocks());

  it("exports a filtered Excel using the backend GET route", async () => {
    const query = { page_no: 1, page_size: 10, name: "管理员", status: 0 };
    const response = { data: new Blob(["export"]) };
    request.mockResolvedValue(response);

    expect(await RoleAPI.exportRole(query)).toBe(response);
    expect(request).toHaveBeenCalledWith({
      url: "/system/role/export",
      method: "get",
      params: query,
      responseType: "blob",
    });
  });
});
