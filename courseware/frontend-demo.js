const cases = [
  { title: "未支付工资争议案", person: "张三", date: "2024-05-20", status: "green" },
  { title: "解除劳动合同争议案", person: "李四", date: "2024-05-18", status: "orange" },
  { title: "加班费争议案", person: "王五", date: "2024-05-15", status: "" },
  { title: "工伤赔偿争议案", person: "赵六", date: "2024-05-10", status: "" },
  { title: "年终奖争议案", person: "孙七", date: "2024-05-08", status: "" },
];

const history = [
  ["公司拖欠工资怎么办？", "10:24"],
  ["未签劳动合同如何维权？", "昨天"],
  ["加班费的计算标准是什么？", "昨天"],
  ["试用期辞退有赔偿吗？", "5-18"],
  ["仲裁时效是多长时间？", "5-15"],
];

const citations = [
  ["《中华人民共和国劳动法》第五十条", "工资应当以货币形式按月支付给劳动者本人，不得克扣或者无故拖欠劳动者的工资。"],
  ["《劳动争议调解仲裁法》第二十七条", "劳动争议申请仲裁的时效期间为一年，从知道或应当知道权利被侵害之日起计算。"],
  ["《工资支付暂行规定》第十六条", "因劳动者本人原因给用人单位造成经济损失的，用人单位可按约定要求赔偿。"],
];

const evidenceFiles = [
  { name: "劳动合同.pdf", type: "PDF", size: "1.8MB", status: "已解析", proof: "劳动关系" },
  { name: "工资条_202403.pdf", type: "PDF", size: "924KB", status: "已解析", proof: "工资标准" },
  { name: "银行流水.xlsx", type: "XLS", size: "486KB", status: "解析中", proof: "支付记录" },
  { name: "催款聊天记录.png", type: "IMG", size: "2.1MB", status: "待确认", proof: "催告过程" },
];

const renderList = (items, renderItem) => items.map(renderItem).join("");

function renderCases() {
  document.querySelector("#caseList").innerHTML = renderList(
    cases,
    (item, index) => `<button class="case-item ${index === 0 ? "active" : ""}" type="button">
      <i class="case-status ${item.status}"></i>
      <strong>${item.title}</strong>
      <small><span>申请人：${item.person}</span><span>${item.date}</span></small>
    </button>`,
  );
}

function renderHistory() {
  document.querySelector("#historyList").innerHTML = renderList(
    history,
    ([title, time]) => `<div class="history-item">
      <i></i>
      <span>${title}</span>
      <time>${time}</time>
    </div>`,
  );
}

function renderCaseContext(actionText = "清空对话") {
  return `<div class="case-context">
    <div>
      <span>当前案件：</span>
      <strong>未支付工资争议案</strong>
      <span>（申请人：张三）</span>
    </div>
    <button type="button">${actionText}</button>
  </div>`;
}

function renderCitations() {
  return `<section class="support-card citations-card">
    <div class="section-title">
      <h3>检索依据</h3>
      <button type="button">查看全部 ›</button>
    </div>
    <div class="citation-list">
      ${renderList(
        citations,
        ([title, content], index) => `<article class="citation-item">
          <span class="citation-index">${index + 1}</span>
          <div>
            <strong>${title}</strong><em>${index === 2 ? "法规" : "法律"}</em>
            <p>${content}</p>
          </div>
          <span class="citation-open">↗</span>
        </article>`,
      )}
    </div>
  </section>`;
}

function renderEvidenceMini() {
  return `<section class="support-card evidence-card">
    <div class="section-title">
      <h3>证据材料</h3>
      <button type="button">全部文件 ›</button>
    </div>
    <div class="upload-box compact">
      <span aria-hidden="true">⇪</span>
      <strong>点击或拖拽文件到此处上传</strong>
      <p>支持 jpg、png、pdf、doc、docx，单个文件 ≤20MB</p>
    </div>
    <div class="file-list">
      ${renderList(evidenceFiles.slice(0, 2), renderFileItem)}
    </div>
  </section>`;
}

function renderFileItem(item) {
  return `<div class="file-item">
    <span class="file-icon ${item.type === "XLS" ? "sheet" : ""}">${item.type}</span>
    <div>
      <strong>${item.name}</strong>
      <span>${item.size} · ${item.status}</span>
    </div>
    <button type="button" aria-label="预览">◎</button>
    <button type="button" aria-label="删除">⌫</button>
  </div>`;
}

