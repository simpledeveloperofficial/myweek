"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

type Language = "ru" | "en";
type Theme = "light" | "dark";
type AuthMode = "signIn" | "signUp";
type SaveState = "idle" | "saving" | "saved" | "local" | "error";
type EventType = "school" | "tutor" | "sport" | "hobby";
type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type ScheduleEvent = {
  id: string;
  title: string;
  type: EventType;
  day: DayKey;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  homeworkDone: boolean;
};

type Copy = {
  appName: string;
  badge: string;
  headline: string;
  subhead: string;
  plannerTitle: string;
  plannerHint: string;
  focusTitle: string;
  focusHint: string;
  addTitle: string;
  saveAction: string;
  updateAction: string;
  cancelAction: string;
  editAction: string;
  deleteAction: string;
  settingsLabel: string;
  settingsTitle: string;
  settingsHint: string;
  themeLabel: string;
  themeLight: string;
  themeDark: string;
  emptyDay: string;
  loadNote: string;
  statsLessons: string;
  statsActivities: string;
  statsHours: string;
  fields: {
    title: string;
    type: string;
    day: string;
    startTime: string;
    endTime: string;
    location: string;
    notes: string;
  };
  eventTypes: Record<EventType, string>;
  days: Record<DayKey, string>;
};

const storageKey = "myweek-schedule-v1";
const themeStorageKey = "myweek-theme-v1";
const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? "simpledesignerdd@gmail.com";
const supportWhatsapp = "https://wa.me/77478687825";
const supportTelegram = "https://t.me/Dalernigmatov777";

const copy: Record<Language, Copy> = {
  ru: {
    appName: "MyWeek",
    badge: "Планировщик для 5-11 классов",
    headline: "Школьная неделя без хаоса",
    subhead:
      "Собери уроки, секции, репетиторов и хобби в одном аккуратном расписании. Это первый MVP, который уже можно заполнять самому.",
    plannerTitle: "Расписание недели",
    plannerHint: "События сохраняются прямо в браузере, так что можно сразу тестировать как пользователь.",
    focusTitle: "Сегодня в фокусе",
    focusHint: "Короткая сводка помогает быстро понять нагрузку на день.",
    addTitle: "Добавить событие",
    saveAction: "Сохранить",
    updateAction: "Сохранить изменения",
    cancelAction: "Отмена",
    editAction: "Изменить",
    deleteAction: "Удалить",
    settingsLabel: "Настройки",
    settingsTitle: "Настройки",
    settingsHint: "Управляй темой и внешним видом приложения.",
    themeLabel: "Тема",
    themeLight: "Светлая",
    themeDark: "Темная",
    emptyDay: "Пока пусто",
    loadNote: "Следующий шаг: подключим базу данных, вход и загрузку фото расписания через ИИ.",
    statsLessons: "уроков",
    statsActivities: "активностей",
    statsHours: "часов занято",
    fields: {
      title: "Название",
      type: "Категория",
      day: "День",
      startTime: "Начало",
      endTime: "Конец",
      location: "Кабинет / место",
      notes: "Заметка",
    },
    eventTypes: {
      school: "Школа",
      tutor: "Репетитор",
      sport: "Спорт",
      hobby: "Хобби",
    },
    days: {
      monday: "Пн",
      tuesday: "Вт",
      wednesday: "Ср",
      thursday: "Чт",
      friday: "Пт",
      saturday: "Сб",
      sunday: "Вс",
    },
  },
  en: {
    appName: "MyWeek",
    badge: "Planner for grades 5-11",
    headline: "A calmer school week",
    subhead:
      "Keep classes, tutors, sports, and hobbies in one clean schedule. This is the first MVP and you can already use it yourself.",
    plannerTitle: "Weekly schedule",
    plannerHint: "Events are saved in the browser, so the prototype already behaves like a real student app.",
    focusTitle: "Today at a glance",
    focusHint: "A quick summary makes daily workload easy to scan.",
    addTitle: "Add event",
    saveAction: "Save",
    updateAction: "Save changes",
    cancelAction: "Cancel",
    editAction: "Edit",
    deleteAction: "Delete",
    settingsLabel: "Settings",
    settingsTitle: "Settings",
    settingsHint: "Control the look of your planner.",
    themeLabel: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    emptyDay: "Nothing yet",
    loadNote: "Next step: connect a database, sign-in, and AI schedule photo upload.",
    statsLessons: "lessons",
    statsActivities: "activities",
    statsHours: "hours booked",
    fields: {
      title: "Title",
      type: "Category",
      day: "Day",
      startTime: "Start",
      endTime: "End",
      location: "Room / place",
      notes: "Note",
    },
    eventTypes: {
      school: "School",
      tutor: "Tutor",
      sport: "Sport",
      hobby: "Hobby",
    },
    days: {
      monday: "Mon",
      tuesday: "Tue",
      wednesday: "Wed",
      thursday: "Thu",
      friday: "Fri",
      saturday: "Sat",
      sunday: "Sun",
    },
  },
};

const initialEvents: ScheduleEvent[] = [
  {
    id: "9f56d87a-3b31-4d68-b7f8-d7f42155d901",
    title: "Math",
    type: "school",
    day: "monday",
    startTime: "08:00",
    endTime: "08:45",
    location: "204",
    notes: "",
    homeworkDone: false,
  },
  {
    id: "0b0a237c-9586-4b78-a20d-1324141d9c86",
    title: "English Tutor",
    type: "tutor",
    day: "monday",
    startTime: "17:00",
    endTime: "18:00",
    location: "Online",
    notes: "",
    homeworkDone: false,
  },
  {
    id: "aa8a5f4f-28ae-4999-9e07-946e39f81b4d",
    title: "Football",
    type: "sport",
    day: "wednesday",
    startTime: "16:30",
    endTime: "18:00",
    location: "Field A",
    notes: "",
    homeworkDone: false,
  },
  {
    id: "30d67e72-f56e-4974-b69a-882214f42d7f",
    title: "Art Club",
    type: "hobby",
    day: "friday",
    startTime: "15:00",
    endTime: "16:20",
    location: "Studio",
    notes: "",
    homeworkDone: false,
  },
];

const legacyInitialEventIds = new Set(initialEvents.map((event) => event.id));

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function normalizeEvents(events: ScheduleEvent[]) {
  return events.map((event) => ({
    ...event,
    notes: event.notes ?? "",
    homeworkDone: event.homeworkDone ?? false,
    id:
      isUuid(event.id) && !legacyInitialEventIds.has(event.id)
        ? event.id
        : crypto.randomUUID(),
  }));
}

const dayOrder: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function minutesBetween(start: string, end: string) {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
}

function getTodayKey(): DayKey {
  const index = new Date().getDay();
  return dayOrder[(index + 6) % 7];
}

function createDefaultForm(day: DayKey = "monday") {
  return {
    title: "",
    type: "school" as EventType,
    day,
    startTime: "08:00",
    endTime: "08:45",
    location: "",
    notes: "",
  };
}

