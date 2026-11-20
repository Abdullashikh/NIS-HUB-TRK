(function () {
  "use strict";

  const config = window.NIS_HUB_CONFIG || {};
  const telegram = window.Telegram && window.Telegram.WebApp;
  const demoMode = !(telegram && telegram.initDataUnsafe && telegram.initDataUnsafe.user);
  const demoUser = {
    telegramId: "demo-student",
    displayName: "Демо-ученик NIS",
    grade: "10F",
    shanyrak: "Қазығұрт"
  };
  const savedStudentProfile = readProfile();
  const telegramUser = !demoMode ? telegram.initDataUnsafe.user : null;
  const identity = demoMode ? demoUser : {
    telegramId: String(telegramUser.id),
    displayName: [telegramUser.first_name, telegramUser.last_name].filter(Boolean).join(" ") || "Ученик NIS",
    grade: savedStudentProfile.grade || "Ученик NIS",
    shanyrak: savedStudentProfile.shanyrak || "NIS Turkistan"
  };
  if (demoMode) {
    identity.grade = savedStudentProfile.grade || identity.grade;
    identity.shanyrak = savedStudentProfile.shanyrak || identity.shanyrak;
  }
  const sampleClubs = [
    { id: "robotics-ai", slug: "robotics-ai", name: "Robotics & AI", direction: "IT", description: "Проектируем роботов, изучаем искусственный интеллект и участвуем в соревнованиях.", schedule: "Пн, Пт · 15:35 17:15 STEM", mentor: "Махсұтов Жанғали Ғалымұлы", capacity: 24, current_slots: 16 },
    { id: "debate-club", slug: "debate-club", name: "Debate Club", direction: "Социальные", description: "Тренируем аргументацию, публичные выступления и критическое мышление.", schedule: "Пн, Ср · 16:30 Г-301", mentor: "Дархан Шынғыс Есенғараұлы", capacity: 20, current_slots: 12 },
    { id: "nis-music-band", slug: "nis-music-band", name: "NIS Music Band", direction: "Творчество", description: "Школьная группа для вокалистов и музыкантов: репетиции и выступления.", schedule: "Ср, Пт · 16:30 Г-305", mentor: "Жүнісқожаев Асылжан", capacity: 18, current_slots: 11 },
    { id: "eco-volunteering", slug: "eco-volunteering", name: "Eco-Volunteering", direction: "Социальные", description: "Экологические инициативы, волонтёрство и проекты для кампуса.", schedule: "Сб · 10:00 Оранжерия", mentor: "Жамекова Айнаш", capacity: 25, current_slots: 14 },
    { id: "startup-incubator", slug: "startup-incubator", name: "Startup Incubator", direction: "Наука", description: "От идеи до прототипа: предпринимательство, дизайн-мышление и питчи.", schedule: "Вт · 16:00 Г-214", mentor: "Туребеков Ырысдаулет", capacity: 20, current_slots: 9 },
    { id: "chess-logic", slug: "chess-logic", name: "Chess & Logic", direction: "Наука", description: "Шахматы, логические задачи и дружеские турниры для всех уровней.", schedule: "Пн, Чт · 15:45 Оранжерия", mentor: "Сейтов Ерлан", capacity: 16, current_slots: 8 },
    { id: "art-design", slug: "art-design", name: "Art & Design", direction: "Творчество", description: "Иллюстрация, графический дизайн и визуальные истории.", schedule: "Ср · 16:00 Г-304", mentor: "Тәжібай Жұмағали", capacity: 18, current_slots: 10 },
    { id: "football-team", slug: "football-team", name: "Football Team", direction: "Спорт", description: "Командные тренировки, техника игры и школьные турниры.", schedule: "Вт, Пт · 17:00 Спорт зал", mentor: "Қалдықұлұлы Алғабек", capacity: 22, current_slots: 18 },
    { id: "programming-club", slug: "programming-club", name: "Programming Club", direction: "IT", description: "Изучаем программирование на Python и создаём собственные приложения и игры.", schedule: "Пн, Ср · 16:00 Г-212", mentor: "Ирина Липакова", capacity: 20, current_slots: 8 },
    { id: "ai-video-making", slug: "ai-video-making", name: "AI Video Making", direction: "IT", description: "Создаём видеоистории и учимся применять инструменты искусственного интеллекта для монтажа и визуальных эффектов.", schedule: "Вт, Чт · 16:15 Г-212", mentor: "Хамидулина Камилла Наильқызы", capacity: 18, current_slots: 7 },
    { id: "volleyball-team", slug: "volleyball-team", name: "Volleyball Team", direction: "Спорт", description: "Осваиваем технику волейбола, играем в команде и готовимся к школьным турнирам.", schedule: "Пн, Ср · 17:00 Спорт зал", mentor: "Кахаров Акмал", capacity: 20, current_slots: 12 },
    { id: "basketball-team", slug: "basketball-team", name: "Basketball Team", direction: "Спорт", description: "Тренируем броски, передачи и командную игру в баскетбол.", schedule: "Вт, Пт · 16:45 Малый спорт зал", mentor: "Прима Елизавета", capacity: 20, current_slots: 13 },
    { id: "toguz-kumalak", slug: "toguz-kumalak", name: "Тоғызқұмалақ", direction: "Наука", description: "Знакомимся с казахской интеллектуальной игрой, развиваем стратегическое мышление и участвуем в турнирах.", schedule: "Ср, Пт · 15:45 Инфоцентр", mentor: "Айдарбек Темірғалым", capacity: 16, current_slots: 6 }
  ];
  const sampleEvents = [
    { id: "nis-innovation-day", title: "NIS Innovation Day", description: "День ученических проектов, прототипов и технологических идей.", event_date: relativeDate(10), location: "Главный кампус", capacity: 120, current_slots: 74, category: "Выставка" },
    { id: "turkistan-hackathon", title: "Turkistan School Hackathon", description: "Командный хакатон: создаём цифровые решения для города.", event_date: relativeDate(18), location: "IT-лаборатория", capacity: 80, current_slots: 52, category: "Хакатон" },
    { id: "spring-concert", title: "Весенний концерт NIS", description: "Музыкальные выступления учеников и школьных коллективов.", event_date: relativeDate(25), location: "Актовый зал", capacity: 200, current_slots: 136, category: "Культура" },
    { id: "eco-campus-challenge", title: "Eco Campus Challenge", description: "Командный челлендж по улучшению экологичности кампуса.", event_date: relativeDate(32), location: "Школьный кампус", capacity: 60, current_slots: 31, category: "Челлендж" }
  ];
  const samplePosts = [
    { id: "post-hackathon", title: "Ищем команду на школьный хакатон", description: "Собираем команду для прототипа приложения о городе. Нужны идеи и желание создавать!", project_type: "Хакатон", skills: ["Python", "UI/UX", "Идеи"], author_name: "Айдана", author_grade: "10A", author_shanyrak: "Байтерек", created_at: new Date().toISOString() },
    { id: "post-eco", title: "Eco Campus: присоединяйся", description: "Ищем единомышленников для проекта по сокращению пластиковых отходов в кампусе.", project_type: "Социальный проект", skills: ["Экология", "Исследования", "Презентации"], author_name: "Нурислам", author_grade: "9B", author_shanyrak: "Самрук", created_at: new Date().toISOString() },
    { id: "post-robotics", title: "Команда для робо-соревнования", description: "Нужны участники для сборки и программирования робота. Опыт не обязателен.", project_type: "Соревнование", skills: ["Robotics", "Arduino", "Командная работа"], author_name: "Малика", author_grade: "11A", author_shanyrak: "Тулпар", created_at: new Date().toISOString() }
  ];

  let clubs = sampleClubs.slice();
  let events = sampleEvents.slice();
  let teamPosts = samplePosts.slice();
  let activeFilter = "Все";
  let searchTerm = "";
  const joinedClubIds = new Set(readStored("nis-hub-clubs", []));
  const joinedEventIds = new Set(readStored("nis-hub-events", []));
  const localProposals = readStored("nis-hub-proposals", []);
  const localPosts = readStored("nis-hub-posts", []);
  const localAchievements = readStored("nis-hub-achievements", demoMode ? [
    { title: "Первый проект", description: "Участие в школьном проекте", badge: "🚀" },
    { title: "Активный участник", description: "Вклад в сообщество NIS", badge: "🌟" }
  ] : []);

  if (telegram) {
    telegram.ready();
    if (typeof telegram.expand === "function") telegram.expand();
    if (telegram.setHeaderColor) telegram.setHeaderColor("#f5f7fb");
    if (telegram.setBackgroundColor) telegram.setBackgroundColor("#f5f7fb");
  }

  function relativeDate(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(16, 0, 0, 0);
    return date.toISOString();
  }

  function readStored(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return Array.isArray(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function readProfile() {
    try {
      const value = JSON.parse(localStorage.getItem("nis-hub-student-profile"));
      return value && typeof value === "object" ? value : {};
    } catch (error) {
      return {};
    }
  }

  function saveStored(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      showToast("Не удалось сохранить данные на этом устройстве.", "error");
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function safeText(value, fallback) {
    return escapeHtml(value || fallback || "");
  }

  function showToast(message, type) {
    const region = document.getElementById("toast-region");
    const toast = document.createElement("div");
    toast.className = "toast " + (type || "");
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;
    region.appendChild(toast);
    window.setTimeout(function () { toast.remove(); }, 4200);
  }

  function databaseConfigured() {
    return Boolean(
      config.supabaseUrl &&
      config.supabaseAnonKey &&
      !config.supabaseUrl.includes("YOUR-PROJECT") &&
      !config.supabaseAnonKey.includes("YOUR_SUPABASE")
    );
  }

  function apiConfigured() {
    return Boolean(config.botApiUrl && !config.botApiUrl.includes("YOUR-RENDER"));
  }

  function clubIcon(direction) {
    const icons = { IT: ["🤖", "it"], "Спорт": ["⚽", "sport"], "Творчество": ["🎨", "art"], "Наука": ["♟", "science"], "Социальные": ["🌱", "social"] };
    return icons[direction] || ["✦", "science"];
  }

  function clubCard(club) {
    const icon = clubIcon(club.direction);
    const joined = joinedClubIds.has(String(club.id));
    const full = Number(club.current_slots) >= Number(club.capacity);
    return '<article class="club-card">' +
      '<div class="club-card-top"><span class="club-icon ' + icon[1] + '">' + icon[0] + '</span><span class="club-direction">' + safeText(club.direction) + '</span></div>' +
      '<h3>' + safeText(club.name) + '</h3><p>' + safeText(club.description) + '</p>' +
      '<div class="club-meta"><span>◷ ' + safeText(club.schedule) + '</span><span>✧ Наставник: ' + safeText(club.mentor) + '</span></div>' +
      '<div class="club-footer"><span class="slots-label"><strong>' + Math.max(0, Number(club.capacity) - Number(club.current_slots)) + '</strong> мест осталось</span>' +
      '<button class="mini-button" data-join-club="' + safeText(club.id) + '"' + (joined || full ? " disabled" : "") + '>' + (joined ? "Вы записаны" : full ? "Мест нет" : "Записаться") + '</button></div></article>';
  }

  function renderClubs() {
    const filtered = clubs.filter(function (club) {
      const matchesDirection = activeFilter === "Все" || club.direction === activeFilter;
      const haystack = [club.name, club.description, club.direction, club.mentor].join(" ").toLocaleLowerCase("ru");
      return matchesDirection && haystack.includes(searchTerm.toLocaleLowerCase("ru"));
    });
    document.getElementById("club-grid").innerHTML = filtered.map(clubCard).join("");
    document.getElementById("home-club-grid").innerHTML = clubs.slice(0, 3).map(clubCard).join("");
    document.getElementById("club-count").textContent = filtered.length + (filtered.length === 1 ? " кружок" : filtered.length > 1 && filtered.length < 5 ? " кружка" : " кружков");
    document.getElementById("club-empty").classList.toggle("hidden", filtered.length !== 0);
  }

  function formatEventDate(value) {
    const date = new Date(value);
    return {
      day: new Intl.DateTimeFormat("ru", { day: "2-digit" }).format(date),
      month: new Intl.DateTimeFormat("ru", { month: "short" }).format(date).replace(".", ""),
      full: new Intl.DateTimeFormat("ru", { weekday: "short", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(date)
    };
  }

  function renderEvents() {
    const root = document.getElementById("event-grid");
    root.innerHTML = events.map(function (event) {
      const date = formatEventDate(event.event_date);
      const joined = joinedEventIds.has(String(event.id));
      const full = Number(event.current_slots) >= Number(event.capacity);
      return '<article class="event-card"><div class="event-date"><strong>' + date.day + '</strong><span>' + safeText(date.month) + '</span></div>' +
        '<div class="event-card-content"><div class="event-card-top"><span class="event-tag">' + safeText(event.category) + '</span></div>' +
        '<h3>' + safeText(event.title) + '</h3><p>' + safeText(event.description) + '</p>' +
        '<div class="event-card-bottom"><span>⌖ ' + safeText(event.location) + ' · ' + safeText(date.full) + '</span>' +
        '<button class="mini-button" data-join-event="' + safeText(event.id) + '"' + (joined || full ? " disabled" : "") + '>' + (joined ? "Вы записаны" : full ? "Мест нет" : "Участвовать") + '</button></div></div></article>';
    }).join("");
    document.getElementById("event-empty").classList.toggle("hidden", events.length !== 0);
  }

  function renderTeamPosts() {
    const root = document.getElementById("team-list");
    root.innerHTML = teamPosts.map(function (post) {
      const skills = Array.isArray(post.skills) ? post.skills : [];
      const isOwnPost = post.is_own || (post.author_telegram_id && String(post.author_telegram_id) === identity.telegramId);
      return '<article class="team-card"><div class="team-card-head"><h3>' + safeText(post.title) + '</h3><span class="team-project-type">' + safeText(post.project_type) + '</span></div>' +
        '<p>' + safeText(post.description) + '</p><div class="team-author"><span class="author-avatar">' + safeText((post.author_name || "У").slice(0, 1)) + '</span>' +
        '<span>' + safeText(post.author_name, "Ученик NIS") + ' · ' + safeText(post.author_grade, "Ученик") + (post.author_shanyrak ? " · " + safeText(post.author_shanyrak) : "") + '</span></div>' +
        '<div class="team-tags">' + skills.map(function (skill) { return "<span>" + safeText(skill) + "</span>"; }).join("") + '</div>' +
        '<div class="team-card-footer"><span>Безопасный отклик через NIS HUB</span>' +
        '<button class="mini-button" data-respond-post="' + safeText(post.id) + '"' + (isOwnPost ? " disabled" : "") + '>' + (isOwnPost ? "Ваш набор" : "Откликнуться") + '</button></div></article>';
    }).join("");
    document.getElementById("team-empty").classList.toggle("hidden", teamPosts.length !== 0);
  }

  function renderProfile() {
    document.getElementById("header-name").textContent = identity.displayName;
    document.getElementById("header-grade").textContent = identity.grade;
    document.getElementById("header-avatar").textContent = identity.displayName.slice(0, 1).toLocaleUpperCase("ru");
    document.getElementById("profile-avatar").textContent = identity.displayName.slice(0, 1).toLocaleUpperCase("ru");
    document.getElementById("profile-name").textContent = identity.displayName;
    document.getElementById("profile-grade").textContent = identity.grade;
    document.getElementById("profile-shanyrak").textContent = identity.shanyrak;
    document.getElementById("student-grade-input").value = identity.grade;
    document.getElementById("student-shanyrak-input").value = identity.shanyrak;

    const joined = clubs.filter(function (club) { return joinedClubIds.has(String(club.id)); });
    document.getElementById("my-clubs").innerHTML = joined.length ? joined.map(function (club) {
      return '<div class="profile-item"><span class="profile-item-icon">' + clubIcon(club.direction)[0] + '</span><div class="profile-item-main"><strong>' + safeText(club.name) + '</strong><small>' + safeText(club.schedule) + '</small></div><span class="status-badge approved">Участник</span></div>';
    }).join("") : '<div class="empty-note">Пока нет записей. Выбери кружок, который хочется попробовать.</div>';

    const proposals = localProposals;
    document.getElementById("my-proposals").innerHTML = proposals.length ? proposals.map(function (proposal) {
      const approved = proposal.status === "approved";
      return '<div class="profile-item"><span class="profile-item-icon">＋</span><div class="profile-item-main"><strong>' + safeText(proposal.name) + '</strong><small>' + safeText(proposal.direction) + '</small></div><span class="status-badge ' + (approved ? "approved" : "") + '">' + (approved ? "Одобрено" : "На проверке") + '</span></div>';
    }).join("") : '<div class="empty-note">Твои предложения новых кружков появятся здесь.</div>';

    const achievements = localAchievements;
    document.getElementById("achievements").innerHTML = achievements.length ? achievements.map(function (item) {
      return '<div class="achievement-card"><span>' + safeText(item.badge || "🏅") + '</span><strong>' + safeText(item.title) + '</strong><small>' + safeText(item.description) + '</small></div>';
    }).join("") : '<div class="empty-note">Верифицированные достижения будут отображаться здесь.</div>';
  }

  async function loadRemoteProfile() {
    try {
      const [memberships, achievements, proposals] = await Promise.all([
        window.NisHubDB.getStudentClubs(identity, config.botApiUrl),
        window.NisHubDB.getVerifiedAchievements(identity, config.botApiUrl),
        window.NisHubDB.getMyClubProposals(identity, config.botApiUrl)
      ]);
      joinedClubIds.clear();
      memberships.forEach(function (item) { if (item.clubs) joinedClubIds.add(String(item.clubs.id)); });
      localProposals.splice(0, localProposals.length, ...proposals);
      localAchievements.splice(0, localAchievements.length, ...achievements);
      renderClubs();
      renderProfile();
    } catch (error) {
      console.error("Не удалось загрузить профиль:", error);
      showToast("Не удалось обновить профиль с сервера: " + error.message, "error");
    }
  }

  function switchView(name) {
    const valid = ["home", "clubs", "passion", "create", "events", "community", "profile"];
    if (valid.indexOf(name) < 0) return;
    document.querySelectorAll(".view").forEach(function (view) {
      view.classList.toggle("active", view.id === "view-" + name);
    });
    document.querySelectorAll("[data-nav]").forEach(function (button) {
      button.classList.toggle("active", button.dataset.nav === name);
    });
    const titles = { home: "Главная", clubs: "Каталог кружков", passion: "AI-подбор", create: "Создать клуб", events: "События", community: "Сообщество", profile: "Мой профиль" };
    document.getElementById("page-breadcrumb").textContent = titles[name];
    if (name === "profile") {
      renderProfile();
      if (!demoMode && apiConfigured()) loadRemoteProfile();
    }
    if (name === "clubs") document.getElementById("club-search").focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadData() {
    if (databaseConfigured() && window.NisHubDB) {
      try {
        const [liveClubs, liveEvents, livePosts] = await Promise.all([
          window.NisHubDB.listApprovedClubs(),
          window.NisHubDB.listEvents(),
          window.NisHubDB.listTeamPosts()
        ]);
        if (liveClubs) clubs = liveClubs;
        if (liveEvents) events = liveEvents;
        if (livePosts) teamPosts = livePosts;
      } catch (error) {
        console.error("Не удалось загрузить данные Supabase:", error);
        showToast("Не удалось подключиться к базе. Показаны демонстрационные данные.", "error");
      }
    } else {
      showToast(demoMode
        ? "Демо-режим: данные примера загружены."
        : "Укажите Supabase URL и anon key, чтобы подключить данные.", "success");
    }
    const savedPosts = localPosts.map(function (post) {
      return Object.assign({}, post, { author_name: identity.displayName, author_grade: identity.grade, author_shanyrak: identity.shanyrak });
    });
    teamPosts = savedPosts.concat(teamPosts);
    renderClubs();
    renderEvents();
    renderTeamPosts();
    renderProfile();
    if (!demoMode && apiConfigured()) loadRemoteProfile();
  }

  async function handleClubJoin(clubId, button) {
    const club = clubs.find(function (item) { return String(item.id) === String(clubId); });
    if (!club || joinedClubIds.has(String(clubId))) return;
    button.disabled = true;
    try {
      if (demoMode || !databaseConfigured()) {
        if (Number(club.current_slots) >= Number(club.capacity)) throw new Error("Свободных мест в этом кружке больше нет.");
        joinedClubIds.add(String(club.id));
        club.current_slots = Number(club.current_slots) + 1;
        saveStored("nis-hub-clubs", Array.from(joinedClubIds));
        showToast("Запись сохранена в демо-профиле на этом устройстве.", "success");
      } else {
        const registration = await window.NisHubDB.registerForClub(club.id, identity);
        joinedClubIds.add(String(club.id));
        if (!registration.already_registered) {
          club.current_slots = Math.min(Number(club.capacity), Number(club.current_slots) + 1);
        }
        showToast("Ты записан(а) в кружок «" + club.name + "».", "success");
      }
      renderClubs();
      renderProfile();
    } catch (error) {
      button.disabled = false;
      showToast(error.message || "Не удалось записаться в кружок.", "error");
    }
  }

  async function handleEventJoin(eventId, button) {
    const event = events.find(function (item) { return String(item.id) === String(eventId); });
    if (!event || joinedEventIds.has(String(eventId))) return;
    button.disabled = true;
    try {
      if (demoMode || !databaseConfigured()) {
        if (Number(event.current_slots) >= Number(event.capacity)) throw new Error("Свободных мест на мероприятие больше нет.");
        joinedEventIds.add(String(event.id));
        event.current_slots = Number(event.current_slots) + 1;
        saveStored("nis-hub-events", Array.from(joinedEventIds));
        showToast("Регистрация сохранена в демо-режиме на этом устройстве.", "success");
      } else {
        const registration = await window.NisHubDB.registerForEvent(event.id, identity);
        joinedEventIds.add(String(event.id));
        if (!registration.already_registered) {
          event.current_slots = Math.min(Number(event.capacity), Number(event.current_slots) + 1);
        }
        showToast("Ты зарегистрирован(а) на событие «" + event.title + "».", "success");
      }
      renderEvents();
    } catch (error) {
      button.disabled = false;
      showToast(error.message || "Не удалось зарегистрироваться на событие.", "error");
    }
  }

  function localRecommendations(text, availableDays) {
    const normalized = text.toLocaleLowerCase("ru");
    const scheduleDays = {
      "понедельник": "пн",
      "вторник": "вт",
      "среда": "ср",
      "четверг": "чт",
      "пятница": "пт",
      "суббота": "сб"
    };
    const dayText = String(availableDays || "").toLocaleLowerCase("ru");
    const preferredDays = Object.keys(scheduleDays).filter(function (day) { return dayText.includes(day); });
    const keywords = {
      "robotics-ai": ["робот", "программ", "код", "искусствен", "технолог", "ai", "python", "it"],
      "programming-club": ["программ", "код", "python", "игр", "приложен", "разработ", "coding"],
      "ai-video-making": ["видео", "видеомонтаж", "монтаж", "ai", "искусствен", "съёмк", "ролик", "контент"],
      "debate-club": ["дебат", "говор", "выступ", "аргумент", "общ", "дискус"],
      "nis-music-band": ["музык", "пес", "вокал", "гитар", "сцен", "петь"],
      "eco-volunteering": ["экол", "природ", "волонт", "помог", "социаль", "кампус"],
      "startup-incubator": ["бизнес", "стартап", "иде", "предприним", "проект", "созда"],
      "chess-logic": ["шахмат", "логик", "задач", "математ", "думать", "стратег"],
      "art-design": ["рис", "дизайн", "творч", "арт", "иллюстр", "визуал"],
      "football-team": ["футбол", "спорт", "движ", "тренир", "команд", "игра"],
      "volleyball-team": ["волейбол", "мяч", "спорт", "тренир", "команд", "игра"],
      "basketball-team": ["баскетбол", "мяч", "спорт", "тренир", "команд", "игра"],
      "toguz-kumalak": ["тоғызқұмалақ", "тогызкумалак", "тогыз", "кумалак", "стратег", "логик", "шахмат"]
    };
    return clubs.map(function (club) {
      const haystack = [club.name, club.direction, club.description].join(" ").toLocaleLowerCase("ru");
      let score = 0;
      (keywords[club.slug] || []).forEach(function (word) {
        if (normalized.includes(word)) score += 3;
        if (haystack.includes(word) && normalized.includes(word)) score += 1;
      });
      if (normalized.includes(club.direction.toLocaleLowerCase("ru"))) score += 2;
      if (normalized.includes(club.schedule.toLocaleLowerCase("ru"))) score += 1;
      if (preferredDays.some(function (day) { return club.schedule.toLocaleLowerCase("ru").includes(scheduleDays[day]); })) score += 2;
      return { club: club, score: score };
    }).sort(function (a, b) { return b.score - a.score || a.club.name.localeCompare(b.club.name); }).slice(0, 3).map(function (item) {
      return {
        id: item.club.id,
        reason: item.score > 0
          ? "В твоём запросе есть интересы, которые пересекаются с направлением «" + item.club.direction + "»."
          : "Это направление поможет попробовать новый формат и познакомиться с единомышленниками."
      };
    });
  }

  function renderRecommendations(items) {
    const chosen = items.map(function (item) {
      const club = clubs.find(function (candidate) { return String(candidate.id) === String(item.id); });
      return club ? Object.assign({}, club, { recommendationReason: item.reason }) : null;
    }).filter(Boolean).slice(0, 3);
    const root = document.getElementById("recommendation-grid");
    root.innerHTML = chosen.map(function (club) {
      return clubCard(club).replace('<p>' + safeText(club.description) + '</p>', '<p>' + safeText(club.recommendationReason) + '</p>');
    }).join("");
    document.getElementById("recommendations").classList.remove("hidden");
    if (chosen.length) document.getElementById("recommendations").scrollIntoView({ behavior: "smooth", block: "start" });
    else showToast("По этим параметрам пока нет подходящих кружков. Попробуй добавить интерес.", "error");
  }

  async function handlePassionSubmit(event) {
    event.preventDefault();
    const interests = Array.from(document.querySelectorAll('input[name="interest"]:checked')).map(function (input) { return input.value; });
    const goal = document.getElementById("passion-goal").value;
    const days = document.getElementById("passion-days").value;
    const query = document.getElementById("passion-query").value.trim();
    const combined = [interests.join(", "), goal, days, query].filter(Boolean).join(". ");
    const button = event.currentTarget.querySelector('button[type="submit"]');
    const original = button.innerHTML;
    button.disabled = true;
    button.textContent = "Ищем подходящие кружки…";
    let recommendations;
    try {
      if (!apiConfigured()) throw new Error("AI-сервис пока недоступен.");
      const controller = new AbortController();
      const timeout = window.setTimeout(function () { controller.abort(); }, 6500);
      let response;
      try {
        response = await fetch(config.botApiUrl.replace(/\/$/, "") + "/api/ai-recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interests: interests, goal: goal, days: days, query: query }),
          signal: controller.signal
        });
      } finally {
        window.clearTimeout(timeout);
      }
      if (!response.ok) throw new Error("AI-сервис временно недоступен.");
      const result = await response.json();
      if (!Array.isArray(result.recommendations) || !result.recommendations.length) throw new Error("AI не вернул список кружков.");
      recommendations = result.recommendations;
    } catch (error) {
      console.info("Используется локальный алгоритм рекомендаций:", error.message);
      recommendations = localRecommendations(combined, days);
      showToast("Сервер AI недоступен — подобрали кружки локально.", "success");
    } finally {
      button.disabled = false;
      button.innerHTML = original;
    }
    renderRecommendations(recommendations);
  }

  async function submitClubProposal(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      if (demoMode || !databaseConfigured()) {
        const proposal = Object.assign({ status: "pending", created_at: new Date().toISOString() }, values);
        localProposals.unshift(proposal);
        saveStored("nis-hub-proposals", localProposals);
        showToast("Заявка сохранена в демо-профиле этого браузера.", "success");
      } else {
        const saved = await window.NisHubDB.createClubProposal(values, identity);
        localProposals.unshift(saved);
        saveStored("nis-hub-proposals", localProposals);
        showToast("Заявка отправлена администрации NIS Turkistan.", "success");
      }
      form.reset();
      renderProfile();
    } catch (error) {
      showToast(error.message || "Не удалось отправить заявку.", "error");
    } finally {
      button.disabled = false;
    }
  }

  async function submitTeamPost(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const post = {
      title: values.title.trim(),
      description: values.description.trim(),
      projectType: values.projectType,
      skills: values.skills.split(",").map(function (skill) { return skill.trim(); }).filter(Boolean).slice(0, 8)
    };
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      if (demoMode || !databaseConfigured()) {
        const localPost = Object.assign({}, post, {
          id: "local-" + Date.now(),
          is_own: true,
          project_type: post.projectType,
          author_name: identity.displayName,
          author_grade: identity.grade,
          author_shanyrak: identity.shanyrak,
          created_at: new Date().toISOString()
        });
        localPosts.unshift(localPost);
        saveStored("nis-hub-posts", localPosts);
        teamPosts.unshift(localPost);
        showToast("Набор сохранён в демо-режиме на этом устройстве.", "success");
      } else {
        const saved = await window.NisHubDB.createTeamPost(post, identity);
        teamPosts.unshift(Object.assign({}, saved, {
          is_own: true,
          project_type: post.projectType,
          skills: post.skills,
          description: post.description,
          author_name: identity.displayName,
          author_grade: identity.grade,
          author_shanyrak: identity.shanyrak
        }));
        showToast("Набор опубликован в сообществе.", "success");
      }
      form.reset();
      renderTeamPosts();
    } catch (error) {
      showToast(error.message || "Не удалось опубликовать набор.", "error");
    } finally {
      button.disabled = false;
    }
  }

  async function handleRespond(postId) {
    const post = teamPosts.find(function (item) { return String(item.id) === String(postId); });
    if (!post) return;
    if (demoMode) {
      showToast("Отклики с уведомлением доступны при запуске Mini App в Telegram.", "error");
      return;
    }
    const message = window.prompt("Коротко расскажи, чем хочешь помочь команде (до 500 символов):", "");
    if (message === null) return;
    try {
      const result = await window.NisHubDB.respondToTeamPost(postId, message.trim(), identity, config.botApiUrl);
      if (result.notification_sent) {
        showToast("Отклик отправлен. Автор получит уведомление в Telegram.", "success");
      } else {
        showToast(result.warning || "Отклик сохранён, но уведомление не доставлено.", "error");
      }
    } catch (error) {
      showToast(error.message || "Не удалось отправить отклик.", "error");
    }
  }

  function bindEvents() {
    document.addEventListener("click", function (event) {
      const nav = event.target.closest("[data-nav]");
      if (nav) {
        event.preventDefault();
        switchView(nav.dataset.nav);
        return;
      }
      const clubButton = event.target.closest("[data-join-club]");
      if (clubButton) {
        handleClubJoin(clubButton.dataset.joinClub, clubButton);
        return;
      }
      const eventButton = event.target.closest("[data-join-event]");
      if (eventButton) {
        handleEventJoin(eventButton.dataset.joinEvent, eventButton);
        return;
      }
      const responseButton = event.target.closest("[data-respond-post]");
      if (responseButton) handleRespond(responseButton.dataset.respondPost);
    });

    document.getElementById("club-search").addEventListener("input", function (event) {
      searchTerm = event.target.value.trim();
      renderClubs();
    });
    document.getElementById("club-filters").addEventListener("click", function (event) {
      const button = event.target.closest("[data-filter]");
      if (!button) return;
      activeFilter = button.dataset.filter;
      this.querySelectorAll(".filter-chip").forEach(function (chip) { chip.classList.toggle("selected", chip === button); });
      renderClubs();
    });
    document.getElementById("passion-form").addEventListener("submit", handlePassionSubmit);
    document.getElementById("club-form").addEventListener("submit", submitClubProposal);
    document.getElementById("team-form").addEventListener("submit", submitTeamPost);
    document.getElementById("profile-details-form").addEventListener("submit", function (event) {
      event.preventDefault();
      const grade = document.getElementById("student-grade-input").value.trim();
      const shanyrak = document.getElementById("student-shanyrak-input").value.trim();
      if (grade.length < 2 || shanyrak.length < 2) {
        showToast("Укажи класс и название шанырака.", "error");
        return;
      }
      identity.grade = grade.slice(0, 12);
      identity.shanyrak = shanyrak.slice(0, 50);
      saveStored("nis-hub-student-profile", { grade: identity.grade, shanyrak: identity.shanyrak });
      renderProfile();
      showToast("Данные класса и шанырака сохранены.", "success");
    });
  }

  bindEvents();
  loadData();
}());
