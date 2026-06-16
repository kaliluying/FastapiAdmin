<template>
  <div>
    <ElForm @submit.prevent="addComment" class="w-full mx-auto mb-10">
      <ElFormItem prop="author" class="mt-5">
        <ElInput
          v-model="newComment.author"
          placeholder="你的名称"
          class="block w-full"
          clearable
        />
      </ElFormItem>
      <ElFormItem prop="content">
        <ElInput
          v-model="newComment.content"
          placeholder="简单说两句..."
          type="textarea"
          :rows="5"
          clearable
        />
      </ElFormItem>
      <ElFormItem>
        <div class="flex justify-end w-full">
          <ElButton type="primary" @click="addComment">发布</ElButton>
        </div>
      </ElFormItem>
    </ElForm>

    <ul>
      <div class="pb-5 text-lg font-medium">评论 {{ comments.length }}</div>
      <FaCommentItem
        v-for="comment in comments.slice().reverse()"
        :key="comment.id"
        :comment="comment"
        :show-reply-form="showReplyForm"
        @toggle-reply="toggleReply"
        @add-reply="addReply"
        class="pb-2.5 mb-5 border-b border-g-400"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { type Comment } from "@/mock/temp/commentDetail";
import { ElMessage } from "element-plus";

defineOptions({ name: "FaCommentWidget" });

interface Props {
  comments?: Comment[];
}

withDefaults(defineProps<Props>(), {
  comments: () => [],
});

interface Emits {
  "add-comment": [comment: Comment];
  "add-reply": [commentId: number, author: string, content: string];
}

const emit = defineEmits<Emits>();

const newComment = ref<Partial<Comment>>({
  author: "",
  content: "",
});

const showReplyForm = ref<number | null>(null);

const addComment = () => {
  if (!newComment.value.author?.trim() || !newComment.value.content?.trim()) {
    ElMessage.warning("请填写完整的评论信息");
    return;
  }

  emit("add-comment", {
    id: Date.now(),
    author: newComment.value.author.trim(),
    content: newComment.value.content.trim(),
    timestamp: new Date().toISOString(),
    replies: [],
  });

  newComment.value.author = "";
  newComment.value.content = "";
  ElMessage.success("评论发布成功");
};

const addReply = (commentId: number, replyAuthor: string, replyContent: string) => {
  if (!replyAuthor?.trim() || !replyContent?.trim()) {
    ElMessage.warning("请填写完整的回复信息");
    return;
  }

  emit("add-reply", commentId, replyAuthor.trim(), replyContent.trim());
  showReplyForm.value = null;
  ElMessage.success("回复发布成功");
};

const toggleReply = (commentId: number) => {
  showReplyForm.value = showReplyForm.value === commentId ? null : commentId;
};
</script>
