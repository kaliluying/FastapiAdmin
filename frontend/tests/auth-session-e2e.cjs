const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
const { runAcceptance } = require("./ux-e2e.cjs");

function deferred() {
  let resolve;
  const promise = new Promise((done) => (resolve = done));
  return { promise, resolve };
}

async function waitForGate(gate) {
  let timer;
  try {
    await Promise.race([
      gate.promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Controlled response did not arrive")), 30000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

async function run() {
  const frontend = "http://127.0.0.1:5179";
  const evidence = await (await fetch("http://127.0.0.1:8009/__ux_e2e/evidence")).json();
  const artifacts = evidence.artifacts;
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const checks = [];
  const errors = [];
  const releases = [];
  const accountB = { username: "auth_audit_b", password: "IsolatedAuthAudit42!" };
  let phase = "login";
  let refreshRequests = 0;
  let operationRequests = 0;
  let operationGate;
  let refreshGate;
  let infoGate;
  page.on("pageerror", (error) => errors.push({ phase, message: error.message }));
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.endsWith("/system/auth/token/refresh")) refreshRequests++;
  });

  function holdNextResponse() {
    const gate = { seen: deferred(), release: deferred() };
    releases.push(gate.release.resolve);
    return gate;
  }

  async function snapshot(targetPage = page) {
    return targetPage.evaluate(async () => {
      const { Auth } = await import("/src/utils/auth/index.ts");
      const { useUserStore } = await import("/src/store/modules/user.store.ts");
      const { router } = await import("/src/router/instance.ts");
      const user = useUserStore();
      return {
        // Credentials are compared in memory only and never written to evidence.
        accessToken: Auth.getAccessToken(),
        sessionKey: Auth.getSessionKey(),
        username: user.info.username,
        permissions: [...user.prems],
        menuNames: user.routeList.map((menu) => menu.route_name),
        routeA: router.hasRoute("AuthAuditA"),
        routeB: router.hasRoute("AuthAuditB"),
        isLogin: user.isLogin,
      };
    });
  }

  async function login(
    account = { username: "admin", password: "admin123" },
    { remember = true, targetPage = page } = {}
  ) {
    await targetPage.locator('input[name="username"]').fill(account.username);
    await targetPage.locator('input[name="password"]').fill(account.password);
    const rememberControl = targetPage.locator(".login-remember");
    if ((await rememberControl.getAttribute("class")).includes("is-checked") !== remember) {
      await rememberControl.click();
    }
    const response = targetPage.waitForResponse((item) =>
      new URL(item.url()).pathname.endsWith("/system/auth/login")
    );
    await targetPage.locator('input[name="password"]').press("Enter");
    assert.equal((await response).status(), 200);
    await targetPage.waitForURL(/#\/home(?:\?|$)/, { timeout: 30000 });
    await targetPage.getByRole("button", { name: "打开账户菜单" }).waitFor();
    const skip = targetPage.getByRole("button", { name: "跳过", exact: true });
    if (await skip.isVisible()) await skip.click();
    const state = await snapshot(targetPage);
    assert.equal(state.username, account.username);
    assert.equal(state.isLogin, true);
  }

  async function logout(targetPage = page) {
    await targetPage.getByRole("button", { name: "打开账户菜单" }).click();
    await targetPage.locator(".user-menu-action--logout").click();
    await targetPage
      .locator(".login-out-dialog")
      .getByRole("button", { name: "确定", exact: true })
      .click();
    await targetPage.locator('input[name="username"]').waitFor();
    const state = await snapshot(targetPage);
    assert.equal(state.accessToken, "");
    assert.equal(state.isLogin, false);
  }

  async function startOperation() {
    operationRequests = 0;
    await page.evaluate(async () => {
      const { request } = await import("/src/utils/http/index.ts");
      window.__authAuditOperation = request
        .get("/system/user/current/info", {
          params: { auth_audit: "operation" },
          showErrorMessage: false,
          showSuccessMessage: false,
        })
        .then(
          () => ({ rejected: false }),
          () => ({ rejected: true })
        );
    });
  }

  async function finishOperation() {
    return page.evaluate(async () => await window.__authAuditOperation);
  }

  const report = {
    passed: false,
    checks,
    pageErrors: errors,
    boundary: {
      services: evidence.boundary,
      browser: "real Chrome; real Vue/Pinia/router/Axios; HTTP over Vite proxy",
      substitutes:
        "page.route supplies controlled 401s and replaces menus with A/B audit-only routes; user identity, login/logout and refresh are real isolated API responses",
      usability:
        "AI simulated user: normal login, account menu, logout confirmation, recovery and relogin; desktop only",
    },
  };

  try {
    await page.context().route("**/*", (route) => {
      const url = new URL(route.request().url());
      return ["127.0.0.1", "localhost"].includes(url.hostname) ||
        ["data:", "blob:"].includes(url.protocol)
        ? route.continue()
        : route.abort();
    });
    await page.route(
      (url) =>
        url.pathname.endsWith("/system/user/current/info") && !url.searchParams.has("auth_audit"),
      async (route) => {
        const gate = infoGate;
        infoGate = undefined;
        const response = await route.fetch();
        const payload = await response.json();
        if (response.ok() && payload.data) {
          const account = payload.data.username === "admin" ? "A" : "B";
          payload.data.menus = [
            {
              id: account === "A" ? 90101 : 90102,
              name: `auth_audit_${account}`,
              title: `认证验收 ${account}`,
              type: 2,
              route_name: `AuthAudit${account}`,
              route_path: `/auth-audit/${account}`,
              component_path: "home/index",
              status: 1,
            },
          ];
          payload.data.permissions = [...(payload.data.permissions || []), `auth-audit:${account}`];
        }
        if (gate) {
          gate.seen.resolve();
          await gate.release.promise;
        }
        await route.fulfill({ response, json: payload });
      }
    );
    await page.route(
      (url) =>
        url.pathname.endsWith("/system/user/current/info") && url.searchParams.has("auth_audit"),
      async (route) => {
        operationRequests++;
        if (operationRequests > 1) {
          await route.fulfill({ status: 200, json: { code: 0, msg: "unexpected replay" } });
          return;
        }
        const gate = operationGate;
        operationGate = undefined;
        if (gate) {
          gate.seen.resolve();
          await gate.release.promise;
        }
        await route.fulfill({ status: 401, json: { code: 10401, msg: "audit expired" } });
      }
    );
    await page.route("**/system/auth/token/refresh", async (route) => {
      const gate = refreshGate;
      refreshGate = undefined;
      if (!gate) return route.continue();
      // Capture a real successful A refresh before logout revokes its credentials.
      const response = await route.fetch();
      assert.equal(response.status(), 200);
      const payload = await response.json();
      gate.seen.resolve();
      await gate.release.promise;
      await route.fulfill({ response, json: payload });
    });

    await page.goto(`${frontend}/#/login`);
    await login();
    await page.evaluate(async (account) => {
      const { default: UserAPI } = await import("/src/api/module_system/user.ts");
      await UserAPI.createUser({
        ...account,
        name: "认证隔离验收 B",
        is_superuser: false,
        status: 0,
      });
    }, accountB);
    assert.equal((await snapshot()).routeA, true);
    checks.push("UI login A succeeds; B is created through the isolated user API");

    phase = "late-401";
    const delayed401 = (operationGate = holdNextResponse());
    await startOperation();
    await waitForGate(delayed401.seen);
    await logout();
    await login(accountB);
    const bBefore401 = await snapshot();
    const refreshBefore401 = refreshRequests;
    delayed401.release.resolve();
    assert.equal((await finishOperation()).rejected, true);
    assert.equal(operationRequests, 1, "A operation must never replay as B");
    assert.equal(refreshRequests, refreshBefore401);
    assert.equal((await snapshot()).accessToken, bBefore401.accessToken);
    checks.push("A's 401 arriving after B login rejects without refresh or replay");

    phase = "late-refresh";
    await logout();
    await login();
    const delayedRefresh = (refreshGate = holdNextResponse());
    await startOperation();
    await waitForGate(delayedRefresh.seen);
    await logout();
    await login(accountB);
    const bBeforeRefresh = await snapshot();
    delayedRefresh.release.resolve();
    assert.equal((await finishOperation()).rejected, true);
    const bAfterRefresh = await snapshot();
    assert.equal(bAfterRefresh.accessToken, bBeforeRefresh.accessToken);
    assert.equal(bAfterRefresh.sessionKey, bBeforeRefresh.sessionKey);
    assert.equal(bAfterRefresh.username, accountB.username);
    assert.equal(operationRequests, 1);
    checks.push("A's real delayed refresh success cannot overwrite B or replay A");

    phase = "late-user-info";
    await logout();
    await login();
    const delayedInfo = (infoGate = holdNextResponse());
    await page.evaluate(async () => {
      const { useUserStore } = await import("/src/store/modules/user.store.ts");
      window.__authAuditInfo = useUserStore()
        .getUserInfo()
        .then(
          () => ({ rejected: false }),
          () => ({ rejected: true })
        );
    });
    await waitForGate(delayedInfo.seen);
    await logout();
    await login(accountB);
    delayedInfo.release.resolve();
    assert.equal((await page.evaluate(async () => await window.__authAuditInfo)).rejected, true);
    const bAfterInfo = await snapshot();
    assert.equal(bAfterInfo.username, accountB.username);
    assert.ok(bAfterInfo.permissions.includes("auth-audit:B"));
    assert.ok(!bAfterInfo.permissions.includes("auth-audit:A"));
    assert.deepEqual(bAfterInfo.menuNames, ["AuthAuditB"]);
    checks.push("A's delayed user info cannot replace B's info, permissions or menus");

    phase = "auth-expiry-routes";
    await logout();
    await login();
    const removedBeforeNavigation = await page.evaluate(async () => {
      const { redirectToLogin } = await import("/src/utils/auth/index.ts");
      const { router } = await import("/src/router/instance.ts");
      let removed = false;
      const stop = router.beforeEach((to) => {
        if (to.path === "/login") removed = !router.hasRoute("AuthAuditA");
        return true;
      });
      await redirectToLogin("认证验收：会话已过期，请重新登录");
      stop();
      return removed;
    });
    assert.equal(removedBeforeNavigation, true);
    await page.locator('input[name="username"]').waitFor();
    const expired = await snapshot();
    assert.equal(expired.routeA, false);
    assert.equal(expired.accessToken, "");
    await page.screenshot({
      path: path.join(artifacts, "auth-session-expired.png"),
      fullPage: true,
    });
    await login(accountB);
    const bAfterRelogin = await snapshot();
    assert.equal(bAfterRelogin.routeA, false);
    assert.equal(bAfterRelogin.routeB, true);
    await page.locator(".el-menu-item").filter({ hasText: "认证验收 B" }).waitFor();
    checks.push("auth expiry synchronously unloads A routes; UI B login registers B routes");

    phase = "refresh-identity";
    const stableIdentity = await page.evaluate(async () => {
      const { Auth } = await import("/src/utils/auth/index.ts");
      const { useUserStore } = await import("/src/store/modules/user.store.ts");
      const before = Auth.getSessionKey();
      await useUserStore().refreshTokenFn();
      return !!before && before === Auth.getSessionKey();
    });
    assert.equal(stableIdentity, true);
    checks.push("real refreshTokenFn HTTP renewal preserves the login session identity");
    await page.screenshot({ path: path.join(artifacts, "auth-session-B.png"), fullPage: true });
    await logout();
    assert.equal((await snapshot()).routeB, false);
    checks.push("normal account-menu logout clears B's tokens and dynamic routes");

    phase = "new-tab-without-credentials";
    await login(undefined, { remember: false });
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("user")).isLogin), true);
    const persistedUser = await page.evaluate(() => localStorage.getItem("user"));
    const newContext = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    await newContext.addInitScript((userState) => {
      if (userState) localStorage.setItem("user", userState);
    }, persistedUser);
    await newContext.route("**/*", (route) => {
      const url = new URL(route.request().url());
      return ["127.0.0.1", "localhost"].includes(url.hostname) ||
        ["data:", "blob:"].includes(url.protocol)
        ? route.continue()
        : route.abort();
    });
    await newContext.route(
      (url) => url.pathname.endsWith("/system/user/current/info"),
      async (route) => {
        const response = await route.fetch();
        const payload = await response.json();
        if (response.ok() && payload.data) {
          payload.data.menus = [
            {
              id: 90102,
              name: "auth_audit_B",
              title: "认证验收 B",
              type: 2,
              route_name: "AuthAuditB",
              route_path: "/auth-audit/B",
              component_path: "home/index",
              status: 1,
            },
          ];
          payload.data.permissions = [...(payload.data.permissions || []), "auth-audit:B"];
        }
        await route.fulfill({ response, json: payload });
      }
    );
    const newTab = await newContext.newPage();
    let protectedRequests = 0;
    newTab.on("pageerror", (error) => errors.push({ phase, message: error.message }));
    newTab.on("request", (request) => {
      if (
        /\/system\/(?:user\/current\/info|auth\/token\/refresh)$/.test(
          new URL(request.url()).pathname
        )
      )
        protectedRequests++;
    });
    await newTab.addInitScript(() => {
      window.__authAuditInitialTabState = {
        persistedLogin: JSON.parse(localStorage.getItem("user") || "{}").isLogin,
        hasToken: !!sessionStorage.getItem("access_token"),
        hasSession: !!sessionStorage.getItem("auth_session"),
      };
    });
    await newTab.goto(`${frontend}/#/home`);
    await newTab.locator('input[name="username"]').waitFor();
    assert.deepEqual(await newTab.evaluate(() => window.__authAuditInitialTabState), {
      persistedLogin: true,
      hasToken: false,
      hasSession: false,
    });
    const recovered = await snapshot(newTab);
    assert.equal(recovered.isLogin, false);
    assert.equal(recovered.accessToken, "");
    assert.equal(protectedRequests, 0);
    await newTab.evaluate(async () => {
      const { router } = await import("/src/router/instance.ts");
      await router.push("/login");
      if (router.currentRoute.value.path !== "/login" || !router.currentRoute.value.matched.length)
        throw new Error("New tab did not recover a matched login route");
    });
    await newTab.screenshot({
      path: path.join(artifacts, "auth-session-new-tab-login.png"),
      fullPage: true,
    });
    await login(accountB, { targetPage: newTab });
    await logout(newTab);
    await newContext.close();
    checks.push(
      "new tab without unremembered credentials clears persisted login state and supports UI relogin/logout"
    );
    assert.deepEqual(errors, []);
    report.passed = true;
    console.log(JSON.stringify({ passed: true, checks, artifacts }));
  } catch (error) {
    report.failure = { phase, message: error.message };
    await page
      .screenshot({ path: path.join(artifacts, "auth-session-failure.png"), fullPage: true })
      .catch(() => {});
    throw error;
  } finally {
    releases.forEach((release) => release());
    fs.writeFileSync(
      path.join(artifacts, "auth-session-results.json"),
      JSON.stringify(report, null, 2)
    );
    await browser.close();
  }
}

runAcceptance(run).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
