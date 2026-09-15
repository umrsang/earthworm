import { ref } from "vue";
import {
  getLearningDashboardApi,
  resetCoursePackProgressApi,
  resetCourseProgressApi,
  type LearningDashboard,
} from "../api/course-pack";

export type ProgressResetTarget =
  | { type: "course"; coursePackId: string; courseId: string; title: string }
  | { type: "coursePack"; coursePackId: string; title: string };

export function useLearningDashboard() {
  const dashboard = ref<LearningDashboard | null>(null);
  const loading = ref(false);
  const resetting = ref(false);
  const errorMessage = ref("");
  const resetTarget = ref<ProgressResetTarget | null>(null);

  async function loadDashboard(): Promise<void> {
    loading.value = true;
    errorMessage.value = "";
    try {
      dashboard.value = await getLearningDashboardApi(new Date().getTimezoneOffset());
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "";
    } finally {
      loading.value = false;
    }
  }

  /** 重置当前位置与完成记录，成功后重新加载首页；学习活动历史不会删除。 */
  async function confirmReset(): Promise<boolean> {
    const target = resetTarget.value;
    if (!target || resetting.value) return false;
    resetting.value = true;
    try {
      if (target.type === "course") {
        await resetCourseProgressApi(target.coursePackId, target.courseId);
      } else {
        await resetCoursePackProgressApi(target.coursePackId);
      }
      resetTarget.value = null;
      await loadDashboard();
      return true;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "";
      return false;
    } finally {
      resetting.value = false;
    }
  }

  return {
    dashboard,
    loading,
    resetting,
    errorMessage,
    resetTarget,
    loadDashboard,
    confirmReset,
  };
}