function renderConsult() {
  return {
    main: `<section class="chat-panel">
      ${renderCaseContext()}
      <div class="chat-scroll">
        <article class="message user-message">
          <p>公司拖欠我两个月工资，我该怎么办？</p>
          <time>10:24</time>
        </article>
        <article class="message ai-message">
          <div class="bot-avatar" aria-hidden="true">AI</div>
          <div class="answer-card">
            <p>根据《中华人民共和国劳动法》和《劳动争议调解仲裁法》相关规定，您可以通过以下途径维护自身权益：</p>
            <ol>
              <li>与用人单位协商：建议先与公司沟通，要求支付拖欠的工资。</li>
              <li>收集证据材料：保留劳动合同、工资条、考勤记录、聊天记录、银行流水等。</li>
              <li>申请劳动仲裁：在知道或应当知道权益受侵害之日起 1 年内，向劳动仲裁委员会申请仲裁。</li>
              <li>主张权利：可以主张拖欠工资、经济补偿金以及逾期支付工资的赔偿金。</li>
            </ol>
            <div class="warning-box"><span>△</span><strong>温馨提示：请注意仲裁时效为 1 年，建议尽快准备材料并申请仲裁。</strong></div>
            <footer class="answer-actions">
              <button type="button">复制</button>
              <button type="button">不满意</button>
              <span>内容由 AI 生成，仅供参考</span>
            </footer>
          </div>
        </article>
      </div>
      <div class="suggestions">
        <span>你可能还想问：</span>
        <button type="button">仲裁需要哪些材料？</button>
        <button type="button">拖欠工资的赔偿标准是什么？</button>
        <button type="button">仲裁流程是怎样的？</button>
        <button type="button">没有劳动合同可以仲裁吗？</button>
      </div>
      <div class="composer">
        <textarea placeholder="请输入您的问题，AI 将为您提供专业解答..." maxlength="1000"></textarea>
        <div class="composer-actions"><span>0/1000</span><button type="button">发送</button></div>
      </div>
    </section>`,
    side: `${renderCitations()}${renderEvidenceMini()}<section class="support-card document-card"><h3>生成文书</h3><button class="primary-block" type="button">生成仲裁申请书</button></section>`,
  };
}

function renderUpload() {
  return {
    main: `<section class="upload-workbench">
      ${renderCaseContext("保存证据")}
      <div class="upload-hero">
        <div>
          <span>证据上传</span>
          <h2>把材料按证明对象整理进案件</h2>
          <p>课堂目标：学生能说清每个文件证明什么，并理解上传接口、文件校验、后台解析任务的关系。</p>
        </div>
        <button type="button">批量上传</button>
      </div>
      <div class="drop-zone">
        <span>⇪</span>
        <strong>拖拽文件到这里，或点击选择证据材料</strong>
        <p>支持合同、工资流水、聊天记录、考勤表；上传后进入解析队列。</p>
      </div>
      <div class="evidence-table">
        <div class="table-row table-head"><span>文件名</span><span>证明对象</span><span>解析状态</span><span>操作</span></div>
        ${renderList(
          evidenceFiles,
          (file) => `<div class="table-row">
            <span><b>${file.name}</b><small>${file.type} · ${file.size}</small></span>
            <span>${file.proof}</span>
            <span><i class="${file.status === "解析中" ? "running" : ""}"></i>${file.status}</span>
            <span><button type="button">预览</button><button type="button">重传</button></span>
          </div>`,
        )}
      </div>
    </section>`,
    side: `<section class="support-card checklist-card">
      <h3>证据类型清单</h3>
      <ul>
        <li class="done">劳动关系：劳动合同已上传</li>
        <li class="done">工资标准：工资条已上传</li>
        <li class="done">支付记录：银行流水解析中</li>
        <li>考勤记录：建议补充最近两个月</li>
      </ul>
    </section>
    <section class="support-card parse-card">
      <h3>后台解析队列</h3>
      <div class="queue-item"><strong>银行流水.xlsx</strong><span>OCR / 表格解析 65%</span><i style="width:65%"></i></div>
      <div class="queue-item"><strong>催款聊天记录.png</strong><span>等待图片文字识别</span><i style="width:28%"></i></div>
    </section>
    <section class="support-card tip-card"><h3>课堂提示</h3><p>这里可以讲文件上传接口、大小限制、后缀校验、保存路径和 BackgroundTasks。</p></section>`,
  };
}

