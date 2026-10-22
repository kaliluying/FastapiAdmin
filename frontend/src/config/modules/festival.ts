/**
 * 可选的手动排期庆祝活动。
 *
 * 内置公共节日保留在 ``festival.builtin.ts`` 中。部署后的产品有实际运营公告需求前，
 * 请将此列表保持为空。
 */
import type { FestivalConfig } from "@/types/config";

export const festivalConfigList: FestivalConfig[] = [];

export { buildBuiltinSolarFestivals } from "./festival.builtin";
