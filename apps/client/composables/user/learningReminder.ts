import { computed, ref } from "vue";

import { useLocalStorageBoolean } from "~/utils/localStorage";

export const LEARNING_REMINDER_ENABLED = "learningReminderEnabled";
export const LEARNING_REMINDER_TIME = "learningReminderTime";
export const LEARNING_REMINDER_LAST_NOTIFIED = "learningReminderLastNotified";

// 默认提醒时间：每天 20:00
const DEFAULT_REMINDER_TIME = "20:00";

// 通知权限状态
const notificationPermission = ref<NotificationPermission>(
  typeof Notification !== "undefined" ? Notification.permission : "denied",
);

// 提醒时间
const reminderTime = ref<string>(DEFAULT_REMINDER_TIME);

// 提醒开关
const {
  value: reminderEnabled,
  isTrue: isReminderEnabled,
  toggle: toggleReminder,
  remove: removeReminder,
} = useLocalStorageBoolean(LEARNING_REMINDER_ENABLED, false);

// 加载已保存的提醒时间
function loadReminderTime() {
  const savedTime = localStorage.getItem(LEARNING_REMINDER_TIME);
  if (savedTime) {
    reminderTime.value = savedTime;
  } else {
    localStorage.setItem(LEARNING_REMINDER_TIME, reminderTime.value);
  }
}
loadReminderTime();

// 请求通知权限
async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;

  if (Notification.permission === "granted") {
    notificationPermission.value = "granted";
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    notificationPermission.value = permission;
    return permission === "granted";
  }

  return false;
}

// 更新提醒时间
function setReminderTime(time: string) {
  reminderTime.value = time;
  localStorage.setItem(LEARNING_REMINDER_TIME, time);
  restartTimer();
}

// 开启提醒时自动请求权限
async function enableReminder() {
  const granted = await requestNotificationPermission();
  if (granted) {
    reminderEnabled.value = true;
    localStorage.setItem(LEARNING_REMINDER_ENABLED, "true");
    startTimer();
  } else {
    // 权限被拒绝，仍然开启但提示用户
    reminderEnabled.value = true;
    localStorage.setItem(LEARNING_REMINDER_ENABLED, "true");
    startTimer();
  }
}

// 关闭提醒
function disableReminder() {
  reminderEnabled.value = false;
  localStorage.setItem(LEARNING_REMINDER_ENABLED, "false");
  stopTimer();
}

// 切换提醒开关
async function toggleReminderWithPermission() {
  if (isReminderEnabled()) {
    disableReminder();
  } else {
    await enableReminder();
  }
}

// 发送学习提醒通知
function sendLearningReminderNotification() {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;

  const today = new Date().toISOString().split("T")[0];
  const lastNotified = localStorage.getItem(LEARNING_REMINDER_LAST_NOTIFIED);

  // 当天已经通知过则不再通知
  if (lastNotified === today) return;

  const notification = new Notification("Earthworm 学习提醒", {
    body: "今天还没有学习哦，坚持每天学习才能不断进步！快来完成今日的学习任务吧～",
    icon: "/logo.png",
    tag: "learning-reminder",
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  localStorage.setItem(LEARNING_REMINDER_LAST_NOTIFIED, today);
}

// 检查是否到达提醒时间
function checkReminderTime() {
  if (!isReminderEnabled()) return;

  const now = new Date();
  const [hours, minutes] = reminderTime.value.split(":").map(Number);
  const targetTime = new Date();
  targetTime.setHours(hours, minutes, 0, 0);

  // 当前时间已过提醒时间
  if (now >= targetTime) {
    sendLearningReminderNotification();
  }
}

// 定时器管理
let timerId: ReturnType<typeof setInterval> | null = null;

function startTimer() {
  stopTimer();
  // 每分钟检查一次
  timerId = setInterval(checkReminderTime, 60 * 1000);
  // 立即检查一次
  checkReminderTime();
}

function stopTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

function restartTimer() {
  if (isReminderEnabled()) {
    startTimer();
  }
}

export function useLearningReminder() {
  return {
    reminderEnabled: computed(() => reminderEnabled.value),
    reminderTime: computed(() => reminderTime.value),
    notificationPermission: computed(() => notificationPermission.value),
    isReminderEnabled,
    toggleReminder: toggleReminderWithPermission,
    setReminderTime,
    enableReminder,
    disableReminder,
    requestNotificationPermission,
    initReminder: startTimer,
    destroyReminder: stopTimer,
  };
}