function renderAnalysis() {
  return {
    main: `<section class="analysis-dashboard">
      ${renderCaseContext("重新分析")}
      <div class="score-grid">
        <article class="score-card primary"><span>证据链完整度</span><strong>82%</strong><p>已覆盖劳动关系、工资标准、欠薪事实。</p></article>
        <article class="score-card"><span>风险项</span><strong>2</strong><p>缺少考勤记录；聊天截图需保留原件。</p></article>
        <article class="score-card"><span>可生成文书</span><strong>是</strong><p>核心字段已具备，仍需人工复核。</p></article>
      </div>
      <div class="proof-map">
        <h2>证明对象匹配</h2>
        ${renderList(
          [
            ["劳动关系", "劳动合同.pdf", "强"],
            ["工资标准", "工资条_202403.pdf", "中"],
            ["欠薪事实", "银行流水.xlsx", "强"],
            ["催告过程", "催款聊天记录.png", "中"],
          ],
          ([target, file, level]) => `<div class="proof-row">
            <span>${target}</span><strong>${file}</strong><i class="${level === "强" ? "good" : ""}">${level}</i>
          </div>`,
        )}
      </div>
      <div class="risk-board">
        <h2>AI 分析结论</h2>
        <p>现有证据可以初步证明劳动关系和欠薪事实。建议补充最近两个月考勤记录，并将聊天记录原图与导出文本一起保存，避免单一截图被质疑完整性。</p>
      </div>
    </section>`,
    side: `<section class="support-card insight-card">
      <h3>补充建议</h3>
      <ol>
        <li>补充考勤记录或排班截图。</li>
        <li>确认工资流水中的收款账户。</li>
        <li>核对欠薪金额和月份。</li>
      </ol>
    </section>
    <section class="support-card timeline-card">
      <h3>证据时间线</h3>
      <div><b>2024-03</b><span>工资少发</span></div>
      <div><b>2024-04</b><span>工资未发</span></div>
      <div><b>2024-05</b><span>催款并准备仲裁</span></div>
    </section>
    ${renderCitations()}`,
  };
}

function renderDocument() {
  return {
    main: `<section class="document-editor">
      ${renderCaseContext("保存草稿")}
      <div class="document-toolbar">
        <div>
          <span>仲裁申请书</span>
          <h2>文书预览与字段校验</h2>
        </div>
        <div><button type="button">导出 DOCX</button><button class="solid" type="button">导出 PDF</button></div>
      </div>
      <article class="document-preview">
        <h1>劳动仲裁申请书</h1>
        <p><b>申请人：</b>张三，身份证号：320************018，联系电话：138****8888。</p>
        <p><b>被申请人：</b>某科技有限公司，住所地：南京市软件大道 88 号。</p>
        <h2>仲裁请求</h2>
        <ol><li>请求裁决被申请人支付拖欠工资 12800 元。</li><li>请求裁决被申请人承担逾期支付工资的相应责任。</li></ol>
        <h2>事实与理由</h2>
        <p>申请人与被申请人存在劳动关系。被申请人未按照约定足额支付 2024 年 3 月至 4 月工资，申请人多次催告后仍未支付。</p>
        <h2>证据目录</h2>
        <p>劳动合同、工资流水、工资条、聊天记录、考勤记录。</p>
      </article>
    </section>`,
    side: `<section class="support-card form-card">
      <h3>字段校验</h3>
      <label><span>申请人</span><input value="张三" /></label>
      <label><span>请求金额</span><input value="12800 元" /></label>
      <label><span>仲裁委员会</span><input value="南京市劳动人事争议仲裁委员会" /></label>
    </section>
    <section class="support-card checklist-card">
      <h3>生成前检查</h3>
      <ul>
        <li class="done">身份信息已填写</li>
        <li class="done">请求事项已生成</li>
        <li class="done">证据目录已关联</li>
        <li>金额和日期需人工复核</li>
      </ul>
    </section>
    <section class="support-card document-card"><h3>生成文书</h3><button class="primary-block" type="button">生成仲裁申请书</button></section>`,
  };
}

const renderers = {
  consult: renderConsult,
  upload: renderUpload,
  analysis: renderAnalysis,
  document: renderDocument,
};

function setActiveTab(tabName) {
  const rendered = renderers[tabName]();
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabName);
  });
  document.querySelector("#mainStage").innerHTML = rendered.main;
  document.querySelector("#sideStage").innerHTML = rendered.side;
  document.documentElement.dataset.activeTab = tabName;
  if (renderers[tabName]) {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set("tab", tabName);
    window.history.replaceState({}, "", nextUrl);
  }
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => setActiveTab(button.dataset.tab));
});

renderCases();
renderHistory();
const initialTab = new URLSearchParams(window.location.search).get("tab");
setActiveTab(renderers[initialTab] ? initialTab : "consult");
