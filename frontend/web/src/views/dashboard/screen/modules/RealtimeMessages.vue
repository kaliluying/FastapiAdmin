<template>
  <div class="panel p1">
    <div class="panel-hd">
      <span class="dot accent" />实时操作日志
      <span class="msg-count">NEW</span>
    </div>
    <div class="msg-scroll">
      <div class="msg-inner">
        <div v-for="(m, i) in messagesDuplicated" :key="i" class="msg-row">
          <span class="msg-time">{{ m.time }}</span>
          <span class="msg-tag" :class="m.tag">{{ m.tagText }}</span>
          <span>{{ m.text }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "RealtimeMessages" });

const messages = [
  {
    time: "22:30",
    tag: "order",
    tagText: "交易",
    text: "商户「星辰科技」完成大额订单支付 ¥86,400",
  },
  { time: "22:15", tag: "system", tagText: "系统", text: "数据备份定时任务执行完成，耗时 12.3s" },
  { time: "21:52", tag: "audit", tagText: "审计", text: "运营主管 zhangsan 导出本月交易报表" },
  { time: "21:30", tag: "deploy", tagText: "部署", text: "v3.2.1 版本灰度发布至华东区节点" },
  { time: "21:05", tag: "notice", tagText: "公告", text: "系统公告: 6月1日进行数据库扩容维护" },
  {
    time: "20:40",
    tag: "alarm",
    tagText: "告警",
    text: "[已恢复] 华南区 API 网关延迟突增至 320ms",
  },
  { time: "20:15", tag: "order", tagText: "交易", text: "退款工单 #TK-2024-08921 已自动处理完成" },
  {
    time: "19:52",
    tag: "system",
    tagText: "系统",
    text: "缓存集群节点 node-07 内存使用率降至 62%",
  },
];

const messagesDuplicated = [...messages, ...messages];
</script>

<style scoped>
.msg-scroll {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-width: 0;
}
.msg-inner {
  animation: scrollUp 28s linear infinite;
  width: 100%;
}
.msg-row {
  font-size: 11px;
  padding: 5px 0;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.75;
  border-bottom: 1px solid rgba(26, 40, 80, 0.3);
}
.msg-time {
  opacity: 0.4;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  width: 38px;
}
.msg-tag {
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 3px;
  flex-shrink: 0;
}
.msg-tag.order {
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
}
.msg-tag.system {
  background: rgba(124, 58, 237, 0.15);
  color: #7c3aed;
}
.msg-tag.audit {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}
.msg-tag.deploy {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}
.msg-tag.notice {
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
}
.msg-tag.alarm {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}
.msg-count {
  margin-left: auto;
  font-size: 10px;
  opacity: 0.6;
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
  padding: 2px 6px;
  border-radius: 10px;
}
@keyframes scrollUp {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-50%);
  }
}
</style>