function isPristineForm(form: ReturnType<typeof createDefaultForm>) {
  return (
    form.title === "" &&
    form.type === "school" &&
    form.startTime === "08:00" &&
    form.endTime === "08:45" &&
    form.location === "" &&
    form.notes === ""
  );
}

export default function Home() {
  const addFormRef = useRef<HTMLDivElement | null>(null);
  const [language, setLanguage] = useState<Language>("ru");
  const [theme, setTheme] = useState<Theme>("light");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signIn");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authNotice, setAuthNotice] = useState("");
  const [nicknameDraft, setNicknameDraft] = useState("");
  const [nicknameLoading, setNicknameLoading] = useState(false);
  const [nicknameError, setNicknameError] = useState("");
  const [nicknameNotice, setNicknameNotice] = useState("");
  const [isRecoveringPassword, setIsRecoveringPassword] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("local");
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>(() => normalizeEvents(initialEvents));
  const [form, setForm] = useState(() => createDefaultForm());
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(themeStorageKey);
    const stored = window.localStorage.getItem(storageKey);

    if (storedTheme === "light" || storedTheme === "dark") {
      startTransition(() => {
        setTheme(storedTheme);
      });
    }

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ScheduleEvent[];

        if (Array.isArray(parsed)) {
          startTransition(() => {
            setEvents(normalizeEvents(parsed));
          });
        }
      } catch {
        window.localStorage.removeItem(storageKey);
      }
    }

    startTransition(() => {
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated || !isSupabaseConfigured) {
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return;
      }

      if (error) {
        console.error("Failed to get Supabase session", error);
      }

      startTransition(() => {
        setSession(data.session ?? null);
        setAuthReady(true);
      });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      startTransition(() => {
        setSession(nextSession);
        setAuthReady(true);
      });

      if (event === "PASSWORD_RECOVERY") {
        startTransition(() => {
          setAuthOpen(true);
          setIsRecoveringPassword(true);
          setAuthError("");
          setAuthNotice("");
          setAuthPassword("");
        });
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated || session?.user.id) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(events));
    startTransition(() => {
      setSaveState("local");
    });
  }, [events, isHydrated, session]);

  useEffect(() => {
    if (!isHydrated || session?.user.id) {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);

    if (!stored) {
      startTransition(() => {
        setEvents(normalizeEvents(initialEvents));
      });
      return;
    }

    try {
      const parsed = JSON.parse(stored) as ScheduleEvent[];

      if (Array.isArray(parsed)) {
        startTransition(() => {
          setEvents(normalizeEvents(parsed));
        });
      }
    } catch {
      window.localStorage.removeItem(storageKey);

      startTransition(() => {
        setEvents(normalizeEvents(initialEvents));
      });
    }
  }, [isHydrated, session]);

  useEffect(() => {
    const nextNickname =
      typeof session?.user.user_metadata?.nickname === "string"
        ? session.user.user_metadata.nickname
        : typeof session?.user.user_metadata?.full_name === "string"
          ? session.user.user_metadata.full_name
          : "";

    startTransition(() => {
      setNicknameDraft(nextNickname);
      setNicknameError("");
      setNicknameNotice("");
    });
  }, [session]);

  useEffect(() => {
    if (!isHydrated || editingEventId) {
      return;
    }

    startTransition(() => {
      setForm((current) => {
        if (!isPristineForm(current)) {
          return current;
        }

        return createDefaultForm(getTodayKey());
      });
    });
  }, [editingEventId, isHydrated]);

  useEffect(() => {
    const userId = session?.user.id ?? null;

    if (!isHydrated) {
      return;
    }

    if (!userId || !isSupabaseConfigured) {
      startTransition(() => {
        setLoadedUserId(null);
        setSaveState("local");
      });
      return;
    }

    let cancelled = false;

    startTransition(() => {
      setLoadedUserId(null);
    });

    async function loadRemoteEvents() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        return;
      }

      const { data, error } = await supabase
        .from("schedule_events")
        .select("id, title, type, day, start_time, end_time, location, notes, homework_done")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (cancelled) {
        return;
      }

      if (error) {
        console.error("Failed to load schedule events from Supabase", error);
        startTransition(() => {
          setLoadedUserId(userId);
          setSaveState("error");
        });
        return;
      }

      if (data && data.length > 0) {
        const remoteEvents = data.map((event) => ({
          id: event.id,
          title: event.title,
          type: event.type as EventType,
          day: event.day as DayKey,
          startTime: event.start_time,
          endTime: event.end_time,
          location: event.location,
          notes: event.notes ?? "",
          homeworkDone: event.homework_done ?? false,
        }));

        startTransition(() => {
          setEvents(normalizeEvents(remoteEvents));
        });
      }

      startTransition(() => {
        setLoadedUserId(userId);
        setSaveState("saved");
      });
    }

    void loadRemoteEvents();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, session]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme, isHydrated]);

  useEffect(() => {
    const userId = session?.user.id ?? null;

    if (!isHydrated || !userId || loadedUserId !== userId || !isSupabaseConfigured) {
      return;
    }

    let cancelled = false;

    async function syncRemoteEvents() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        return;
      }

      startTransition(() => {
        setSaveState("saving");
      });

      const payload = events.map((event) => ({
        id: event.id,
        user_id: userId,
        title: event.title,
        type: event.type,
        day: event.day,
        start_time: event.startTime,
        end_time: event.endTime,
        location: event.location,
        notes: event.notes,
        homework_done: event.homeworkDone,
      }));

      if (events.length === 0) {
        const { error: deleteAllError } = await supabase
          .from("schedule_events")
          .delete()
          .eq("user_id", userId);

        if (deleteAllError && !cancelled) {
          console.error("Failed to clear schedule events in Supabase", deleteAllError);
          startTransition(() => {
            setSaveState("error");
          });
        } else if (!cancelled) {
          startTransition(() => {
            setSaveState("saved");
          });
        }

        return;
      }

      const { error: upsertError } = await supabase
        .from("schedule_events")
        .upsert(payload, { onConflict: "id" });

      if (upsertError && !cancelled) {
        console.error("Failed to save schedule events to Supabase", {
          message: upsertError.message,
          details: upsertError.details,
          hint: upsertError.hint,
          code: upsertError.code,
        });
        startTransition(() => {
          setSaveState("error");
        });
        return;
      }

      if (cancelled) {
        return;
      }

      const { data: existingRows, error: existingRowsError } = await supabase
        .from("schedule_events")
        .select("id")
        .eq("user_id", userId);

      if (existingRowsError) {
        console.error("Failed to inspect stale schedule events in Supabase", existingRowsError);
        startTransition(() => {
          setSaveState("error");
        });
        return;
      }

      const currentIds = new Set(events.map((event) => event.id));
      const staleIds = (existingRows ?? [])
        .map((row) => row.id)
        .filter((id) => !currentIds.has(id));

      if (staleIds.length === 0 || cancelled) {
        if (!cancelled) {
          startTransition(() => {
            setSaveState("saved");
          });
        }
        return;
      }

      const { error: staleDeleteError } = await supabase
        .from("schedule_events")
        .delete()
        .eq("user_id", userId)
        .in("id", staleIds);

      if (staleDeleteError && !cancelled) {
        console.error("Failed to remove stale schedule events from Supabase", {
          message: staleDeleteError.message,
          details: staleDeleteError.details,
          hint: staleDeleteError.hint,
          code: staleDeleteError.code,
        });
        startTransition(() => {
          setSaveState("error");
        });
      } else if (!cancelled) {
        startTransition(() => {
          setSaveState("saved");
        });
      }
    }

    const timeoutId = window.setTimeout(() => {
      void syncRemoteEvents();
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [events, isHydrated, loadedUserId, session]);

  const t = copy[language];
  const helperText =
    language === "ru"
      ? {
          subhead:
            "Собери уроки, секции, репетиторов и хобби в одном аккуратном расписании. Смотри неделю целиком и ничего не забывай.",
          plannerHint: "Добавляй занятия по дням и быстро смотри всю неделю в одном месте.",
          loadNote: "Нажми на пустой день, чтобы быстро добавить новое событие.",
        }
      : {
          subhead:
            "Keep classes, tutors, sports, and hobbies in one clean schedule. See your whole week clearly and forget less.",
          plannerHint: "Add your activities by day and scan the whole week in one place.",
          loadNote: "Tap an empty day to jump straight to adding a new event.",
        };
  const todayKey = isHydrated ? getTodayKey() : "monday";
  const todayDateLabel = isHydrated
    ? new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date())
    : "";
  const uiText =
    language === "ru"
      ? {
          lessonsToday: "уроков сегодня",
          activitiesToday: "активностей сегодня",
          pointsToday: "очков за ДЗ",
          hoursToday: "часов сегодня",
          edit: "Изменить",
          delete: "Удалить",
          homeworkDone: "ДЗ готово",
          homeworkTodo: "ДЗ",
          saveChanges: "Сохранить изменения",
          cancel: "Отмена",
          editModeTitle: "Редактировать событие",
        }
      : {
          lessonsToday: "lessons today",
          activitiesToday: "activities today",
          pointsToday: "homework points",
          hoursToday: "hours today",
          edit: "Edit",
          delete: "Delete",
          homeworkDone: "HW done",
          homeworkTodo: "HW",
          saveChanges: "Save changes",
          cancel: "Cancel",
          editModeTitle: "Edit event",
        };
  const authText =
    language === "ru"
      ? {
          account: "Аккаунт",
          authCta: "Войти",
          authTitleSignIn: "Вход в MyWeek",
          authTitleSignUp: "Регистрация в MyWeek",
          authHint:
            "С аккаунтом расписание будет сохраняться в облаке и появляться на других устройствах.",
          authEmail: "Почта",
          authPassword: "Пароль",
          authPasswordHint: "Минимум 6 символов.",
          authSubmitSignIn: "Войти",
          authSubmitSignUp: "Создать аккаунт",
          authSwitchToSignIn: "Уже есть аккаунт? Войти",
          authSwitchToSignUp: "Нет аккаунта? Зарегистрироваться",
          authSignedInAs: "Вы вошли как",
          authSignOut: "Выйти",
          authSyncGuest: "До входа расписание хранится только на этом устройстве. После входа оно перейдет в ваш аккаунт.",
          authSyncCloud: "Сейчас расписание хранится в вашем аккаунте и защищено через вход.",
          authWaiting: "Проверяем сессию...",
          authNoSupabase: "Сначала нужно закончить настройку Supabase.",
          authSignedInNotice: "Вход выполнен.",
          authSignUpNotice:
            "Аккаунт создан. Если включено подтверждение почты, проверь письмо и затем войди.",
          nicknameLabel: "Никнейм",
          nicknamePlaceholder: "Например, Daler",
          nicknameHint: "Он будет показываться в аккаунте вместо почты, где это уместно.",
          nicknameSave: "Сохранить никнейм",
          nicknameSaved: "Никнейм сохранен.",
        }
      : {
          account: "Account",
          authCta: "Sign in",
          authTitleSignIn: "Sign in to MyWeek",
          authTitleSignUp: "Create your MyWeek account",
          authHint:
            "With an account, your schedule syncs in the cloud and follows you to other devices.",
          authEmail: "Email",
          authPassword: "Password",
          authPasswordHint: "At least 6 characters.",
          authSubmitSignIn: "Sign in",
          authSubmitSignUp: "Create account",
          authSwitchToSignIn: "Already have an account? Sign in",
          authSwitchToSignUp: "No account yet? Sign up",
          authSignedInAs: "Signed in as",
          authSignOut: "Sign out",
          authSyncGuest: "Before sign in, your schedule stays only on this device. After sign in, it moves into your account.",
          authSyncCloud: "Your schedule is now stored in your account and protected by sign-in.",
          authWaiting: "Checking session...",
          authNoSupabase: "Supabase setup is still missing.",
          authSignedInNotice: "Signed in.",
          authSignUpNotice:
            "Account created. If email confirmation is enabled, check your inbox and then sign in.",
          nicknameLabel: "Nickname",
          nicknamePlaceholder: "For example, Daler",
          nicknameHint: "It will appear in your account area instead of email where appropriate.",
          nicknameSave: "Save nickname",
          nicknameSaved: "Nickname saved.",
        };
  const accountToolsText =
    language === "ru"
      ? {
          forgotPassword: "Забыли пароль?",
          resetTitle: "Новый пароль",
          resetHint:
            "Открой письмо от Supabase, перейди по ссылке и затем задай новый пароль здесь.",
          resetSubmit: "Сохранить новый пароль",
          resetNotice: "Письмо для сброса пароля отправлено.",
          resetSuccess: "Пароль обновлен. Теперь можно войти.",
          support: "Поддержка",
          supportHint:
            "Если что-то сломалось или есть идея по улучшению, можно написать напрямую.",
          supportAction: "Написать в поддержку",
        }
      : {
          forgotPassword: "Forgot password?",
          resetTitle: "New password",
          resetHint:
            "Open the email from Supabase, follow the recovery link, then set your new password here.",
          resetSubmit: "Save new password",
          resetNotice: "Password reset email sent.",
          resetSuccess: "Password updated. You can sign in now.",
          support: "Support",
          supportHint:
            "If something breaks or you have an idea, you can contact support directly.",
          supportAction: "Contact support",
        };
  const oauthText =
    language === "ru"
      ? {
          google: "Войти через Google",
          or: "или",
        }
      : {
          google: "Continue with Google",
          or: "or",
        };
  const supportLinksText =
    language === "ru"
      ? {
          whatsapp: "WhatsApp",
          telegram: "Telegram",
          email: "Email",
        }
      : {
          whatsapp: "WhatsApp",
          telegram: "Telegram",
          email: "Email",
        };
  const statusText =
    language === "ru"
      ? {
          idle: "Готово к планированию",
          local: "Сохранено на устройстве",
          saving: "Сохраняем",
          saved: "Синхронизировано",
          error: "Ошибка синхронизации",
        }
      : {
          idle: "Ready to plan",
          local: "Saved on device",
          saving: "Saving",
          saved: "Synced",
          error: "Sync error",
        };

  const groupedEvents = useMemo(
    () =>
      dayOrder.map((day) => ({
        day,
        events: events
          .filter((event) => event.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime)),
      })),
    [events],
  );

  const todayEvents = groupedEvents.find((group) => group.day === todayKey)?.events ?? [];
  const lessonCount = todayEvents.filter((event) => event.type === "school").length;
  const activityCount = todayEvents.filter((event) => event.type !== "school").length;
  const homeworkPoints = todayEvents.filter((event) => event.homeworkDone).length * 2;
  const totalHours = Math.max(
    0,
    Math.round(
      (todayEvents.reduce(
        (total, event) => total + minutesBetween(event.startTime, event.endTime),
        0,
      ) /
        60) *
        10,
    ) / 10,
  );

  async function submitAuth() {
    if (!isSupabaseConfigured) {
      setAuthError(authText.authNoSupabase);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setAuthError(authText.authNoSupabase);
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");

    const credentials = {
      email: authEmail.trim(),
      password: authPassword,
    };

    const { error } =
      authMode === "signUp"
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    setAuthPassword("");

    if (authMode === "signUp") {
      setAuthNotice(authText.authSignUpNotice);
    } else {
      setAuthNotice(authText.authSignedInNotice);
      setAuthOpen(false);
    }

    setAuthLoading(false);
  }

  async function sendPasswordReset() {
    if (!isSupabaseConfigured) {
      setAuthError(authText.authNoSupabase);
      return;
    }

    const email = authEmail.trim();

    if (!email) {
      setAuthError(language === "ru" ? "Сначала введи почту." : "Enter your email first.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setAuthError(authText.authNoSupabase);
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    setAuthNotice(accountToolsText.resetNotice);
    setAuthLoading(false);
  }

  async function submitRecoveredPassword() {
    if (!authPassword || authPassword.length < 6) {
      setAuthError(language === "ru" ? "Пароль слишком короткий." : "Password is too short.");
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setAuthError(authText.authNoSupabase);
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");

    const { error } = await supabase.auth.updateUser({
      password: authPassword,
    });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
      return;
    }

    setAuthPassword("");
    setIsRecoveringPassword(false);
    setAuthMode("signIn");
    setAuthNotice(accountToolsText.resetSuccess);
    setAuthLoading(false);
  }

  async function signOut() {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setAuthError(authText.authNoSupabase);
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      setAuthError(error.message);
      return;
    }

    setSettingsOpen(false);
    setAuthNotice("");
    setAuthError("");
    setNicknameDraft("");
    setNicknameNotice("");
    setNicknameError("");
  }

  async function saveNickname() {
    if (!isSupabaseConfigured) {
      setNicknameError(authText.authNoSupabase);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase || !session) {
      setNicknameError(authText.authNoSupabase);
      return;
    }

    const trimmedNickname = nicknameDraft.trim();

    setNicknameLoading(true);
    setNicknameError("");
    setNicknameNotice("");

    const { error } = await supabase.auth.updateUser({
      data: {
        ...session.user.user_metadata,
        nickname: trimmedNickname,
      },
    });

    if (error) {
      setNicknameError(error.message);
      setNicknameLoading(false);
      return;
    }

    setNicknameDraft(trimmedNickname);
    setNicknameNotice(authText.nicknameSaved);
    setNicknameLoading(false);
  }

  async function signInWithGoogle() {
    if (!isSupabaseConfigured) {
      setAuthError(authText.authNoSupabase);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setAuthError(authText.authNoSupabase);
      return;
    }

    setAuthLoading(true);
    setAuthError("");
    setAuthNotice("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setAuthError(error.message);
      setAuthLoading(false);
    }
  }

  function addEvent() {
    if (!form.title.trim()) {
      return;
    }

    if (editingEventId) {
      setEvents((current) =>
        current.map((event) =>
          event.id === editingEventId
              ? {
                  ...event,
                  title: form.title.trim(),
                  type: form.type,
                  day: form.day,
                  startTime: form.startTime,
                  endTime: form.endTime,
                  location: form.location.trim(),
                  notes: form.notes.trim(),
                  homeworkDone: event.homeworkDone,
                }
            : event,
        ),
      );
      setEditingEventId(null);
    } else {
      const nextEvent: ScheduleEvent = {
        id: crypto.randomUUID(),
        title: form.title.trim(),
        type: form.type,
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        location: form.location.trim(),
        notes: form.notes.trim(),
        homeworkDone: false,
      };

      setEvents((current) => [...current, nextEvent]);
    }

    setForm(createDefaultForm(getTodayKey()));
  }

  function startEditing(event: ScheduleEvent) {
    setEditingEventId(event.id);
    setForm({
      title: event.title,
      type: event.type,
      day: event.day,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      notes: event.notes,
    });
  }

  function cancelEditing() {
    setEditingEventId(null);
    setForm(createDefaultForm(getTodayKey()));
  }

  function deleteEvent(eventId: string) {
    setEvents((current) => current.filter((event) => event.id !== eventId));

    if (editingEventId === eventId) {
      cancelEditing();
    }
  }

  function openAddFormForDay(day: DayKey) {
    setEditingEventId(null);
    setForm(createDefaultForm(day));
    setTimeout(() => {
      addFormRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 40);
  }

  function toggleHomeworkDone(eventId: string) {
    setEvents((current) =>
      current.map((event) =>
        event.id === eventId
          ? {
              ...event,
              homeworkDone: !event.homeworkDone,
            }
          : event,
      ),
    );
  }

  const displayName =
    typeof session?.user.user_metadata?.nickname === "string" &&
    session.user.user_metadata.nickname.trim()
      ? session.user.user_metadata.nickname.trim()
      : typeof session?.user.user_metadata?.full_name === "string" &&
          session.user.user_metadata.full_name.trim()
        ? session.user.user_metadata.full_name.trim()
        : session?.user.email ?? authText.authCta;

  return (
    <main className="min-h-screen px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-10">
      {authOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            aria-label="Close auth"
            className="absolute inset-0 glass-overlay"
            onClick={() => setAuthOpen(false)}
            type="button"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto liquid-glass glass-modal animate-scale-in w-full max-w-md rounded-[30px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-[var(--accent)]">
                    {isRecoveringPassword
                      ? accountToolsText.resetTitle
                      : authMode === "signIn"
                        ? authText.authTitleSignIn
                        : authText.authTitleSignUp}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                    {isRecoveringPassword ? accountToolsText.resetHint : authText.authHint}
                  </p>
                </div>
                <button
                  className="rounded-full px-3 py-1 text-sm font-semibold text-[color:var(--muted)] transition hover:text-[var(--accent)]"
                  onClick={() => {
                    setAuthOpen(false);
                    setIsRecoveringPassword(false);
                  }}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="mt-6 grid gap-4">
                {isRecoveringPassword ? null : (
                  <>
                    <button
                      className="glass-action inline-flex h-12 items-center justify-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--card-surface)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={authLoading}
                      onClick={signInWithGoogle}
                      type="button"
                    >
                      <GoogleIcon />
                      {oauthText.google}
                    </button>
                    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--muted)]">
                      <span className="h-px flex-1 bg-[var(--line)]" />
                      {oauthText.or}
                      <span className="h-px flex-1 bg-[var(--line)]" />
                    </div>
                  </>
                )}
                <Field label={authText.authEmail}>
                  <input
                    autoComplete="email"
                    className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition"
                    onChange={(event) => setAuthEmail(event.target.value)}
                    placeholder="name@example.com"
                    type="email"
                    value={authEmail}
                    disabled={isRecoveringPassword}
                  />
                </Field>
                <Field label={authText.authPassword}>
                  <input
                    autoComplete={
                      isRecoveringPassword
                        ? "new-password"
                        : authMode === "signIn"
                          ? "current-password"
                          : "new-password"
                    }
                    className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition"
                    onChange={(event) => setAuthPassword(event.target.value)}
                    placeholder="••••••••"
                    type="password"
                    value={authPassword}
                  />
                </Field>
                <p className="text-sm text-[color:var(--muted)]">{authText.authPasswordHint}</p>
                {authError ? (
                  <StatusBanner tone="error" icon={<AlertIcon />} text={authError} />
                ) : null}
                {authNotice ? (
                  <StatusBanner tone="success" icon={<CheckIcon />} text={authNotice} />
                ) : null}
                <button
                  className="glass-primary mt-2 inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[var(--accent-strong)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={
                    authLoading ||
                    (!isRecoveringPassword && !authEmail.trim()) ||
                    authPassword.length < 6
                  }
                  onClick={isRecoveringPassword ? submitRecoveredPassword : submitAuth}
                  type="button"
                >
                  <SparkIcon />
                  {authLoading
                    ? "..."
                    : isRecoveringPassword
                      ? accountToolsText.resetSubmit
                      : authMode === "signIn"
                        ? authText.authSubmitSignIn
                        : authText.authSubmitSignUp}
                </button>
                {isRecoveringPassword ? null : (
                  <>
                    {authMode === "signIn" ? (
                      <button
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition hover:opacity-80"
                        onClick={sendPasswordReset}
                        type="button"
                      >
                        <RefreshIcon />
                        {accountToolsText.forgotPassword}
                      </button>
                    ) : null}
                    <button
                      className="text-sm font-semibold text-[var(--accent)] transition hover:opacity-80"
                      onClick={() => {
                        setAuthError("");
                        setAuthNotice("");
                        setIsRecoveringPassword(false);
                        setAuthMode((current) => (current === "signIn" ? "signUp" : "signIn"));
                      }}
                      type="button"
                    >
                      {authMode === "signIn"
                        ? authText.authSwitchToSignUp
                        : authText.authSwitchToSignIn}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {settingsOpen ? (
        <div className="fixed inset-0 z-40">
          <button
            aria-label="Close settings"
            className="absolute inset-0 glass-overlay"
            onClick={() => setSettingsOpen(false)}
            type="button"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
            <div className="pointer-events-auto liquid-glass glass-modal animate-scale-in w-full max-w-xl rounded-[30px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-[var(--accent)]">
                    {t.settingsTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                    {t.settingsHint}
                  </p>
                </div>
                <button
                  className="rounded-full px-3 py-1 text-sm font-semibold text-[color:var(--muted)] transition hover:text-[var(--accent)]"
                  onClick={() => setSettingsOpen(false)}
                  type="button"
                >
                  <CloseIcon />
                </button>
              </div>
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-[color:var(--muted)]">
                  {authText.account}
                </p>
                <div className="rounded-[24px] border border-[var(--line)] bg-[var(--card-surface)] p-4">
                  {isSupabaseConfigured ? (
                    authReady ? (
                      session ? (
                        <div className="grid gap-3">
                          <p className="text-sm leading-6 text-[color:var(--muted)]">
                            {authText.authSignedInAs}{" "}
                            <span className="font-semibold text-[var(--foreground)]">
                              {displayName}
                            </span>
                          </p>
                          {displayName !== session.user.email ? (
                            <p className="text-sm leading-6 text-[color:var(--muted-soft)]">
                              {session.user.email}
                            </p>
                          ) : null}
                          <p className="text-sm leading-6 text-[color:var(--muted)]">
                            {authText.authSyncCloud}
                          </p>
                          <Field label={authText.nicknameLabel}>
                            <input
                              className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition focus:-translate-y-0.5"
                              onChange={(event) => setNicknameDraft(event.target.value)}
                              placeholder={authText.nicknamePlaceholder}
                              value={nicknameDraft}
                            />
                          </Field>
                          <p className="text-sm leading-6 text-[color:var(--muted)]">
                            {authText.nicknameHint}
                          </p>
                          {nicknameError ? (
                            <StatusBanner tone="error" icon={<AlertIcon />} text={nicknameError} />
                          ) : null}
                          {nicknameNotice ? (
                            <StatusBanner tone="success" icon={<CheckIcon />} text={nicknameNotice} />
                          ) : null}
                          <button
                            className="glass-action inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--accent)] transition"
                            disabled={nicknameLoading}
                            onClick={saveNickname}
                            type="button"
                          >
                            {nicknameLoading ? <LoaderIcon /> : <UserIcon />}
                            {authText.nicknameSave}
                          </button>
                          <button
                            className="glass-action inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--accent)] transition"
                            onClick={signOut}
                            type="button"
                          >
                            <LogoutIcon />
                            {authText.authSignOut}
                          </button>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          <p className="text-sm leading-6 text-[color:var(--muted)]">
                            {authText.authSyncGuest}
                          </p>
                          <button
                            className="glass-action inline-flex h-11 items-center justify-center rounded-2xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--accent)] transition"
                            onClick={() => {
                              setSettingsOpen(false);
                              setIsRecoveringPassword(false);
                              setAuthOpen(true);
                            }}
                            type="button"
                          >
                            {authText.authCta}
                          </button>
                        </div>
                      )
                    ) : (
                      <p className="text-sm leading-6 text-[color:var(--muted)]">
                        {authText.authWaiting}
                      </p>
                    )
                  ) : (
                    <p className="text-sm leading-6 text-[color:var(--muted)]">
                      {authText.authNoSupabase}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-[color:var(--muted)]">
                  {t.themeLabel}
                </p>
                <div className="glass-segmented relative inline-grid h-14 w-[220px] grid-cols-2 rounded-full border border-[var(--line)] bg-[var(--chip-surface)] p-1 backdrop-blur-xl">
                  <span
                    aria-hidden="true"
                    className={`glass-segmented-thumb absolute top-1 h-12 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out ${
                      theme === "light" ? "left-1" : "left-[calc(50%+3px)]"
                    }`}
                  />
                  <button
                    className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      theme === "light"
                        ? "text-white"
                        : "text-[color:var(--muted)] hover:text-[var(--accent)]"
                    }`}
                    onClick={() => setTheme("light")}
                    type="button"
                  >
                    {t.themeLight}
                  </button>
                  <button
                    className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                      theme === "dark"
                        ? "text-white"
                        : "text-[color:var(--muted)] hover:text-[var(--accent)]"
                    }`}
                    onClick={() => setTheme("dark")}
                    type="button"
                  >
                    {t.themeDark}
                  </button>
                </div>
              </div>
              <div className="mt-6">
                <p className="mb-3 text-sm font-semibold text-[color:var(--muted)]">
                  {accountToolsText.support}
                </p>
                <div className="grid gap-3 rounded-[24px] border border-[var(--line)] bg-[var(--card-surface)] p-4">
                  <p className="text-sm leading-6 text-[color:var(--muted)]">
                    {accountToolsText.supportHint}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      className="glass-action inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--accent)] transition"
                      href={supportWhatsapp}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <WhatsappIcon />
                      {supportLinksText.whatsapp}
                    </a>
                    <a
                      className="glass-action inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--accent)] transition"
                      href={supportTelegram}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <TelegramIcon />
                      {supportLinksText.telegram}
                    </a>
                    <a
                      className="glass-action inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[var(--line)] px-4 text-sm font-semibold text-[var(--accent)] transition"
                      href={`mailto:${supportEmail}`}
                    >
                      <MailIcon />
                      {supportLinksText.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="liquid-glass glass-hero overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--surface)]">
          <div className="grid gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 lg:py-10">
            <div className="flex flex-col gap-5">
              <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
                <div className="flex flex-col gap-3 lg:items-start">
                  <p className="glass-badge inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] sm:text-xs">
                    {t.badge}
                  </p>
                  <p className="text-sm font-semibold capitalize text-[color:var(--muted)]">
                    {todayDateLabel}
                  </p>
                </div>
                <div className="lg:justify-self-center">
                  <h1 className="text-left font-[family-name:var(--font-space-grotesk)] text-4xl font-bold tracking-tight text-[var(--accent)] sm:text-5xl lg:text-center">
                    {t.appName}
                  </h1>
                </div>
                <div className="grid w-full gap-3 sm:flex sm:flex-wrap sm:items-center lg:w-auto lg:justify-self-end">
                  {isSupabaseConfigured ? (
                    <button
                      className="liquid-glass glass-lift inline-flex h-12 w-full max-w-full items-center justify-center gap-2 truncate rounded-full border border-[var(--line)] bg-[var(--chip-surface)] px-4 text-sm font-semibold text-[var(--accent)] transition hover:brightness-105 sm:h-14 sm:w-auto sm:max-w-[240px] sm:px-5"
                      onClick={() => {
                        setAuthError("");
                        setAuthNotice("");
                        setIsRecoveringPassword(false);
                        setAuthMode(session ? "signIn" : "signUp");
                        setAuthOpen(true);
                      }}
                      type="button"
                    >
                      <UserIcon />
                      {displayName}
                    </button>
                  ) : null}
                  <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-3 sm:flex sm:items-center">
                    <button
                      className="liquid-glass glass-lift inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--line)] bg-[var(--chip-surface)] px-4 text-sm font-semibold text-[var(--accent)] transition hover:brightness-105 sm:h-14 sm:w-auto sm:px-5"
                      onClick={() => setSettingsOpen((current) => !current)}
                      type="button"
                    >
                      <SettingsIcon />
                      <span className="truncate">{t.settingsLabel}</span>
                    </button>
                    <div className="glass-segmented relative inline-grid h-12 w-[132px] grid-cols-2 rounded-full border border-[var(--line)] bg-[var(--chip-surface)] p-1 backdrop-blur-xl sm:h-14 sm:w-[142px]">
                      <span
                        aria-hidden="true"
                        className={`glass-segmented-thumb absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out ${
                          language === "ru" ? "left-1" : "left-[calc(50%+3px)]"
                        }`}
                      />
                      <button
                        className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                          language === "ru"
                            ? "text-white"
                            : "text-[color:var(--muted)] hover:text-[var(--accent)]"
                        }`}
                        onClick={() => setLanguage("ru")}
                        type="button"
                      >
                        RU
                      </button>
                      <button
                        className={`relative z-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                          language === "en"
                            ? "text-white"
                            : "text-[color:var(--muted)] hover:text-[var(--accent)]"
                        }`}
                        onClick={() => setLanguage("en")}
                        type="button"
                      >
                        EN
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="max-w-2xl">
                <h2 className="font-[family-name:var(--font-space-grotesk)] text-3xl font-semibold tracking-tight text-[var(--accent)] sm:text-4xl">
                  {t.headline}
                </h2>
                <p className="mt-3 max-w-xl text-base leading-7 text-[color:var(--muted)] sm:text-lg">
                  {helperText.subhead}
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <StatusPill
                    icon={
                      saveState === "saving" ? (
                        <LoaderIcon />
                      ) : saveState === "error" ? (
                        <AlertIcon />
                      ) : saveState === "saved" ? (
                        <CloudCheckIcon />
                      ) : (
                        <DeviceIcon />
                      )
                    }
                    label={statusText[saveState]}
                    tone={saveState}
                  />
                  <StatusPill
                    icon={<CalendarIcon />}
                    label={language === "ru" ? `${todayEvents.length} дел на сегодня` : `${todayEvents.length} items today`}
                    tone="idle"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard value={lessonCount} label={uiText.lessonsToday} />
                <StatCard value={activityCount} label={uiText.activitiesToday} />
                <StatCard value={homeworkPoints} label={uiText.pointsToday} />
                <StatCard value={totalHours} label={uiText.hoursToday} />
              </div>
            </div>
            <aside className="liquid-glass glass-lift rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]">
                    {t.focusTitle}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{t.focusHint}</p>
                </div>
                <div className="glass-badge flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold">
                  {t.days[todayKey]}
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {todayEvents.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-[var(--empty-line)] bg-[var(--empty-surface)] px-4 py-5 text-sm font-medium text-[var(--empty-text)]">
                    {t.emptyDay}
                  </p>
                ) : (
                  todayEvents.map((event) => (
                    <article
                      key={event.id}
                      className="liquid-glass glass-lift animate-fade-up rounded-2xl border border-[var(--line)] bg-[var(--card-surface)] px-4 py-3 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p
                            className={`font-semibold ${event.homeworkDone ? "text-[color:var(--muted)] line-through" : "text-[var(--foreground)]"}`}
                          >
                            {event.title}
                          </p>
                          <p className="mt-1 text-sm text-[color:var(--muted)]">
                            {t.eventTypes[event.type]}
                            {event.location ? ` • ${event.location}` : ""}
                          </p>
                          {event.notes ? (
                            <p className="mt-2 text-sm leading-6 text-[color:var(--muted-soft)]">
                              {event.notes}
                            </p>
                          ) : null}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="glass-badge rounded-full px-3 py-1 text-xs font-semibold">
                            {event.startTime} - {event.endTime}
                          </p>
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              aria-pressed={event.homeworkDone}
                              className={`glass-action inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                event.homeworkDone
                                  ? "border-[color:rgba(109,214,156,0.28)] bg-[color:rgba(109,214,156,0.14)] text-[var(--foreground)]"
                                  : "border-[var(--line)] text-[var(--accent)]"
                              }`}
                              onClick={() => toggleHomeworkDone(event.id)}
                              type="button"
                            >
                              <CheckSquareIcon checked={event.homeworkDone} />
                              {event.homeworkDone ? uiText.homeworkDone : uiText.homeworkTodo}
                            </button>
                            <button
                              className="glass-action inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--accent)] transition"
                              onClick={() => startEditing(event)}
                              type="button"
                            >
                              <EditIcon />
                              {uiText.edit}
                            </button>
                            <button
                              className="glass-action inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--accent)] transition"
                              onClick={() => deleteEvent(event.id)}
                              type="button"
                            >
                              <TrashIcon />
                              {uiText.delete}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
              <p className="mt-5 text-sm leading-6 text-[color:var(--muted)]">
                {helperText.loadNote}
              </p>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="liquid-glass glass-lift rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-[var(--accent)]">
                  {t.plannerTitle}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">
                  {helperText.plannerHint}
                </p>
              </div>
            </div>
            <div className="mt-6 grid gap-3">
              {groupedEvents.map((group) => (
                <div
                  key={group.day}
                  className="liquid-glass glass-lift rounded-[24px] border border-[var(--line)] bg-[var(--card-surface)] p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-[family-name:var(--font-space-grotesk)] text-lg font-semibold text-[var(--accent)]">
                      {t.days[group.day]}
                    </h4>
                    <span className="text-sm text-[color:var(--muted-soft)]">
                      {group.events.length.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="grid gap-2">
                    {group.events.length === 0 ? (
                      <button
                        className="rounded-2xl border border-dashed border-[var(--empty-line)] bg-[var(--empty-surface)] px-3 py-4 text-left text-sm font-medium text-[var(--empty-text)] transition hover:border-[var(--focus)] hover:bg-[var(--button-hover)] hover:text-[var(--accent)]"
                        onClick={() => openAddFormForDay(group.day)}
                        type="button"
                      >
                        {t.emptyDay}
                      </button>
                    ) : (
                      group.events.map((event) => (
                        <article
                          key={event.id}
                          className="liquid-glass glass-lift animate-fade-up grid grid-cols-[72px_1fr] gap-3 rounded-2xl border border-[var(--line-soft)] bg-[var(--event-surface)] px-3 py-3 transition sm:grid-cols-[88px_1fr] sm:px-4"
                        >
                          <div className="text-xs font-semibold text-[color:var(--muted)] sm:text-sm">
                            {event.startTime}
                            <br />
                            <span className="text-[11px] font-medium text-[color:var(--muted-soft)] sm:text-xs">
                              {event.endTime}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0">
                              <p
                                className={`truncate text-sm font-semibold sm:text-base ${event.homeworkDone ? "text-[color:var(--muted)] line-through" : "text-[var(--foreground)]"}`}
                              >
                                {event.title}
                              </p>
                              <p className="mt-1 text-xs text-[color:var(--muted)] sm:text-sm">
                                {t.eventTypes[event.type]}
                                {event.location ? ` • ${event.location}` : ""}
                              </p>
                              {event.notes ? (
                                <p className="mt-1 line-clamp-2 text-xs leading-5 text-[color:var(--muted-soft)] sm:mt-2 sm:text-sm sm:leading-6">
                                  {event.notes}
                                </p>
                              ) : null}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                              <button
                                aria-pressed={event.homeworkDone}
                                className={`glass-action inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition sm:px-3 sm:text-xs ${
                                  event.homeworkDone
                                    ? "border-[color:rgba(109,214,156,0.28)] bg-[color:rgba(109,214,156,0.14)] text-[var(--foreground)]"
                                    : "border-[var(--line)] text-[var(--accent)]"
                                }`}
                                onClick={() => toggleHomeworkDone(event.id)}
                                type="button"
                              >
                                <CheckSquareIcon checked={event.homeworkDone} />
                                {event.homeworkDone ? uiText.homeworkDone : uiText.homeworkTodo}
                              </button>
                              <span className="glass-badge rounded-full px-2.5 py-1 text-[11px] font-semibold sm:px-3 sm:text-xs">
                                {t.eventTypes[event.type]}
                              </span>
                              <button
                                className="glass-action inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] transition sm:px-3 sm:text-xs"
                                onClick={() => startEditing(event)}
                                type="button"
                              >
                                <EditIcon />
                                {uiText.edit}
                              </button>
                              <button
                                className="glass-action inline-flex items-center gap-1 rounded-full border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)] transition sm:px-3 sm:text-xs"
                                onClick={() => deleteEvent(event.id)}
                                type="button"
                              >
                                <TrashIcon />
                                {uiText.delete}
                              </button>
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            ref={addFormRef}
            className="liquid-glass glass-lift rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-[family-name:var(--font-space-grotesk)] text-2xl font-semibold text-[var(--accent)]">
                {editingEventId ? uiText.editModeTitle : t.addTitle}
              </h3>
              {editingEventId ? (
                <button
                  className="glass-action rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition"
                  onClick={cancelEditing}
                  type="button"
                >
                  {uiText.cancel}
                </button>
              ) : null}
            </div>
            <div className="mt-6 grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill
                  icon={editingEventId ? <EditIcon /> : <SparkIcon />}
                  label={editingEventId ? uiText.editModeTitle : t.saveAction}
                  tone="idle"
                />
                <StatusPill
                  icon={<CalendarIcon />}
                  label={language === "ru" ? `День: ${t.days[form.day]}` : `Day: ${t.days[form.day]}`}
                  tone="local"
                />
              </div>
              <Field label={t.fields.title}>
                <input
                  className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition focus:-translate-y-0.5"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder={language === "ru" ? "Например, Алгебра" : "For example, Algebra"}
                  value={form.title}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.fields.type}>
                  <select
                    className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition focus:-translate-y-0.5"
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as EventType,
                      }))
                    }
                    value={form.type}
                  >
                    {Object.entries(t.eventTypes).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t.fields.day}>
                  <select
                    className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition focus:-translate-y-0.5"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, day: event.target.value as DayKey }))
                    }
                    value={form.day}
                  >
                    {dayOrder.map((day) => (
                      <option key={day} value={day}>
                        {t.days[day]}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t.fields.startTime}>
                  <input
                    className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition focus:-translate-y-0.5"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, startTime: event.target.value }))
                    }
                    type="time"
                    value={form.startTime}
                  />
                </Field>
                <Field label={t.fields.endTime}>
                  <input
                    className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition focus:-translate-y-0.5"
                    onChange={(event) =>
                      setForm((current) => ({ ...current, endTime: event.target.value }))
                    }
                    type="time"
                    value={form.endTime}
                  />
                </Field>
              </div>
              <Field label={t.fields.location}>
                <input
                  className="glass-field h-12 w-full rounded-2xl px-4 text-[var(--foreground)] outline-none transition focus:-translate-y-0.5"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, location: event.target.value }))
                  }
                  placeholder={language === "ru" ? "Кабинет, зал, онлайн" : "Room, hall, online"}
                  value={form.location}
                />
              </Field>
              <Field label={t.fields.notes}>
                <textarea
                  className="glass-field min-h-24 w-full rounded-2xl px-4 py-3 text-[var(--foreground)] outline-none transition focus:-translate-y-0.5 resize-none"
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  placeholder={
                    language === "ru"
                      ? "Например: взять тетрадь, форма на спорт, ссылка на Zoom"
                      : "For example: bring notebook, sports uniform, Zoom link"
                  }
                  rows={3}
                  value={form.notes}
                />
              </Field>
              <button
                className="glass-primary mt-2 inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-[var(--accent-strong)] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:brightness-110"
                onClick={addEvent}
                type="button"
              >
                <SparkIcon />
                {editingEventId ? uiText.saveChanges : t.saveAction}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ value, label }: { value: number; label: string }) {
  return (
    <div className="liquid-glass glass-lift rounded-[22px] border border-[var(--line)] bg-[var(--card-surface)] p-4">
      <p className="font-[family-name:var(--font-space-grotesk)] text-3xl font-bold text-[var(--accent)]">
        {value}
      </p>
      <p className="mt-1 text-sm text-[color:var(--muted)]">{label}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[color:var(--muted)]">{label}</span>
      {children}
    </label>
  );
}

function StatusBanner({
  tone,
  icon,
  text,
}: Readonly<{ tone: "error" | "success"; icon: React.ReactNode; text: string }>) {
  return (
    <p
      className={`inline-flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${
        tone === "error"
          ? "border border-[color:rgba(255,120,120,0.28)] bg-[color:rgba(255,120,120,0.08)] text-[color:#d45f6b]"
          : "border border-[var(--line)] bg-[var(--card-surface)] text-[var(--foreground)]"
      }`}
    >
      <span className="mt-0.5">{icon}</span>
      <span>{text}</span>
    </p>
  );
}

function StatusPill({
  icon,
  label,
  tone,
}: Readonly<{ icon: React.ReactNode; label: string; tone: SaveState }>) {
  const toneClass =
    tone === "error"
      ? "border-[color:rgba(255,120,120,0.28)] bg-[color:rgba(255,120,120,0.1)] text-[color:#d45f6b]"
      : tone === "saving"
        ? "border-[var(--line)] bg-[var(--accent-soft)] text-[var(--accent)]"
        : tone === "saved"
          ? "border-[var(--line)] bg-[color:rgba(109,214,156,0.14)] text-[var(--foreground)]"
          : "border-[var(--line)] bg-[var(--card-surface)] text-[var(--foreground)]";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold sm:text-sm ${toneClass}`}
    >
      {icon}
      {label}
    </span>
  );
}

function iconProps() {
  return {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
}

function CloseIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg {...iconProps()}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c0 .67.39 1.28 1 1.55.17.07.35.1.55.1H21a2 2 0 1 1 0 4h-.09c-.67 0-1.28.39-1.55 1z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 2l1.8 5.2L19 9l-5.2 1.8L12 16l-1.8-5.2L5 9l5.2-1.8Z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M21 12a9 9 0 0 1-15.36 6.36" />
      <path d="M3 12A9 9 0 0 1 18.36 5.64" />
      <path d="M3 16v-4h4" />
      <path d="M21 8v4h-4" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.72 3h16.92a2 2 0 0 0 1.72-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function CheckSquareIcon({ checked }: Readonly<{ checked: boolean }>) {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      {checked ? <path d="M8 12.5 10.8 15 16.5 9.5" /> : null}
    </svg>
  );
}

function CloudCheckIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M20 17.5a4.5 4.5 0 0 0-.5-8.97A6 6 0 0 0 8 7a5 5 0 0 0-.2 10" />
      <path d="m9 15 2 2 4-4" />
    </svg>
  );
}

function DeviceIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 17h6" />
    </svg>
  );
}

