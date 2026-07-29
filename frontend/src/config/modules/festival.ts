/**
 * Optional manually scheduled celebrations.
 *
 * Built-in public holidays remain in ``festival.builtin.ts``. Keep this list
 * empty until the deployed product has a real operational announcement.
 */
import type { FestivalConfig } from "@/types/config";

export const festivalConfigList: FestivalConfig[] = [];

export { buildBuiltinSolarFestivals } from "./festival.builtin";
