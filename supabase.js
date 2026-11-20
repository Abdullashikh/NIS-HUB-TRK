/* Supabase browser client. Load the Supabase v2 CDN bundle before this script. */
(function () {
  "use strict";

  const config = window.NIS_HUB_CONFIG || {};
  const supabaseUrl = config.supabaseUrl || "";
  const supabaseAnonKey = config.supabaseAnonKey || "";

  let client = null;

  function getClient() {
    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      throw new Error("Supabase SDK не загружен. Проверьте подключение CDN в index.html.");
    }
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes("YOUR-PROJECT") ||
        supabaseAnonKey.includes("YOUR_SUPABASE")) {
      throw new Error("Добавьте Supabase URL и anon key в NIS_HUB_CONFIG в index.html.");
    }
    if (!client) client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
    return client;
  }

  async function unwrap(query) {
    const result = await query;
    if (result.error) {
      throw new Error(result.error.message || "Ошибка обращения к Supabase");
    }
    return result.data;
  }

  function getIdentity(identity) {
    if (!identity || !identity.telegramId || !identity.displayName) {
      throw new Error("Не удалось определить ученика. Откройте приложение через Telegram или демо-режим.");
    }
    return {
      telegram_id: String(identity.telegramId),
      display_name: String(identity.displayName),
      grade: String(identity.grade || ""),
      shanyrak: String(identity.shanyrak || "")
    };
  }

  async function listApprovedClubs() {
    return unwrap(getClient().from("public_approved_clubs")
      .select("id,slug,name,direction,description,schedule,mentor,capacity,current_slots")
      .order("name"));
  }

  async function listEvents() {
    return unwrap(getClient().from("events")
      .select("id,slug,title,description,event_date,location,capacity,current_slots,category")
      .gte("event_date", new Date().toISOString())
      .order("event_date"));
  }

  async function registerForClub(clubId, identity) {
    const student = getIdentity(identity);
    return postApi("/api/register-club", {
      clubId: clubId,
      profile: { grade: student.grade, shanyrak: student.shanyrak }
    });
  }

  async function registerForEvent(eventId, identity) {
    const student = getIdentity(identity);
    return postApi("/api/register-event", {
      eventId: eventId,
      profile: { grade: student.grade, shanyrak: student.shanyrak }
    });
  }

  async function createClubProposal(proposal, identity) {
    const student = getIdentity(identity);
    return postApi("/api/create-club", {
      proposal: proposal,
      profile: { grade: student.grade, shanyrak: student.shanyrak }
    }).then(function (result) {
      return result.proposal;
    });
  }

  async function createTeamPost(post, identity) {
    const student = getIdentity(identity);
    return postApi("/api/create-team-post", {
      post: post,
      profile: { grade: student.grade, shanyrak: student.shanyrak }
    }).then(function (result) {
      return result.post;
    });
  }

  async function listTeamPosts() {
    return unwrap(getClient().from("public_team_posts")
      .select("id,title,description,project_type,skills,created_at,expires_at,author_name,author_grade,author_shanyrak")
      .order("created_at", { ascending: false }));
  }

  async function respondToTeamPost(postId, message, identity, botApiUrl) {
    getIdentity(identity);
    if (!botApiUrl || botApiUrl.includes("YOUR-RENDER")) {
      throw new Error("Сервис уведомлений не настроен. Обратитесь к администратору.");
    }
    const response = await fetch(botApiUrl.replace(/\/$/, "") + "/api/team-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData: window.Telegram && window.Telegram.WebApp
          ? window.Telegram.WebApp.initData
          : "",
        postId: postId,
        message: String(message || "").slice(0, 500),
        profile: { grade: getIdentity(identity).grade, shanyrak: getIdentity(identity).shanyrak },
      })
    });
    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(payload.error || "Не удалось отправить отклик");
    }
    return payload;
  }

  async function getStudentClubs(identity) {
    getIdentity(identity);
    return postApi("/api/student-profile", {}).then(function (result) {
      return result.memberships || [];
    });
  }

  async function getVerifiedAchievements(identity) {
    getIdentity(identity);
    return postApi("/api/student-profile", {}).then(function (result) {
      return result.achievements || [];
    });
  }

  async function getMyClubProposals(identity, botApiUrl) {
    const student = getIdentity(identity);
    if (!botApiUrl) return [];
    const response = await fetch(botApiUrl.replace(/\/$/, "") + "/api/my-club-proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: getInitData(), telegramId: student.telegram_id })
    });
    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.error || "Не удалось загрузить заявки");
    return payload.proposals || [];
  }

  function getInitData() {
    return window.Telegram && window.Telegram.WebApp
      ? window.Telegram.WebApp.initData
      : "";
  }

  async function postApi(path, body) {
    if (!config.botApiUrl || config.botApiUrl.includes("YOUR-RENDER")) {
      throw new Error("Сервер NIS HUB не настроен.");
    }
    const response = await fetch(config.botApiUrl.replace(/\/$/, "") + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.assign({ initData: getInitData() }, body || {}))
    });
    const payload = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(payload.error || "Запрос к серверу NIS HUB не выполнен.");
    return payload;
  }

  window.NisHubDB = Object.freeze({
    listApprovedClubs: listApprovedClubs,
    listEvents: listEvents,
    registerForClub: registerForClub,
    registerForEvent: registerForEvent,
    createClubProposal: createClubProposal,
    createTeamPost: createTeamPost,
    listTeamPosts: listTeamPosts,
    respondToTeamPost: respondToTeamPost,
    getStudentClubs: getStudentClubs,
    getVerifiedAchievements: getVerifiedAchievements,
    getMyClubProposals: getMyClubProposals
  });
}());