function LoaderIcon() {
  return (
    <svg {...iconProps()} className="animate-spin">
      <path d="M21 12a9 9 0 1 1-6.22-8.56" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21.8 12.23c0-.77-.07-1.5-.2-2.2H12v4.17h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.39 3.05-7.61Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.76 0 5.08-.91 6.78-2.46l-3.3-2.56c-.91.61-2.08.97-3.48.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10 10 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.25 13.73A5.96 5.96 0 0 1 5.93 12c0-.6.11-1.18.32-1.73V7.63H2.84A10 10 0 0 0 2 12c0 1.61.38 3.13 1.04 4.37l3.21-2.64Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6.05c1.5 0 2.84.52 3.9 1.54l2.92-2.92C17.07 3.03 14.75 2 12 2A10 10 0 0 0 2.84 7.63l3.41 2.64C7.06 7.85 9.33 6.05 12 6.05Z"
        fill="#EA4335"
      />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M20 12a8 8 0 0 1-11.7 7.1L4 20l.95-4.1A8 8 0 1 1 20 12Z" />
      <path d="M9.5 8.8c.2-.5.4-.5.7-.5h.6c.2 0 .4 0 .6.5l.5 1.3c.1.3.1.5-.1.7l-.5.6c-.1.2-.2.3 0 .5.2.4.8 1.3 1.8 2 .4.3.7.4.9.5.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.2.6c.2.1.4.2.4.4 0 .3-.1.7-.4 1a2.7 2.7 0 0 1-1.8.7c-.8 0-1.8-.3-3.3-1.5-1.7-1.3-2.8-3-3.2-3.8-.4-.8-.4-1.4-.1-1.9.2-.4.5-.8.7-1 .1-.2.2-.4.1-.6l-.5-1.1Z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg {...iconProps()}>
      <path d="M21 4 3.8 10.7c-1.2.5-1.2 1.2-.2 1.5l4.4 1.4 1.7 5.1c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.1-2 4.3 3.2c.8.4 1.3.2 1.5-.8L22 5.3C22.3 4.3 21.7 3.8 21 4Z" />
      <path d="m8 13.2 8.8-5.5" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg {...iconProps()}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}
