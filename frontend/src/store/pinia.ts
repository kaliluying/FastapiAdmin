import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

export const store = createPinia().use(piniaPluginPersistedstate);
