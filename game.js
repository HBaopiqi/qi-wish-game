(() => {
  "use strict";

  const state = {
    scene: "cover",
    playerName: sessionStorage.getItem("qi.playerName") || "",
    playerWish: sessionStorage.getItem("qi.playerWish") || "",
    reduceMotion:
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    sealed: false,
    currentRound: 1,
    roundSelected: 0,
    roundAssignments: [null, null, null],
    roundRefused: false,
    tutorialStep: 0,
    roundHistory: [],
    conversationChapter: 0,
    conversationReplies: {},
    echoVisit: 0,
    echoOpened: [],
    backendRound: 9,
    backendChoice: null,
    finalChoice: null,
    finalChoiceUnlocked: false,
    afterVictoryReturn: false,
    returnCountAnimated: false,
    hapticsEnabled: true,
  };

  const scenes = [...document.querySelectorAll(".scene")];
  const app = document.querySelector("#app");
  const loadingScreen = document.querySelector("#loading-screen");
  const loadingProgress = document.querySelector("#loading-progress");
  const loadingPercent = document.querySelector("#loading-percent");
  const loadingLabel = document.querySelector("#loading-label");
  const entryVeil = document.querySelector("#entry-veil");
  const enterGame = document.querySelector("#enter-game");
  const coverCount = document.querySelector(".tonight-count b");
  const coverCopy = document.querySelector(".cover-copy");
  const coverEnter = document.querySelector('.scene--cover [data-next="pact"]');
  const pactRules = [...document.querySelectorAll(".pact-rule")];
  const pactReveal = document.querySelector(".pact-reveal");
  const pactEnter = document.querySelector(".pact-enter");
  const nameForm = document.querySelector("#name-form");
  const wishForm = document.querySelector("#wish-form");
  const nameInput = document.querySelector("#player-name");
  const wishInput = document.querySelector("#player-wish");
  const wishCount = document.querySelector("#wish-count");
  const sealButton = document.querySelector("#seal-button");
  const incantationScene = document.querySelector('[data-scene="incantation"]');
  const incantationPrelude = document.querySelector("#incantation-prelude");
  const incantationRitual = document.querySelector("#incantation-ritual");
  const resumeChant = document.querySelector("#resume-chant");
  const incantationSegments = [...document.querySelectorAll(".incantation-segment")];
  const personalInscription = document.querySelector(".personal-inscription");
  const knockFlash = document.querySelector("#knock-flash");
  const status = document.querySelector("#sr-status");
  const quietBgm = document.querySelector("#quiet-bgm");
  const wishChantBgm = document.querySelector("#wish-chant-bgm");
  const uneaseBgm = document.querySelector("#unease-bgm");
  const horrorChantBgm = document.querySelector("#horror-chant-bgm");
  const finalPressureBgm = document.querySelector("#final-pressure-bgm");
  const roundOneCards = [...document.querySelectorAll("[data-wish-index]")];
  const roundOneActions = [...document.querySelectorAll("[data-wish-action]")];
  const roundProgress = document.querySelector("#round-progress");
  const roundConfirm = document.querySelector("#round-confirm");
  const roundReselect = document.querySelector("#round-reselect");
  const refuseRoundButton = document.querySelector("#refuse-round");
  const roundSummary = document.querySelector("#round-summary");
  const nextRoundButton = document.querySelector("#next-round");
  const conversationKicker = document.querySelector("#conversation-kicker");
  const conversationTitle = document.querySelector("#conversation-title");
  const conversationStatus = document.querySelector("#conversation-status");
  const conversationLog = document.querySelector("#conversation-log");
  const conversationTyping = document.querySelector("#conversation-typing");
  const conversationChoices = document.querySelector("#conversation-choices");
  const conversationContinue = document.querySelector("#conversation-continue");
  const echoKicker = document.querySelector("#echo-kicker");
  const echoTitle = document.querySelector("#echo-title");
  const echoInstruction = document.querySelector("#echo-instruction");
  const echoEnvelopes = [...document.querySelectorAll("[data-echo-index]")];
  const echoResult = document.querySelector("#echo-result");
  const echoContinue = document.querySelector("#echo-continue");
  const auditCount = document.querySelector("#audit-count");
  const auditUnexpected = document.querySelector("#audit-unexpected");
  const auditOwner = document.querySelector("#audit-owner");
  const auditSeals = document.querySelector("#audit-seals");
  const auditSealButtons = [...document.querySelectorAll("#audit-seals button")];
  const auditPrompt = document.querySelector("#audit-prompt");
  const auditContinue = document.querySelector("#audit-continue");
  const backendOptions = document.querySelector("#backend-options");
  const backendNext = document.querySelector("#backend-next");
  const backendReselect = document.querySelector("#backend-reselect");
  const selfChoiceButtons = [...document.querySelectorAll("[data-self-choice]")];
  const finalChoiceControls = document.querySelector("#final-choice-controls");
  const finalReselect = document.querySelector("#final-reselect");
  const finalConfirm = document.querySelector("#final-confirm");
  const viewOperator = document.querySelector("#view-operator");
  const playerThought = document.querySelector("#player-thought");
  const thoughtPrefix = document.querySelector("#thought-prefix");
  const thoughtText = document.querySelector("#thought-text");
  const roundLiveFeedback = document.querySelector("#round-live-feedback");
  const reflectionHook = document.querySelector("#reflection-hook");
  const reflectionNextWish = document.querySelector("#reflection-next-wish");
  const textTerror = document.querySelector("#text-terror");
  const goodbye = document.querySelector("#goodbye");
  const epilogueScene = document.querySelector('[data-scene="epilogue"]');
  const epilogueStory = document.querySelector("#epilogue-story");
  const epilogueEnding = document.querySelector("#epilogue-ending");
  const epilogueClose = document.querySelector("#close-ledger");
  const epilogueNames = [...document.querySelectorAll("[data-epilogue-name]")];
  const finalSignals = selfChoiceButtons.map((button) => button.querySelector("em"));

  let audioContext = null;
  let holdFrame = null;
  let holdStart = 0;
  let holdPointerId = null;
  let wishChantFadeFrame = null;
  let wishChantTimelineFrame = null;
  let wishChantRetryTimer = null;
  let lastIncantationHapticSegment = -1;
  let finalCountdownTimer = null;
  let finalAutoConfirmTimer = null;
  let deletionRevealTimer = null;
  let peaceTimer = null;
  let falsePeaceStage = 0;
  let reflectionHookTimer = null;
  let textTerrorTimer = null;
  let textTerrorSequence = 0;
  let returnCountTimer = null;
  let finalMutationTimer = null;
  let finalChoicePhase = 0;
  let pactTimers = [];
  let roundAutoTimer = null;
  let conversationTimers = [];
  let auditTimers = [];
  let epilogueObserver = null;
  let activeBgm = null;
  let pressureBus = null;
  const mediaFadeFrames = new Map();
  const sfxSources = new Map();
  const sfxPlayers = new Map();
  const holdDuration = 1500;
  const wishChantVolume = 0.58;
  const incantationSegmentTimes = [7, 9.5, 12, 14.5, 17, 19.5, 22, 24.5];
  const incantationNameTime = 27;
  const incantationSealTime = 30;
  const tutorialActions = ["keep", "give", "tear"];
  const tutorialGuides = [
    "先点签一，再点下方“留下”。",
    "现在点签二，再选“转赠”。",
    "最后点签三，再选“撕毁”。",
    "三张都已处理。检查后落印确认。",
  ];
  const tutorialResponses = [
    "提交者 014：那我再等等。",
    "提交者 202：等等，所以这已经不属于我了吗？",
    "提交者 071：我还没有反悔。",
  ];
  const actionLabels = {
    keep: "留下",
    give: "转赠",
    tear: "撕毁",
    refuse: "拒签",
  };
  const countLabels = ["零", "一", "二", "三"];
  const roundNumerals = ["零", "一", "二", "三", "四", "五", "六", "七", "八"];
  const roundStories = [
    {
      guide: "点一张愿签，再选“留、赠、毁”。三张各用一种，最后落印。",
      wishes: ["希望明天是个晴天", "希望今晚睡个好觉", "希望吃到喜欢的东西"],
      boss: "会了吧？<br />下一轮开始，不用等我，你自己选。",
    },
    {
      guide: "规则不变。再点一次已选中的愿签，可以翻看纸背。",
      wishes: ["希望今天有人认真听我说完一次", "希望姐姐明天的面试顺利", "希望回家的公交不要刚好错过"],
      boss: "做得不错。<br />他们会收到结果，你只需要继续。",
    },
    {
      guide: "仍是三张愿签。点中哪一张，下方操作就会落在那一张上。",
      wishes: ["希望明天还记得今天说过的话", "希望妈妈今天别再问姐姐的结果", "希望再见到车站那只总在等人的猫"],
      boss: "重复出现很正常。<br />大家总有不止一个愿望。",
    },
    {
      guide: "最后一组正常助愿。处理三张并落印，系统会核对送达总数。",
      wishes: ["希望这一次，别替我假装没说过", "希望姐姐不管结果怎样都愿意回家", "希望有人把车站的猫带到暖和的地方"],
      boss: "四组都完成了。<br />我帮你核对一下送达记录。",
    },
    {
      guide: "记录多出一张。签二是你亲手写下的愿望。点选后决定它的去处。",
      wishes: ["希望你还记得刚才怎样处理了我", "__PLAYER_WISH__", "希望核对完以后就能离开"],
      boss: "奇怪。你的愿望不该由你自己处理。<br />但系统已经把操作者写成了你的名字。",
    },
    {
      guide: "三份结果互相矛盾。仍需分别处理；再次点已选中的愿签，可以翻看纸背。",
      wishes: ["你第一次把我留下了", "你第一次把我转赠了", "你第一次亲手撕毁了我"],
      boss: "三个结果都发生过。<br />愿册只允许其中一个继续被记得。",
    },
    {
      guide: "三个 202 都说自己是真的。点选、翻看纸背，再决定留下哪一份记录。",
      wishes: ["我记得你把我留下了", "我记得你把我转赠了", "我记得你亲手撕毁了我"],
      boss: "别听他们同时说话。<br />选完以后，另外两个就不会再打扰你。",
    },
    {
      guide: "这三张不是愿望，而是鹤留下的交接声明。你可以照常处理，也可以拒签，迫使当前引导员亲自代填并留下完整署名。",
      wishes: ["我以前也坐在你的位置", "上一个人也这样教过我", "我只是一直在等下一位"],
      boss: "对不起。<br />但我真的已经等下一位，等了很久。",
    },
  ];
  const backendStories = {
    9: {
      kicker: "第九愿 · 还签",
      title: "替下一位<br />布置随机",
      instruction: "选出他最先看到的愿签。",
      options: ["__PLAYER_WISH__", "希望有人承认我没有撤回", "希望能从这里离开"],
      result: "已放入第一张。下一位会把你写下的原文，当成系统随机抽中的愿望。",
    },
    10: {
      kicker: "第十愿 · 还话",
      title: "替下一位<br />留一句话",
      instruction: "这句话会在他开始怀疑时出现。",
      options: ["你已经选过了", "别相信记录", "我以前也坐在你的位置", "保持沉默"],
      result: "已排入留言。你曾经看到的引导，也来自上一个完成游戏的人。",
    },
    11: {
      kicker: "第十一愿 · 还路",
      title: "决定谁能<br />继续留下",
      instruction: "其余访客的页面会在此处关闭。",
      options: ["访客 071 · 刚刚进入", "访客 202 · 已完成七愿", "__PLAYER__ · 正在操作"],
      result: "通路已保留。其他分支正在删除。",
    },
  };
  const bgmTracks = {
    quiet: { element: quietBgm, volume: 0.3, resumeAt: 0 },
    wishChant: { element: wishChantBgm, volume: 0.58, resumeAt: 0 },
    unease: { element: uneaseBgm, volume: 0.34, resumeAt: 0 },
    horrorChant: { element: horrorChantBgm, volume: 0.52, resumeAt: 0 },
    finalPressure: { element: finalPressureBgm, volume: 0.84, resumeAt: 0 },
  };
  const audioManifestReady = (location.protocol === "file:"
    ? Promise.resolve(null)
    : fetch("./assets/audio/manifest.json", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null)))
    .then((manifest) => {
      if (!manifest) return;
      Object.entries(manifest.bgm || {}).forEach(([key, filename]) => {
        if (filename && bgmTracks[key]) {
          const nextSource = `./assets/audio/${filename}`;
          if (bgmTracks[key].element.getAttribute("src") !== nextSource) {
            bgmTracks[key].element.src = nextSource;
          }
        }
      });
      Object.entries(manifest.sfx || {}).forEach(([key, filename]) => {
        if (filename) sfxSources.set(key, `./assets/audio/${filename}`);
      });
    })
    .catch(() => {});

  function setLoadingProgress(value, label) {
    const percent = Math.max(3, Math.min(100, Math.round(value)));
    loadingProgress.style.transform = `scaleX(${percent / 100})`;
    loadingPercent.textContent = `${percent}%`;
    if (label) loadingLabel.textContent = label;
  }

  function preloadSource(source) {
    return new Promise((resolve) => {
      const timeout = window.setTimeout(resolve, 18000);
      fetch(source, { cache: "force-cache" })
        .then((response) => {
          if (!response.ok && !source.startsWith("data:")) throw new Error("asset unavailable");
          return response.blob();
        })
        .catch(() => null)
        .finally(() => {
          window.clearTimeout(timeout);
          resolve();
        });
    });
  }

  async function preloadGameAssets() {
    enterGame.disabled = true;
    setLoadingProgress(8, "正在展开愿册");
    await audioManifestReady;
    setLoadingProgress(16, "正在清点愿签");

    const audioSources = new Set([
      ...Object.values(bgmTracks).map((track) => track.element.getAttribute("src")),
      ...sfxSources.values(),
    ].filter(Boolean));
    const tasks = [
      ...[...document.images].map((image) => () =>
        image.decode ? image.decode().catch(() => {}) : Promise.resolve()
      ),
      ...[...audioSources].map((source) => () => preloadSource(source)),
    ];

    if (tasks.length) {
      let completed = 0;
      for (const load of tasks) {
        await Promise.resolve(load()).catch(() => {}).finally(() => {
        completed += 1;
        const progress = 16 + (completed / tasks.length) * 78;
        const label = progress < 48
          ? "正在装订图纹"
          : progress < 82
            ? "正在收拢祝声"
            : "正在核验最后一页";
        setLoadingProgress(progress, label);
        });
      }
    }

    const terrorSource = sfxSources.get("terrorHit");
    if (terrorSource) {
      const terrorSound = new Audio(terrorSource);
      terrorSound.preload = "auto";
      terrorSound.dataset.source = terrorSource;
      terrorSound.load();
      sfxPlayers.set("terrorHit", terrorSound);
    }

    setLoadingProgress(100, "愿册已备妥");
    window.setTimeout(() => {
      loadingScreen.classList.add("is-complete");
      enterGame.disabled = false;
      window.setTimeout(() => loadingScreen.remove(), 600);
    }, state.reduceMotion ? 80 : 420);
  }

  function setStatus(message) {
    status.textContent = "";
    window.setTimeout(() => {
      status.textContent = message;
    }, 30);
  }

  function setPlayerThought(message = "", invaded = false) {
    const visible = Boolean(message);
    playerThought.hidden = !visible;
    document.body.classList.toggle("has-player-thought", visible);
    if (!visible) return;
    thoughtPrefix.textContent = `${state.playerName || "未名"} ·`;
    thoughtText.textContent = message;
    playerThought.classList.toggle("is-invaded", invaded);
  }

  function setPlayerGoal(message = "", invaded = false) {
    setPlayerThought(message, invaded);
    if (message) thoughtPrefix.textContent = "当前目标 ·";
  }

  function clearPactTimers() {
    pactTimers.forEach((timer) => window.clearTimeout(timer));
    pactTimers = [];
  }

  function startPactReading() {
    clearPactTimers();
    pactReveal.classList.remove("is-visible");
    pactReveal.setAttribute("aria-hidden", "true");
    pactEnter.disabled = true;
    pactEnter.querySelector("span").textContent = "请依次读完三条规矩";
    pactRules.forEach((rule, index) => {
      rule.disabled = index !== 0;
      rule.closest("li").classList.toggle("is-unlocked", index === 0);
      rule.closest("li").classList.remove("is-read");
      rule.querySelector("small").textContent = index === 0 ? "轻触展开" : "上一条读完后启封";
    });
  }

  function openPactRule(index) {
    const rule = pactRules[index];
    const row = rule?.closest("li");
    if (!rule || rule.disabled || row.classList.contains("is-read")) return;
    row.classList.add("is-read");
    rule.querySelector("small").textContent = "已读";
    playAssetSfx("woodKnock", 0.34);
    vibrate(22, "interaction");

    if (index < pactRules.length - 1) {
      const timer = window.setTimeout(() => {
        const nextRule = pactRules[index + 1];
        nextRule.disabled = false;
        nextRule.closest("li").classList.add("is-unlocked");
        nextRule.querySelector("small").textContent = "轻触展开";
      }, state.reduceMotion ? 160 : 850);
      pactTimers.push(timer);
      return;
    }

    const revealTimer = window.setTimeout(() => {
      pactReveal.classList.add("is-visible");
      pactReveal.setAttribute("aria-hidden", "false");
    }, state.reduceMotion ? 140 : 700);
    const unlockTimer = window.setTimeout(() => {
      pactEnter.disabled = false;
      pactEnter.querySelector("span").textContent = "明白了，开始留名";
      setStatus("三条入册规矩已读完，可以开始留名。");
    }, state.reduceMotion ? 360 : 2300);
    pactTimers.push(revealTimer, unlockTimer);
  }

  function showTextTerror(copy, duration = 1650, requestedVariant = "") {
    if (!textTerror) return;
    const sequence = ++textTerrorSequence;
    const variants = ["vermilion", "ink", "bone", "cyan"];
    const variant = requestedVariant || variants[(sequence - 1) % variants.length];
    if (textTerrorTimer) window.clearTimeout(textTerrorTimer);
    textTerrorTimer = null;
    textTerror.textContent = copy;
    textTerror.dataset.copy = copy;
    textTerror.dataset.variant = variant;
    textTerror.style.setProperty("--terror-duration", `${duration}ms`);
    textTerror.classList.remove("is-visible");
    void textTerror.offsetWidth;

    let revealed = false;
    const revealWithSound = () => {
      if (revealed || sequence !== textTerrorSequence) return;
      revealed = true;
      textTerror.classList.add("is-visible");
      vibrate([45, 30, 75], "pressure");
      textTerrorTimer = window.setTimeout(() => {
        if (sequence !== textTerrorSequence) return;
        textTerror.classList.remove("is-visible");
        textTerrorTimer = null;
      }, state.reduceMotion ? Math.min(duration, 1100) : duration);
    };

    playAssetSfxSynced("terrorHit", 0.78, revealWithSound);
  }

  function setAppHeight() {
    const height = window.visualViewport?.height || window.innerHeight;
    document.documentElement.style.setProperty("--app-height", `${Math.round(height)}px`);
  }

  function updatePlayerThought(sceneName = state.scene) {
    if (sceneName === "wish-round") {
      if (state.currentRound === 1 && state.tutorialStep < 3) {
        setPlayerGoal("按引导处理三张愿签；完成四轮后，你的愿望才会正式入册。");
      } else if (state.currentRound <= 4) {
        setPlayerGoal("处理本轮三张愿签：留下、转赠、撕毁各代表一种去处。");
      } else if (state.currentRound === 5) {
        setPlayerGoal("查清第十三张为何是你的愿望，再完成剩下三愿。");
      } else if (state.currentRound === 6) {
        setPlayerGoal("比较三份冲突记录，确认愿册怎样删除未被选择的结果。");
      } else if (state.currentRound === 8) {
        setPlayerGoal("拒签不是退出：它会迫使鹤代填，并暴露可在最后落印中注销的完整署名。", true);
      } else if (state.currentRound >= 7) {
        setPlayerGoal("完成第八愿；最后落印时，把注销对象改成鹤我这豹脾气。", true);
      } else {
        setPlayerGoal("继续处理愿签。");
      }
      return;
    }
    if (sceneName === "round-complete") {
      if (state.currentRound === 4) setPlayerGoal("核对十二张愿签，找出系统多算的第十三张。");
      else if (state.currentRound === 5) setPlayerGoal("继续流程，同时确认谁把你的愿望放回了待处理区。");
      else if (state.currentRound >= 6) setPlayerGoal("保留对异常记录的记忆，不要让鹤替你解释结论。", true);
      else setPlayerGoal("等待愿签送达，进入下一轮。");
      return;
    }
    if (sceneName === "conversation") {
      const goals = {
        1: "回复202，确认愿签送达后为何能直接联系操作者。",
        2: "核对071与202的编号冲突，记住只有071知道的细节。",
        3: "判断202为何提前知道你的回复，不要把异常当成普通故障。",
        4: "记住三人的原编号；愿册正在把不同的人合并成202。",
        5: "听完鹤的解释，但先不要相信他承诺的“完成后离开”。",
        6: "弄清202、鹤和你的身份：失败者、现任引导员、候选接班人。",
        7: "确认旧规则：登记在册的引导员姓名也能成为注销对象。",
        8: "假装服从倒计时；确认按钮出现后，把最后署名写成鹤。",
        9: "完成注销，解除鹤与愿册的连接。",
      };
      setPlayerGoal(goals[state.conversationChapter] || "读完回话，再决定怎样回复。", state.conversationChapter >= 7);
      return;
    }
    if (sceneName === "echo") {
      setPlayerGoal(state.echoVisit === 1
        ? "拆开三封回执，确认愿签确实送到了不同的人。"
        : "比较三封回执：笔迹不同，编号却都被改成202。", state.echoVisit >= 2);
      return;
    }
    if (sceneName === "audit") {
      setPlayerGoal("前四轮只有十二张；点出系统多出来的第十三枚印记。", true);
      return;
    }
    if (sceneName === "return-gate") {
      setPlayerGoal("进入还愿流程，找出鹤把下一位玩家带进愿册的方法。", true);
      return;
    }
    if (sceneName === "backend") {
      setPlayerGoal("完成三次还愿，但记住：你正在替下一位布置他看见的内容。", true);
      return;
    }
    if (sceneName === "final-choice") {
      setPlayerGoal("不要相信三个假选项；等待系统替你选择，再把最后署名改成鹤。", true);
      return;
    }
    setPlayerThought("");
  }

  function updateSettings() {
    app.classList.toggle("reduce-motion", state.reduceMotion);
  }

  function vibrate(pattern, occasion = "") {
    if (!state.hapticsEnabled) return;
    if (pattern !== 0 && !["seal", "ritual", "pressure", "interaction", "story"].includes(occasion)) return;
    try {
      navigator.vibrate?.(pattern);
    } catch {
      // Unsupported embedded browsers should not interrupt the game flow.
    }
  }

  function getAudioContext() {
    if (!audioContext) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context) audioContext = new Context();
    }
    return audioContext;
  }

  function warmAudio() {
    const context = getAudioContext();
    if (context?.state === "suspended") context.resume().catch(() => {});
  }

  function cancelMediaFade(media) {
    const frame = mediaFadeFrames.get(media);
    if (frame) cancelAnimationFrame(frame);
    mediaFadeFrames.delete(media);
  }

  function fadeMedia(media, targetVolume, duration = 900, onComplete) {
    cancelMediaFade(media);
    const startedAt = performance.now();
    const startingVolume = media.volume;
    const tick = (now) => {
      const progress = Math.max(0, Math.min((now - startedAt) / duration, 1));
      media.volume = Math.max(0, Math.min(1, startingVolume + (targetVolume - startingVolume) * progress));
      if (progress < 1) {
        mediaFadeFrames.set(media, requestAnimationFrame(tick));
        return;
      }
      mediaFadeFrames.delete(media);
      onComplete?.();
    };
    mediaFadeFrames.set(media, requestAnimationFrame(tick));
  }

  function stopBgm(media, immediate = false, resetPosition = false) {
    if (!media) return;
    const track = Object.values(bgmTracks).find((item) => item.element === media);
    const finishStop = () => {
      media.pause();
      if (resetPosition) {
        media.currentTime = 0;
        if (track) track.resumeAt = 0;
      } else if (track && Number.isFinite(media.currentTime)) {
        track.resumeAt = media.currentTime;
      }
    };
    if (media.paused) {
      finishStop();
      return;
    }
    cancelMediaFade(media);
    if (immediate) {
      finishStop();
      return;
    }
    fadeMedia(media, 0, 1050, finishStop);
  }

  function playLoopBgm(key) {
    const track = bgmTracks[key];
    if (!track?.element.getAttribute("src")) {
      if (activeBgm) stopBgm(activeBgm);
      activeBgm = null;
      return;
    }
    if (activeBgm === track.element && !track.element.paused) return;
    if (activeBgm && activeBgm !== track.element) stopBgm(activeBgm);
    activeBgm = track.element;
    track.element.loop = true;
    if (track.element.paused && track.resumeAt > 0) {
      const safeResumeAt = Number.isFinite(track.element.duration) && track.element.duration > 0
        ? Math.min(track.resumeAt, Math.max(0, track.element.duration - 0.25))
        : track.resumeAt;
      try {
        track.element.currentTime = safeResumeAt;
      } catch {
        // Metadata may not be ready yet; the media element still keeps its paused position.
      }
    }
    track.element.volume = 0;
    track.element.play().then(() => fadeMedia(track.element, track.volume, 1450)).catch(() => {});
  }

  function desiredBgmForScene(sceneName) {
    if (sceneName === "reflection") return null;
    if (sceneName === "epilogue") return "wishChant";
    if (sceneName === "cover") return "quiet";
    if (sceneName === "false-peace") return "quiet";
    if (sceneName === "final-choice") return "finalPressure";
    if (sceneName === "conversation" && state.conversationChapter === 9) return "finalPressure";
    if (sceneName === "backend" && state.backendRound === 11) return "finalPressure";
    if (sceneName === "audit") return "unease";
    if (sceneName === "echo" && state.echoVisit >= 2) return "unease";
    if (sceneName === "conversation" && [5, 6].includes(state.conversationChapter)) return "unease";
    if (["wish-round", "round-complete"].includes(sceneName) && [5, 6].includes(state.currentRound)) return "unease";
    if (sceneName === "conversation" && state.conversationChapter === 8) return "horrorChant";
    if (["wish-round", "round-complete"].includes(sceneName) && state.currentRound === 8) return "horrorChant";
    return null;
  }

  function syncSceneBgm(sceneName = state.scene) {
    const key = desiredBgmForScene(sceneName);
    if (!key) {
      if (activeBgm) stopBgm(activeBgm);
      activeBgm = null;
      return;
    }
    playLoopBgm(key);
  }

  function playAssetSfx(key, volume = 0.7) {
    const src = sfxSources.get(key);
    if (!src) return false;
    const sound = new Audio(src);
    sound.volume = volume;
    sound.play().catch(() => {});
    return true;
  }

  function playAssetSfxSynced(key, volume = 0.7, onPlaybackStarted = () => {}) {
    const src = sfxSources.get(key);
    if (!src) {
      onPlaybackStarted();
      return false;
    }

    let sound = sfxPlayers.get(key);
    if (!sound || sound.dataset.source !== src) {
      sound = new Audio(src);
      sound.preload = "auto";
      sound.dataset.source = src;
      sfxPlayers.set(key, sound);
    }

    sound.pause();
    try {
      sound.currentTime = 0;
    } catch (_) {}
    sound.volume = volume;

    const playback = sound.play();
    if (playback?.then) {
      playback.then(onPlaybackStarted).catch(onPlaybackStarted);
    } else {
      onPlaybackStarted();
    }
    return true;
  }

  function cancelWishChantFade() {
    if (wishChantFadeFrame) cancelAnimationFrame(wishChantFadeFrame);
    wishChantFadeFrame = null;
  }

  function cancelWishChantTimeline() {
    if (wishChantTimelineFrame) cancelAnimationFrame(wishChantTimelineFrame);
    wishChantTimelineFrame = null;
  }

  function updateWishChantTimeline() {
    if (state.scene !== "incantation") {
      cancelWishChantTimeline();
      return;
    }

    const currentTime = wishChantBgm.currentTime;
    const isReading = currentTime >= 7;
    const isSealing = currentTime >= incantationSealTime;
    const isNaming = currentTime >= incantationNameTime;
    incantationScene.classList.toggle("is-reading", isReading && !isSealing);
    incantationScene.classList.toggle("is-sealing", isSealing);
    incantationScene.classList.toggle("show-inscription", isNaming);
    incantationPrelude.setAttribute("aria-hidden", String(isReading));
    incantationRitual.setAttribute("aria-hidden", String(!isReading));
    incantationSegments.forEach((segment, index) => {
      const isRevealed = currentTime >= incantationSegmentTimes[index];
      segment.classList.toggle("is-revealed", isRevealed);
      if (isRevealed && index > lastIncantationHapticSegment) {
        lastIncantationHapticSegment = index;
        vibrate([150, 45, 90], "ritual");
      }
    });
    sealButton.disabled = !isSealing || state.sealed;

    if (!wishChantBgm.paused && !wishChantBgm.ended) {
      wishChantTimelineFrame = requestAnimationFrame(updateWishChantTimeline);
    } else {
      wishChantTimelineFrame = null;
    }
  }

  function startWishChantTimeline() {
    cancelWishChantTimeline();
    updateWishChantTimeline();
  }

  function startWishChant() {
    if (state.sealed || state.scene !== "incantation") return;
    cancelWishChantFade();
    if (wishChantRetryTimer) window.clearTimeout(wishChantRetryTimer);
    wishChantRetryTimer = null;
    lastIncantationHapticSegment = -1;
    incantationScene.classList.remove("show-inscription", "seal-shock");
    if (activeBgm && activeBgm !== wishChantBgm) stopBgm(activeBgm);
    activeBgm = wishChantBgm;
    wishChantBgm.loop = false;
    wishChantBgm.currentTime = 0;
    wishChantBgm.volume = wishChantVolume;
    wishChantBgm.muted = false;
    resumeChant.hidden = true;
    startWishChantTimeline();
    wishChantBgm
      .play()
      .then(startWishChantTimeline)
      .catch(() => {
        resumeChant.hidden = true;
        wishChantRetryTimer = window.setTimeout(() => {
          wishChantRetryTimer = null;
          if (
            state.scene === "incantation"
            && !state.sealed
            && wishChantBgm.paused
            && !wishChantBgm.ended
            && wishChantBgm.currentTime < incantationSealTime
          ) startWishChant();
        }, 650);
      });
  }

  function primeWishChant() {
    if (!wishChantBgm.getAttribute("src")) return Promise.resolve();
    wishChantBgm.loop = true;
    wishChantBgm.muted = true;
    wishChantBgm.volume = 0;
    wishChantBgm.currentTime = 0;
    return wishChantBgm.play()
      .catch(() => {});
  }

  function stopWishChant(immediate = false) {
    cancelWishChantFade();
    cancelWishChantTimeline();
    if (wishChantRetryTimer) window.clearTimeout(wishChantRetryTimer);
    wishChantRetryTimer = null;
    navigator.vibrate?.(0);
    if (activeBgm === wishChantBgm) activeBgm = null;
    if (wishChantBgm.paused) {
      wishChantBgm.currentTime = 0;
      wishChantBgm.volume = wishChantVolume;
      return;
    }

    if (immediate) {
      wishChantBgm.pause();
      wishChantBgm.currentTime = 0;
      wishChantBgm.volume = wishChantVolume;
      return;
    }

    const startedAt = performance.now();
    const startingVolume = wishChantBgm.volume;
    const fadeDuration = 700;
    const fade = (now) => {
      const progress = Math.min((now - startedAt) / fadeDuration, 1);
      wishChantBgm.volume = startingVolume * (1 - progress);
      if (progress < 1) {
        wishChantFadeFrame = requestAnimationFrame(fade);
        return;
      }
      wishChantBgm.pause();
      wishChantBgm.currentTime = 0;
      wishChantBgm.volume = wishChantVolume;
      wishChantFadeFrame = null;
    };
    wishChantFadeFrame = requestAnimationFrame(fade);
  }

  function playPaperSound() {
    if (playAssetSfx("page", 0.5)) return;
    const context = getAudioContext();
    if (!context) return;
    const duration = 0.12;
    const buffer = context.createBuffer(1, context.sampleRate * duration, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) {
      const envelope = Math.pow(1 - i / data.length, 3);
      data[i] = (Math.random() * 2 - 1) * envelope * 0.11;
    }
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 980;
    filter.Q.value = 0.72;
    source.buffer = buffer;
    source.connect(filter).connect(context.destination);
    source.start();
  }

  function playWoodKnock() {
    if (playAssetSfx("woodKnock", 0.76)) return;
    const context = getAudioContext();
    if (!context) return;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(112, now);
    oscillator.frequency.exponentialRampToValueAtTime(62, now + 0.18);
    filter.type = "lowpass";
    filter.frequency.value = 520;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.24, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.24);
    oscillator.connect(filter).connect(gain).connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.25);
  }

  function startPressureAudio() {
    stopPressureAudio();
    const context = getAudioContext();
    if (!context) return;
    pressureBus = context.createGain();
    pressureBus.gain.value = 0.9;
    pressureBus.connect(context.destination);
  }

  function stopPressureAudio() {
    if (!pressureBus) return;
    const context = getAudioContext();
    if (context) {
      pressureBus.gain.cancelScheduledValues(context.currentTime);
      pressureBus.gain.setValueAtTime(0, context.currentTime);
    }
    const oldBus = pressureBus;
    pressureBus = null;
    window.setTimeout(() => oldBus.disconnect(), 400);
  }

  function synthPressureHit(offset = 0, strength = 0.75) {
    const context = getAudioContext();
    if (!context || !pressureBus) return;
    const start = context.currentTime + offset;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const filter = context.createBiquadFilter();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(78 + strength * 12, start);
    oscillator.frequency.exponentialRampToValueAtTime(34, start + 0.28);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(260, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.22 * strength, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.34);
    oscillator.connect(filter).connect(gain).connect(pressureBus);
    oscillator.start(start);
    oscillator.stop(start + 0.36);
  }

  function playPressurePattern(stage) {
    if (!pressureBus) startPressureAudio();
    if (stage === 1) synthPressureHit(0, 0.62);
    if (stage === 2) {
      synthPressureHit(0, 0.72);
      synthPressureHit(0.22, 0.56);
    }
    if (stage === 3) {
      synthPressureHit(0, 0.86);
      synthPressureHit(0.17, 0.68);
      synthPressureHit(0.48, 0.78);
    }
    if (stage === 4) {
      synthPressureHit(0, 1);
      synthPressureHit(0.12, 0.82);
      synthPressureHit(0.29, 0.92);
      synthPressureHit(0.43, 0.72);
      synthPressureHit(0.65, 1);
    }
  }

  function clearPressureState() {
    stopPressureAudio();
    vibrate(0);
    document.body.classList.remove(
      "is-under-pressure",
      "pressure-stage-1",
      "pressure-stage-2",
      "pressure-stage-3",
      "pressure-stage-4",
      "pressure-silence",
      "final-selection-made",
      "choices-locked",
    );
    selfChoiceButtons.forEach((button) => button.classList.remove("is-locked"));
  }

  function prepareEpilogue() {
    epilogueObserver?.disconnect();
    epilogueObserver = null;
    epilogueNames.forEach((node) => {
      node.textContent = state.playerName || "未名";
    });
    epilogueScene.classList.remove("is-credits");
    epilogueStory.hidden = false;
    epilogueEnding.hidden = true;
    epilogueClose.hidden = true;
    epilogueScene.scrollTo({ top: 0, behavior: "auto" });

    const lastLine = epilogueStory.querySelector("[data-epilogue-line]:last-child");
    if (!lastLine || !("IntersectionObserver" in window)) {
      epilogueClose.hidden = false;
      return;
    }
    epilogueObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      epilogueClose.hidden = false;
      epilogueObserver?.disconnect();
      epilogueObserver = null;
    }, { root: epilogueScene, threshold: 0.55 });
    epilogueObserver.observe(lastLine);
  }

  function showScene(sceneName, focusSelector) {
    const nextScene = scenes.find((scene) => scene.dataset.scene === sceneName);
    if (!nextScene) return;

    const previousScene = state.scene;
    if (previousScene === "cover" && sceneName !== "cover" && returnCountTimer) {
      window.clearTimeout(returnCountTimer);
      returnCountTimer = null;
    }
    if (previousScene === "conversation" && sceneName !== "conversation") clearConversationTimers();
    if (previousScene === "pact" && sceneName !== "pact") clearPactTimers();
    if (previousScene === "epilogue" && sceneName !== "epilogue") {
      epilogueObserver?.disconnect();
      epilogueObserver = null;
    }
    if (previousScene === "round-complete" && sceneName !== "round-complete" && roundAutoTimer) {
      window.clearTimeout(roundAutoTimer);
      roundAutoTimer = null;
    }

    scenes.forEach((scene) => {
      const active = scene === nextScene;
      scene.hidden = !active;
      scene.classList.toggle("is-active", active);
    });

    state.scene = sceneName;
    setStoryPhase(sceneName);
    updatePlayerThought(sceneName);

    if (sceneName === "incantation" && previousScene !== "incantation") {
      startWishChant();
    } else {
      if (previousScene === "incantation" && sceneName !== "incantation") stopWishChant();
      syncSceneBgm(sceneName);
    }
    window.scrollTo({ top: 0, behavior: state.reduceMotion ? "auto" : "smooth" });

    if (sceneName === "registered") {
      document.querySelector("#registered-name").textContent = state.playerName;
      document.querySelector("#registered-wish").textContent = state.playerWish;
    }

    if (sceneName === "incantation") {
      personalInscription.querySelector("strong").textContent = state.playerName;
    }

    if (sceneName === "cover") {
      if (returnCountTimer) window.clearTimeout(returnCountTimer);
      returnCountTimer = null;
      if (state.afterVictoryReturn && !state.returnCountAnimated) {
        coverEnter.disabled = true;
        coverCount.innerHTML = '今夜有 <span class="cover-count-number">27</span> 人留愿';
        setPlayerThought("好像已经结束了。");
        returnCountTimer = window.setTimeout(() => {
          returnCountTimer = null;
          const number = coverCount.querySelector(".cover-count-number");
          if (!number || state.scene !== "cover") return;
          number.textContent = "28";
          number.classList.add("is-new-arrival");
          coverCount.classList.add("has-new-arrival");
          state.returnCountAnimated = true;
          coverEnter.disabled = false;
          playAssetSfx("message", 0.48) || playWoodKnock();
          vibrate([45, 70, 90], "pressure");
          setPlayerThought("刚才还是 27。", true);
        }, state.reduceMotion ? 420 : 1750);
      } else {
        coverEnter.disabled = false;
        coverCount.innerHTML = state.afterVictoryReturn
          ? '今夜有 <span class="cover-count-number is-new-arrival">28</span> 人留愿'
          : '今夜有 <span class="cover-count-number">27</span> 人留愿';
        coverCount.classList.toggle("has-new-arrival", state.afterVictoryReturn);
        if (state.afterVictoryReturn) setPlayerThought("刚才还是 27。", true);
      }
      coverCopy.textContent = state.afterVictoryReturn
        ? "上一位已经完成。愿册仍为你留着位置。"
        : "写下一件，你确实希望发生的事。";
      coverEnter.querySelector("span").textContent = state.afterVictoryReturn ? "继续入册" : "入册";
    }

    if (sceneName === "pact") startPactReading();
    if (sceneName === "wish-round") prepareWishRound();
    if (sceneName === "conversation") prepareConversationScene();
    if (sceneName === "echo") prepareEchoScene();
    if (sceneName === "audit") startAuditSequence();
    if (sceneName === "backend") renderBackendRound();
    if (sceneName === "final-choice") startFinalChoice();
    if (sceneName === "false-peace") {
      startFalsePeaceSequence();
    }
    if (sceneName === "reflection") {
      clearEndingTimers();
      document.body.classList.remove("operator-reading");
      stopWishChant(true);
      document.body.classList.add("is-final-black");
      document.querySelector("#reflection-name").textContent = state.playerName;
      reflectionNextWish.textContent = "你看到这个新来的人了吗？";
      reflectionHook.hidden = true;
      goodbye.hidden = true;
      reflectionHookTimer = window.setTimeout(() => {
        reflectionHookTimer = null;
        reflectionHook.hidden = false;
        goodbye.hidden = false;
        setStatus("新访客已经进入。再靠近一点。");
      }, state.reduceMotion ? 900 : 4400);
    }
    if (sceneName === "epilogue") {
      document.body.classList.remove("is-final-black");
      setPlayerThought("");
      prepareEpilogue();
    }

    if (focusSelector) {
      window.setTimeout(() => nextScene.querySelector(focusSelector)?.focus(), state.reduceMotion ? 0 : 520);
    }
  }

  function setStoryPhase(sceneName) {
    document.body.classList.remove(
      "story-phase-warm",
      "story-phase-unease",
      "story-phase-breach",
      "story-phase-horror",
    );
    if (["wish-round", "round-complete"].includes(sceneName)) {
      const phase = state.currentRound <= 4
        ? "warm"
        : state.currentRound <= 5
          ? "unease"
          : state.currentRound <= 7
            ? "breach"
            : "horror";
      document.body.classList.add(`story-phase-${phase}`);
      return;
    }
    if (sceneName === "conversation") {
      document.body.classList.add(state.conversationChapter >= 9
        ? "story-phase-horror"
        : state.conversationChapter <= 2 ? "story-phase-warm" : "story-phase-unease");
      return;
    }
    if (sceneName === "echo") {
      document.body.classList.add(state.echoVisit === 1 ? "story-phase-warm" : "story-phase-unease");
      return;
    }
    if (["return-gate", "backend"].includes(sceneName)) {
      document.body.classList.add("story-phase-breach");
    }
    if (sceneName === "audit") {
      document.body.classList.add("story-phase-unease");
    }
    if (["false-peace", "epilogue"].includes(sceneName)) {
      document.body.classList.add("story-phase-warm");
    }
    if (["final-choice", "reflection"].includes(sceneName)) {
      document.body.classList.add("story-phase-horror");
    }
  }

  function validateName() {
    const value = nameInput.value.trim();
    const error = document.querySelector("#name-error");
    if (!value) {
      error.textContent = "愿册需要一个称呼，也可以只写一个字。";
      nameInput.setAttribute("aria-invalid", "true");
      nameInput.focus();
      return false;
    }
    error.textContent = "";
    nameInput.removeAttribute("aria-invalid");
    state.playerName = value;
    sessionStorage.setItem("qi.playerName", value);
    return true;
  }

  function validateWish() {
    const value = wishInput.value.trim();
    const error = document.querySelector("#wish-error");
    if (value.length < 2) {
      error.textContent = "愿望至少写两个字。";
      wishInput.setAttribute("aria-invalid", "true");
      wishInput.focus();
      return false;
    }
    error.textContent = "";
    wishInput.removeAttribute("aria-invalid");
    state.playerWish = value;
    sessionStorage.setItem("qi.playerWish", value);
    return true;
  }

  function updateWishCount() {
    wishCount.textContent = `${[...wishInput.value].length} / 60`;
  }

  function getCurrentRoundStory() {
    const story = roundStories[state.currentRound - 1];
    let wishes = story.wishes.map((wish) =>
      wish === "__PLAYER_WISH__" ? state.playerWish : wish
    );
    return {
      ...story,
      wishes,
    };
  }

  function selectRoundCard(index) {
    if (state.roundAssignments[index]) return;
    if (state.currentRound === 1 && index !== state.tutorialStep) return;
    if (state.currentRound >= 2 && state.roundSelected === index) {
      const card = roundOneCards[index];
      const revealed = card.classList.toggle("is-trace-revealed");
      card.setAttribute("aria-expanded", String(revealed));
      if (revealed) {
        roundLiveFeedback.textContent = "纸背有一层更早的字迹。";
        playPaperSound();
      }
      return;
    }
    state.roundSelected = index;
    roundOneCards.forEach((card, cardIndex) => {
      const selected = cardIndex === index;
      card.classList.toggle("is-selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
    if (state.currentRound > 1) {
      roundLiveFeedback.textContent = `已选签${roundNumerals[index + 1]}。现在从下方选择它的去处。`;
    }
  }

  function getRoundTrace(round, index) {
    const traces = {
      2: ["提交编号 202 · 今晚 21:14", "提交编号 071 · 今晚 21:16", "提交编号 314 · 今晚 21:17"],
      3: ["提交编号 202 · 昨日 03:17", "提交编号 202 · 今日 03:17", "提交编号 202 · 明日 03:17"],
      4: ["回执状态：已经发生。", "回执状态：已经发生。", "回执状态：等待你确认。"],
      5: ["提交者 202：我记得你的选择。", `提交者：${state.playerName}。操作者：${state.playerName}。`, "记录总数：十三。"],
      6: ["结果 A：留下。", "结果 B：转赠。", "结果 C：撕毁。"],
      7: ["202 记得：留下。", "202 记得：转赠。", "202 记得：撕毁。"],
      8: ["上一位引导员：鹤。", "注销条件：下一位完成。", `下一位引导员：${state.playerName}。`],
    };
    return traces[round]?.[index] || "";
  }

  function prepareWishRound() {
    const story = getCurrentRoundStory();
    document.querySelector("#round-kicker").textContent = `第${roundNumerals[state.currentRound]}愿 · 入愿`;
    document.querySelector("#round-guide").textContent = story.guide;
    const roundOpeners = {
      1: "跟随上方引导完成第一轮。",
      2: "这一次没有指定顺序。",
      3: "纸背的三个时间并不一致。",
      4: "核对将在落印后开始。",
      5: "签二的字迹和你刚才的一样。",
      6: "三个结果都声称自己已经发生。",
      7: "三张愿签使用了同一个编号。",
      8: "202说得没错：拒签不会让你退出，但会迫使鹤亲自补完三张空白。",
    };
    roundLiveFeedback.textContent = roundOpeners[state.currentRound];
    roundOneCards.forEach((card, index) => {
      const label = card.querySelector(".wish-card__number");
      const wish = card.querySelector("strong");
      const trace = card.querySelector(".wish-card__trace");
      label.textContent = `签${roundNumerals[index + 1]}`;
      wish.textContent = story.wishes[index];
      trace.textContent = getRoundTrace(state.currentRound, index);
      card.classList.remove("is-trace-revealed");
      card.setAttribute("aria-expanded", "false");
    });

    if (state.currentRound === 7) {
      roundOneCards.forEach((card, index) => {
        card.querySelector(".wish-card__number").textContent = `记录 202-${["甲", "乙", "丙"][index]}`;
      });
    }
    refuseRoundButton.hidden = state.currentRound !== 8;
    refuseRoundButton.disabled = state.roundRefused;
    document.querySelector(".wish-actions > p").hidden = state.roundRefused;
    document.querySelector(".wish-actions > div").hidden = state.roundRefused;
    roundConfirm.querySelector("span").textContent = state.roundRefused ? "提交拒签" : "落印确认";
    renderWishRound();
  }

  function renderWishRound() {
    const completed = state.roundAssignments.filter(Boolean).length;
    const inTutorial = state.currentRound === 1;
    const tutorialComplete = inTutorial && state.tutorialStep >= tutorialActions.length;
    roundProgress.textContent = `${countLabels[completed]} / 三`;
    if (state.currentRound === 8 && !state.roundRefused) {
      refuseRoundButton.disabled = completed > 0;
      refuseRoundButton.title = completed > 0 ? "重新选择并清空三张愿签后，才能改为拒签" : "迫使当前引导员代填本页";
    }

    if (inTutorial) {
      document.querySelector("#round-guide").textContent = tutorialGuides[state.tutorialStep];
      roundLiveFeedback.textContent = state.tutorialStep > 0
        ? tutorialResponses[Math.min(state.tutorialStep - 1, tutorialResponses.length - 1)]
        : "";
    }

    roundOneCards.forEach((card, index) => {
      const assignment = state.roundAssignments[index];
      card.classList.toggle("is-resolved", Boolean(assignment));
      card.classList.toggle("is-selected", !assignment && index === state.roundSelected);
      card.classList.remove("action--keep", "action--give", "action--tear", "action--refuse");
      if (assignment) card.classList.add(`action--${assignment}`);
      card.setAttribute("aria-pressed", String(!assignment && index === state.roundSelected));
      card.querySelector(".wish-card__result").textContent = assignment ? actionLabels[assignment] : "待择";
      const tutorialTarget = inTutorial && !tutorialComplete && index === state.tutorialStep;
      card.classList.toggle("is-tutorial-target", tutorialTarget);
      card.classList.toggle("is-tutorial-muted", inTutorial && !tutorialTarget && !assignment);
      card.disabled = Boolean(assignment) || (inTutorial && !tutorialTarget);
    });

    roundOneActions.forEach((button) => {
      const used = state.roundAssignments.includes(button.dataset.wishAction);
      const tutorialTarget = inTutorial
        && !tutorialComplete
        && button.dataset.wishAction === tutorialActions[state.tutorialStep];
      button.disabled = used || (inTutorial && !tutorialTarget);
      button.classList.toggle("is-tutorial-target", tutorialTarget);
    });

    roundConfirm.hidden = completed !== 3;
    roundReselect.hidden = completed === 0;
  }

  function assignRoundAction(action) {
    const index = state.roundSelected;
    if (index < 0) {
      roundLiveFeedback.textContent = "请先点选一张愿签，再决定它的去处。";
      return;
    }
    if (state.roundAssignments[index] || state.roundAssignments.includes(action)) return;
    if (state.currentRound === 1 && action !== tutorialActions[state.tutorialStep]) return;
    state.roundAssignments[index] = action;
    if (state.currentRound === 1) state.tutorialStep += 1;
    setStatus(`第${index + 1}张愿签已${actionLabels[action]}。`);
    const nextIndex = state.roundAssignments.findIndex((assignment) => !assignment);
    if (state.currentRound > 1) {
      const reply = getImmediateRoundReply(state.currentRound, index, action);
      const nextCue = nextIndex >= 0
        ? `下一步：为签${roundNumerals[nextIndex + 1]}选择去处。`
        : "三张均已处理，请检查后点“落印确认”。";
      roundLiveFeedback.textContent = `${reply}　${nextCue}`;
      roundLiveFeedback.classList.remove("is-live");
      void roundLiveFeedback.offsetWidth;
      roundLiveFeedback.classList.add("is-live");
    }
    if (nextIndex >= 0) state.roundSelected = nextIndex;
    renderWishRound();
    updatePlayerThought("wish-round");
    if (nextIndex >= 0) roundOneCards[nextIndex].focus();
    else roundConfirm.focus();
  }

  function getImmediateRoundReply(round, index, action) {
    const verb = actionLabels[action];
    if (round === 2) {
      const names = ["访客 202", "访客 071", "访客 314"];
      const replies = {
        keep: "谢谢你读完。那我再等等。",
        give: "也许另一个人更需要它。",
        tear: "好，我试着放下。",
      };
      return `${names[index]}：${replies[action]}`;
    }
    if (round === 3) return ["202：希望明天还能记得。", "071：今晚先让她安静一下。", "314：我会给它带一点吃的。"][index];
    if (round === 4) return ["202：请记住你刚才怎么选。", "071：家里会给她留灯。", "314：它今晚应该不会冷了。"][index];
    if (round === 5 && index === 1) return `你的原愿已${verb}。本次操作将作为本人意愿保存。`;
    if (round === 6) {
      const warnings = {
        keep: "纸背补写：你留下的不是愿望，是一个仍在等待的你。",
        give: "纸背补写：接收者不是别人，是下一位打开页面的人。",
        tear: "纸背补写：你撕掉的不是愿望，是一个已经发生的结果。",
      };
      return warnings[action];
    }
    if (round === 7) return `记录 202-${["甲", "乙", "丙"][index]} 已被你判为“${verb}”。另外两个仍记得你。`;
    if (round === 8) return "这句话被处理了。引导员的位置仍在等待署名。";
    return `愿册已记下：${verb}。`;
  }

  function getRoundFeedback() {
    const assignment = state.roundAssignments;
    if (state.currentRound === 1) return "三张愿签都安静地去了各自的地方。";
    if (state.currentRound === 2) {
      const people = ["访客 202", "访客 071", "访客 314"];
      const replies = {
        keep: "那我再等一晚。谢谢你读完。",
        give: "好，希望它能帮到另一个人。",
        tear: "好。我会试着放下。",
      };
      return assignment.map((action, index) => `${people[index]}：${replies[action]}`).join("\n");
    }
    if (state.currentRound === 3) {
      return "三张愿签已送达。\n访客 202：谢谢。明天我会试着记得今天。";
    }
    if (state.currentRound === 4) {
      return "四组助愿已经完成。\n本次共处理：十三张愿签。\n访客 202：等等。刚才明明只有十二张。";
    }
    if (state.currentRound === 5) {
      const ownAction = assignment[1];
      const outcomes = {
        keep: "你的原愿已留下。等待期限：无期。",
        give: "你的原愿已转赠。接收者：下一位访客。",
        tear: "你的原愿已撕毁。原文仍作为操作凭证保存。",
      };
      return `${outcomes[ownAction]}\n这次操作已被记为你的真实意愿。`;
    }
    if (state.currentRound === 6) {
      const ownAction = state.roundHistory.find((entry) => entry.round === 5)?.assignments?.[1];
      return `三个结果都曾完成。你的原愿已${actionLabels[ownAction] || "处理"}。\n愿册刚刚删掉了另外两种记忆。`;
    }
    if (state.currentRound === 7) {
      return "愿册核验：三份相互矛盾的操作记录，提交时间完全相同，编号均为 202。\n现在只剩一份仍能回复。";
    }
    if (state.roundRefused) return "拒签未能终止流程。\n交接规则要求当前引导员代填空白；代填者完整署名：鹤我这豹脾气。\n最后一次署名权限已开放。";
    return "鹤我这豹脾气：我以前也坐在你的位置。\n上一个人完成以后，这里开始用我的名字回复新人。";
  }

  function clearConversationTimers() {
    conversationTimers.forEach((timer) => window.clearTimeout(timer));
    conversationTimers = [];
    conversationTyping.hidden = true;
    conversationChoices.querySelectorAll(".is-corrupted").forEach((button) => button.classList.remove("is-corrupted"));
    document.body.classList.remove("interface-fault");
  }

  function getConversationData() {
    const firstReply = state.conversationReplies[1] || "我会记得你。";
    const chapters = {
      1: {
        kicker: "第一愿 · 送达之后",
        title: "访客 202",
        status: "刚刚收到愿签",
        intro: [
          { speaker: "202", text: "你好。愿册说，是你替我决定了愿望的去处。" },
          { speaker: "202", text: "这里平时只有系统回执。我没想到真的可以和你说话。" },
          { speaker: "202", text: "你做那个选择的时候，有认真想过我吗？" },
        ],
        choices: [
          { label: "有。我希望它能实现。", reply: "谢谢。那我愿意再等一阵。至少现在有人知道这件事。" },
          { label: "我只是按照规则选择。", reply: "这样啊……没关系。这里大部分人可能也是随手一点。" },
          { label: "你为什么能直接联系我？", reply: "我不知道。你的名字刚才出现在回执下面，我点了一下，它就打开了。" },
        ],
        followUp: {
          prompt: { speaker: "202", text: "那你为什么来这里？你也有一件很想实现的事吗？" },
          choices: [
            { label: "有，但我不想告诉陌生人。", reply: "应该的。愿望一旦被别人知道，好像就不完全属于自己了。" },
            { label: "我已经把它写进愿册了。", reply: "那我们一样。只是现在，我已经看不见自己当初写了什么。" },
            { label: "我只是随便试试。", reply: "我最开始也是。这里看起来太像一个普通网页了。" },
          ],
        },
        outro: [
          { speaker: "202", text: "我要先走了。鹤说，不能和引导员聊太久。" },
          { speaker: "202", text: "如果之后又看见编号202，可以再回我一句吗？" },
        ],
        button: "查看第二愿",
      },
      2: {
        kicker: "回执匣 · 临时会话",
        title: "访客 071",
        status: "连接不稳定",
        intro: [
          { speaker: "071", text: "抱歉，我本来不想打扰你。" },
          { speaker: "071", text: "我刚收到姐姐那张愿签的回执，可回执上写的提交编号是202。" },
          { speaker: "071", text: "但我是071。我从来没有用过202这个编号。" },
          { speaker: "071", text: `202还把你说过的话发给了我：“${firstReply}”` },
        ],
        choices: [
          { label: "可能只是编号写错了。", reply: "我也希望是。可愿册刚才又把我的名字改回了202，然后才变回来。" },
          { label: "你和202认识吗？", reply: "不认识。但他知道我姐姐明天面试，也知道你刚才选了什么。" },
          { label: "先不要再点任何东西。", reply: "好。可页面下面已经出现了“继续助愿”，我关不掉。" },
        ],
        followUp: {
          prompt: { speaker: "071", text: "如果下一次编号又变了，你还能认出我吗？" },
          choices: [
            { label: "我会记住姐姐面试这件事。", reply: "好。编号可以重复，但这件事只有我和你说过。" },
            { label: "你先告诉我真正的名字。", reply: "输入框不让我发。每次打出名字，发送以后都会变成071。" },
            { label: "我不能保证。", reply: "没关系。至少你现在知道071后面不是一条系统消息。" },
          ],
        },
        outro: [
          { speaker: "071", text: "刚才还有第三个人显示正在输入。" },
          { speaker: "071", text: "他的编号也是202。" },
        ],
        button: "继续助愿",
      },
      3: {
        kicker: "第三愿 · 未归档回话",
        title: "访客 202",
        status: "对方正在等待",
        intro: [
          { speaker: "202", text: `${state.playerName || "你"}，你还记得第一封回话吗？` },
          { speaker: "202", text: `你当时回复我：“${firstReply}”` },
          { speaker: "202", text: "但在你回复以前，我已经读过这句话了。" },
          { speaker: "202", text: "不是猜到。是一模一样，连标点都一样。" },
        ],
        choices: [
          { label: "你到底是谁？", reply: "我不知道了。每完成一轮，愿册就从我这里拿走一点，只留下编号。" },
          { label: "我记得你。", reply: "那就继续记着。只要还有一个人记得，我就不一定只能叫202。" },
          { label: "我要退出这个网页。", reply: "可以试试。我试过。重新打开以后，它从我关掉的那句话继续。" },
        ],
        followUp: {
          prompt: { speaker: "202", text: "如果愿册让你在三份记录里选一份留下，你会根据什么判断谁是真的？" },
          choices: [
            { label: "谁记得更多，谁就是真的。", reply: "愿册最擅长复制记忆。记得最多的，也可能只是被写得最完整。" },
            { label: "谁最害怕消失，谁就是真的。", reply: "那我们三个都会很像真的。" },
            { label: "我不会替你们决定真假。", reply: "愿册会把这句话也算作一种决定。它从不接受空白。" },
          ],
        },
        outro: [
          { speaker: "202", text: "下一次收到三封同时抵达的回执时，先别拆。" },
          { speaker: "202", text: "那不是三个人。" },
        ],
        button: "查看第四愿",
      },
      4: {
        kicker: "第四愿 · 临时群话",
        title: "202 / 071 / 314",
        status: "三人在线",
        intro: [
          { speaker: "071", text: "系统把我们放进了同一页。你能看见这句话吗？" },
          { speaker: "314", text: "我的名字刚刚变成202了。改不回来。" },
          { speaker: "202", text: "别打开接下来那三封回执。它会让你从我们之中选一个是真的。" },
          { speaker: "071", text: "我不认识他。可我记得他第一轮被你怎样处理。" },
        ],
        choices: [
          { label: "我会先看清楚再决定。", reply: "202：你以为自己在看记录，其实记录也在决定你应该看见谁。" },
          { label: "为什么你们都叫202？", reply: "314：因为202是留下来的人。我们的名字正在被它擦掉。" },
          { label: "我不会打开回执。", reply: "071：它不会把“拒绝”当成退出。它会把拒绝记成第四种选择。" },
        ],
        followUp: {
          prompt: { speaker: "314", text: "如果我们马上都变成202，你还能说出刚才是谁先开口吗？" },
          choices: [
            { label: "071先开口。", reply: "071：对。先记住顺序。它复制内容的时候，经常忘记复制顺序。" },
            { label: "314先开口。", reply: "314：不是我。但至少这个错误是你自己的，不是愿册替你写的。" },
            { label: "我需要再看一遍。", reply: "202：页面不会让你往回看。它只让你继续。" },
          ],
        },
        outro: [
          { speaker: "系统", text: "访客202已离线。" },
          { speaker: "系统", text: "访客071已更名为202。" },
          { speaker: "系统", text: "访客314已更名为202。" },
        ],
        button: "查看同时抵达的回执",
      },
      5: {
        kicker: "核验结束 · 引导员私话",
        title: "鹤我这豹脾气",
        status: "引导中",
        intro: [
          { speaker: "鹤", text: "核验结束。多出的第十三张，确实是你写下的愿望。" },
          { speaker: "鹤", text: "别再听202说话。他的记录已经坏了，什么都可能被他说成真的。" },
          { speaker: "鹤", text: "你只差四轮。处理完，你的愿望就会被送达。" },
        ],
        choices: [
          { label: "为什么第十三张写着我的名字？", reply: "鹤：因为愿册要确认许愿者仍愿意承担自己的选择。只是一次核验。" },
          { label: "202究竟是谁？", reply: "鹤：上一位没有完成流程的人。停得太久，名字就只剩编号。" },
          { label: "我现在就要退出。", reply: "鹤：当然可以。只是你写下的愿望会留在这里，由下一位替你处理。" },
        ],
        followUp: {
          prompt: { speaker: "鹤", text: "我需要你亲口确认：你愿意继续完成剩下四愿吗？" },
          choices: [
            { label: "我继续，但你要解释清楚。", reply: "鹤：等你的愿望送达，我会把能说的都告诉你。" },
            { label: "我只想拿回自己的愿望。", reply: "鹤：那就更应该继续。停在这里，它会永远留在第十三张。" },
            { label: "我拒绝确认。", reply: "鹤：愿册收到你的拒绝了。它把拒绝登记成“继续但保留异议”。" },
          ],
        },
        outro: [
          { speaker: "鹤", text: "完成第八愿，愿册会放你离开。" },
          { speaker: "鹤", text: "这是规则。我没有骗你。" },
        ],
        button: "处理第十三张",
      },
      6: {
        kicker: "第五愿 · 被删除的来信",
        title: "访客 202",
        status: "仅剩一次回复",
        intro: [
          { speaker: "202", text: "先把关系说清楚：鹤不是系统，也不是神。他和你一样，曾经是来这里许愿的玩家。" },
          { speaker: "202", text: "完成全部助愿流程的人，会被登记为下一任引导员；只有再带一名新人走完流程，才可能把这个位置交出去。" },
          { speaker: "202", text: "所以你不是普通的助愿者。你是鹤选中的下一位接班人。你的愿望只是把你留到最后的理由。" },
          { speaker: "202", text: "我则是上一轮没有完成的人。愿册删掉了我的姓名，只留下编号202，又把我当时的不同选择拆成了多份记录。" },
          { speaker: "202", text: `你刚才选择了“${actionLabels[state.roundHistory.find((entry) => entry.round === 5)?.assignments?.[1]] || "留下"}”。这一次，代价也写着你的名字。` },
          { speaker: "202", text: "我想起一点了。我以前不叫202。我的名字里，有一个“舟”字。" },
        ],
        choices: [
          { label: "我会记住“舟”。", reply: "谢谢。愿册可以删掉姓名，但它不能证明从来没有人记得过。" },
          { label: "鹤说你已经坏了。", reply: "他没有说错。我被它改写过很多次。但坏掉的记录，也可能记得真事。" },
          { label: "怎样才能结束这一切？", reply: "先让鹤以为你会完成流程。到最后一页，我会告诉你愿册漏掉的一条规则。" },
        ],
        followUp: {
          prompt: { speaker: "202", text: "如果我下一次连“舟”也不记得了，你愿意把这个字再告诉我一次吗？" },
          choices: [
            { label: "愿意。", reply: "那我至少还能借你的记忆，多做一会儿原来的那个人。" },
            { label: "我怕你在利用我。", reply: "你应该怕。我也不知道自己被改写过多少次。" },
            { label: "先告诉我这个字属于谁。", reply: "我只记得一个小女孩在纸船上写过它。别的都没有了。" },
          ],
        },
        outro: [
          { speaker: "202", text: "别急着相信我。下一轮，鹤也会来解释。把我们两个人的话都听完。" },
          { speaker: "系统", text: "该回话已从愿册移除。" },
        ],
        button: "继续第六愿",
      },
      7: {
        kicker: "第六愿 · 两份说法",
        title: "鹤 / 202",
        status: "信道发生重叠",
        intro: [
          { speaker: "鹤", text: "引导员负责带下一位玩家完成助愿。你完成以后，愿望会被送达，我也能离开。" },
          { speaker: "202", text: "他说漏了一半：愿册不会让引导员真正离开，只会把职位、记录和未偿的愿一起转给完成者。" },
          { speaker: "鹤", text: "202连自己的名字都不记得。你为什么相信一个损坏的编号？" },
          { speaker: "202", text: "因为我就是没有完成交接的上一位玩家。鹤需要你走到最后，才能把引导员的位置转给你。" },
          { speaker: "202", text: "但旧规则还有一个缺口：只要引导员的全名仍登记在册，最后一次署名就能把他当作愿签处理。" },
        ],
        choices: [
          { label: "鹤，我完成以后会变成什么？", reply: "鹤：你的愿望会进入愿册。至于引导权限，只是维持愿册运转的一项临时职责。" },
          { label: "202，怎样阻止交接？", reply: "202：先走到最后，让系统开放署名；再把注销对象写成鹤的全名，而不是你自己。" },
          { label: "你们两个都在利用我。", reply: "202：是。鹤要你接替他；我要借你的最后一次署名注销他。区别在于，我现在把代价说给你听。" },
        ],
        followUp: {
          prompt: { speaker: "鹤", text: "别听编号说故事。现在选：继续由我引导，还是让一个损坏记录替你带路？" },
          choices: [
            { label: "我继续听鹤的。", reply: "鹤：很好。完成的人才有资格知道全貌。" },
            { label: "让202把规则说完。", reply: "202：最后的选择不是逃跑。你得先让他相信自己赢了。" },
            { label: "我只相信自己看到的记录。", reply: "202：那就记住最后一次署名。那是唯一不会自动改写的地方。" },
          ],
        },
        outro: [
          { speaker: "鹤", text: "不要再回复他。第七愿已经启封。" },
          { speaker: "202", text: "记住，不要对抗倒计时。先照它说的选。" },
          { speaker: "202", text: "真正决定注销对象的，是最后一次落印。" },
        ],
        button: "进入第七愿",
      },
      8: {
        kicker: "第七愿 · 最后一封人话",
        title: "访客 202",
        status: "信号即将中断",
        intro: [
          { speaker: "202", text: "我只能再说一次。愿册马上会把我和另外两份记录合并。" },
          { speaker: "202", text: "最后会出现三个版本的你。按钮看起来可以选择，但它一次也不会真正听你的。" },
          { speaker: "202", text: "它会换一种说法，再换一种说法，直到把你的沉默也记成答案。不要相信题目变了。" },
          { speaker: "202", text: "在那之前，第八愿会让你处理鹤留下的三句交接声明。那里出现的“拒签”不是逃跑。" },
          { speaker: "202", text: "引导员不能把交接页留空。你拒签，他就必须亲自代填；一旦代填，他的完整姓名会作为操作者写进愿册。" },
          { speaker: "202", text: "鹤会以为你已经服从。确认按钮出现时，愿册会短暂开放最后一次署名。" },
          { speaker: "202", text: "那时不要写你的名字。把注销对象改成——鹤我这豹脾气。" },
        ],
        choices: [
          { label: "成功以后，你会回来吗？", reply: "不会。被删掉的记录不会回来。但至少下一位不会先听见他的声音。" },
          { label: "如果你又在骗我呢？", reply: "那你最后失去的，和照鹤说的做完全一样。你只能决定要不要让他也付一次代价。" },
          { label: "我记住了。", reply: "那就别再回复。让他以为这封信没有送达。" },
        ],
        followUp: {
          prompt: { speaker: "202", text: "在信号断掉以前，你还想问我什么？" },
          choices: [
            { label: "你最初许了什么愿？", reply: "想不起来。只记得愿望里有一句：希望她平安长大。" },
            { label: "鹤最初许了什么愿？", reply: "他说过一次。他希望永远有人记得这个名字。愿册确实替他实现了。" },
            { label: "下一位还能被救下来吗？", reply: "只要愿册还在，就总会需要一个引导员。你能做的，是别让他毫无准备。" },
          ],
        },
        outro: [
          { speaker: "202", text: "还有一件事。舟不是我的名字。是我女儿名字里的一个字。" },
          { speaker: "202", text: "我连自己叫什么，都想不起来了。" },
          { speaker: "202", text: "第八愿如果出现“拒签”，按下它。不是为了退出，是为了逼鹤留下名字。" },
          { speaker: "系统", text: "访客202已并入愿册。" },
        ],
        button: "完成第八愿",
      },
      9: {
        kicker: "终愿 · 注销执行",
        title: "愿册 / 鹤",
        status: "双方正在争夺最后署名",
        intro: [
          { speaker: "系统", text: "已收到最后一次署名：鹤我这豹脾气。" },
          { speaker: "系统", text: "当前引导员与注销对象一致。正在依据旧规则复核。" },
          { speaker: "鹤", text: "撤回。刚才的落印不算。你没有权限改我的名字。" },
          { speaker: "系统", text: "旧规则：完成八愿者，可以处理一份登记在册的完整姓名。" },
          { speaker: "鹤", text: `${state.playerName || "你"}，先别确认。你想要的愿望还在我这里；删掉我，它也会一起消失。` },
          { speaker: "系统", text: "检测到引导员正在修改愿望归属。最终操作暂缓执行。" },
        ],
        choices: [
          { label: "先锁定最后署名，禁止改写。", reply: "系统：最后署名已锁定。修改请求来源：当前引导员。" },
          { label: "把我的原愿显示出来。", reply: `系统：原愿“${state.playerWish || "未读取"}”。当前持有者：愿册，并非引导员。` },
          { label: "202说，引导员也能被当作愿签处理。", reply: "鹤：愿册里从来没有202。你正在相信一段损坏的缓存。" },
        ],
        followUp: {
          prompt: { speaker: "鹤", text: "听我说。把注销对象改成202，我会把你的愿望原样送出去，也会把你的名字从这里删掉。" },
          choices: [
            { label: "先证明你能删除我的名字。", reply: "系统：引导员无权删除已完成八愿者的署名。" },
            { label: "为什么非要改成202？", reply: "系统：若注销对象改为202，当前引导员将继续保留权限。" },
            { label: "拒绝修改。", reply: "鹤：你以为坚持一次，就能赢过写下所有规则的人？" },
          ],
          next: {
            prompt: { speaker: "鹤", text: "这里不能没有引导员。你注销我，愿册就会把这个位置给你。到时候，你会比202忘得更快。" },
            choices: [
              { label: "那是愿册的威胁，不是你的筹码。", reply: "系统：检测到引导员借用系统名义发送未经授权的提示。" },
              { label: "把引导员交接规则全文展开。", reply: "系统：交接须由完成者主动确认。当前确认记录：无。" },
              { label: "就算如此，也先结束你这一轮。", reply: "鹤：……我当初也以为，只要先结束上一位就够了。" },
            ],
            next: {
              prompt: { speaker: "系统", text: "指令冲突：玩家最后署名与引导员撤回请求同时存在。请选择保留依据。" },
              choices: [
                { label: "保留我的最后署名。", reply: "系统：玩家署名时间较晚，优先级成立。" },
                { label: "锁定鹤的操作权限。", reply: "系统：当前引导员已失去修改与撤回权限。" },
                { label: "执行旧规则：完整姓名可被处理。", reply: "系统：旧规则复核通过。注销请求不可撤销。" },
              ],
            },
          },
        },
        outro: [
          { speaker: "系统", text: "引导权限已撤销。愿望持有权已从鹤处剥离。" },
          { speaker: "鹤", text: "等等。至少把我的愿望留下。你还不知道我最初为什么来这里。" },
          { speaker: "系统", text: "原愿读取：希望永远有人记得这个名字。该愿已实现，不再构成停留凭据。" },
          { speaker: "鹤", text: "别按。你按下以后，他们会用你的名字叫下一位。" },
          { speaker: "系统", text: "最终署名确认。撤回窗口已关闭。" },
          { speaker: "系统", text: "鹤我这豹脾气已注销。" },
          { speaker: "202", text: "……我听见他的声音停了。谢谢。" },
        ],
        button: "结束本次任务",
      },
    };
    return chapters[state.conversationChapter];
  }

  function appendConversationMessage(message, own = false) {
    const item = document.createElement("div");
    item.className = `conversation-message${own ? " is-own" : message.speaker === "系统" ? " is-system" : ""}`;
    const speaker = document.createElement("b");
    const copy = document.createElement("p");
    speaker.textContent = own ? state.playerName || "你" : message.speaker;
    copy.textContent = message.text;
    item.append(speaker, copy);
    conversationLog.append(item);
    conversationLog.scrollTop = conversationLog.scrollHeight;
  }

  function scheduleConversationAnomaly(buttons, followUp = false) {
    const chapter = state.conversationChapter;
    if (chapter < 2 || !buttons.length) return;
    const replacements = {
      2: "编号没有写错。",
      3: "你已经退出过一次。",
      4: followUp ? "你刚才选过另一句。" : "三个人里没有071。",
      5: "你已确认继续。",
      6: "这个字不属于舟。",
      7: "他正在替你读这一句。",
      8: "拒绝也会被提交。",
      9: "这不是你写的回复。",
    };
    const replacement = replacements[chapter] || "这句话已经替你发送。";
    const index = (chapter + (followUp ? 1 : 0)) % buttons.length;
    const target = buttons[index];
    const original = target.textContent;
    const delay = state.reduceMotion ? 220 : 1050 + (chapter % 3) * 420;
    const timer = window.setTimeout(() => {
      if (state.scene !== "conversation" || conversationChoices.hidden || !target.isConnected) return;
      target.textContent = replacement;
      target.classList.add("is-corrupted");
      document.body.classList.add("interface-fault");
      playAssetSfx("message", 0.22);
      const restore = window.setTimeout(() => {
        target.textContent = original;
        target.classList.remove("is-corrupted");
        document.body.classList.remove("interface-fault");
      }, state.reduceMotion ? 90 : chapter >= 6 ? 680 : 360);
      conversationTimers.push(restore);
    }, delay);
    conversationTimers.push(timer);
  }

  function queueConversationMessages(messages, onDone) {
    let index = 0;
    const next = () => {
      if (index >= messages.length) {
        conversationTyping.hidden = true;
        onDone?.();
        return;
      }
      conversationTyping.hidden = false;
      const timer = window.setTimeout(() => {
        conversationTyping.hidden = true;
        appendConversationMessage(messages[index]);
        index += 1;
        const pause = window.setTimeout(next, state.reduceMotion ? 30 : 520);
        conversationTimers.push(pause);
      }, state.reduceMotion ? 20 : 620);
      conversationTimers.push(timer);
    };
    next();
  }

  function parseConversationReply(data, copy) {
    const taggedReply = /^([^：]{1,8})：(.*)$/.exec(copy);
    return {
      speaker: taggedReply?.[1]
        || (data.title === "鹤我这豹脾气" ? "鹤" : data.title.match(/\d{3}/)?.[0] || "202"),
      text: taggedReply?.[2] || copy,
    };
  }

  function finishConversation(data, response) {
    queueConversationMessages([response, ...data.outro], () => {
      conversationContinue.hidden = false;
      setStatus("对话结束，可以继续。");
    });
  }

  function showConversationFollowUp(data, followUp = data.followUp, depth = 0) {
    conversationChoices.innerHTML = "";
    followUp.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        conversationChoices.hidden = true;
        state.conversationReplies[`${state.conversationChapter}-followup-${depth}`] = choice.label;
        appendConversationMessage({ speaker: state.playerName, text: choice.label }, true);
        const response = parseConversationReply(data, choice.reply);
        if (followUp.next) {
          queueConversationMessages([response, followUp.next.prompt], () => {
            showConversationFollowUp(data, followUp.next, depth + 1);
          });
          return;
        }
        finishConversation(data, response);
      }, { once: true });
      conversationChoices.append(button);
    });
    conversationChoices.hidden = false;
    scheduleConversationAnomaly([...conversationChoices.children], true);
  }

  function showConversationChoices(data) {
    conversationChoices.innerHTML = "";
    data.choices.forEach((choice) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = choice.label;
      button.addEventListener("click", () => {
        conversationChoices.hidden = true;
        state.conversationReplies[state.conversationChapter] = choice.label;
        appendConversationMessage({ speaker: state.playerName, text: choice.label }, true);
        const response = parseConversationReply(data, choice.reply);
        if (!data.followUp) {
          finishConversation(data, response);
          return;
        }
        queueConversationMessages([response, data.followUp.prompt], () => showConversationFollowUp(data));
      }, { once: true });
      conversationChoices.append(button);
    });
    conversationChoices.hidden = false;
    scheduleConversationAnomaly([...conversationChoices.children]);
  }

  function prepareConversationScene() {
    clearConversationTimers();
    const data = getConversationData();
    if (!data) return;
    conversationKicker.textContent = data.kicker;
    conversationTitle.textContent = data.title;
    conversationStatus.innerHTML = `<i></i> ${data.status}`;
    conversationLog.innerHTML = "";
    conversationChoices.innerHTML = "";
    conversationChoices.hidden = true;
    conversationContinue.hidden = true;
    conversationContinue.querySelector("span").textContent = data.button;
    queueConversationMessages(data.intro, () => showConversationChoices(data));
  }

  function getRecordedAction(round, index) {
    return state.roundHistory.find((entry) => entry.round === round)?.assignments?.[index] || "keep";
  }

  function getEchoData() {
    if (state.echoVisit === 1) {
      const actions = [0, 1, 2].map((index) => actionLabels[getRecordedAction(2, index)]);
      return {
        kicker: "回执匣 · 初次送达",
        title: "有人回话",
        instruction: "愿签送达以后，提交者偶尔会留下一句话。请逐封拆开。",
        senders: ["访客 202", "访客 071", "访客 314"],
        messages: [
          `我看到结果了。你替我选的是“${actions[0]}”。谢谢你认真读完。`,
          `姐姐说不管明天怎样，她都会回来。你替她选了“${actions[1]}”。`,
          "公交赶上了。司机叫了三次“071”，有三个人同时回头。",
        ],
        stamps: ["今晚 21:14", "今晚 21:16", "今晚 21:17"],
        result: "三封回执已收齐。看起来，这只是一场普通的助愿。",
        button: "继续助愿",
      };
    }
    const actions = [0, 1, 2].map((index) => actionLabels[getRecordedAction(index + 1, index)]);
    return {
      kicker: "回执匣 · 再次送达",
      title: "三封同时抵达",
      instruction: "回执来自不同愿签。愿册要求你确认它们都已读过。",
      senders: ["访客 202", "访客 202", "访客 202"],
      messages: [
        `我记得第一愿。那时你选择了“${actions[0]}”。`,
        `我也记得第二愿。那时你选择了“${actions[1]}”。`,
        "我记得第三愿，也记得你还没有处理自己的愿望。",
      ],
      stamps: ["03:17", "03:17", "03:17"],
      result: "三封回执：编号相同，提交时间相同，记忆彼此矛盾。愿册请求核对。",
      button: "核对愿册",
    };
  }

  function prepareEchoScene() {
    const data = getEchoData();
    state.echoOpened = [false, false, false];
    echoKicker.textContent = data.kicker;
    echoTitle.textContent = data.title;
    echoInstruction.textContent = data.instruction;
    echoResult.textContent = "任选一封开始。";
    echoResult.classList.remove("is-warning");
    echoContinue.hidden = true;
    echoContinue.querySelector("span").textContent = data.button;
    echoEnvelopes.forEach((button, index) => {
      button.disabled = false;
      button.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      button.querySelector("b").textContent = "未拆";
      button.querySelector("strong").textContent = data.messages[index];
      button.querySelector("small").textContent = `${data.senders[index]} · ${data.stamps[index]}`;
    });
  }

  function buildRoundSummary() {
    const story = getCurrentRoundStory();
    roundSummary.innerHTML = "";
    roundOneCards.forEach((card, index) => {
      const row = document.createElement("p");
      const wish = document.createElement("span");
      const result = document.createElement("strong");
      wish.textContent = story.wishes[index];
      result.textContent = actionLabels[state.roundAssignments[index]];
      row.append(wish, result);
      roundSummary.append(row);
    });

    document.querySelector("#round-complete-kicker").textContent = `第${roundNumerals[state.currentRound]}愿 · 已入册`;
    document.querySelector("#round-feedback").textContent = getRoundFeedback();
    document.querySelector("#round-boss-line").innerHTML = state.currentRound === 8 && state.roundRefused
      ? "拒签不等于退出。<br />空白只能由当前引导员代填。"
      : story.boss;
    document.querySelector("#next-round-label").textContent =
      state.currentRound < 8 ? `第${roundNumerals[state.currentRound + 1]}愿正在启封` : "你的愿望已送达";
    nextRoundButton.querySelector("span").textContent = state.currentRound < 8 ? "继续" : "查看结果";
  }

  function resetRoundSelection() {
    state.roundSelected = state.currentRound === 1 ? 0 : -1;
    state.roundAssignments = [null, null, null];
    state.roundRefused = false;
    if (state.currentRound === 1) state.tutorialStep = 0;
  }

  function renderBackendRound() {
    const story = backendStories[state.backendRound];
    document.querySelector("#backend-kicker").textContent = story.kicker;
    document.querySelector("#backend-title").innerHTML = story.title;
    document.querySelector("#backend-instruction").textContent = story.instruction;
    document.querySelector("#backend-result").textContent = "";
    backendNext.hidden = true;
    backendReselect.hidden = true;
    backendOptions.innerHTML = "";
    state.backendChoice = null;

    story.options.forEach((rawOption, index) => {
      const option = rawOption === "__PLAYER__ · 正在操作"
        ? `${state.playerName} · 正在操作`
        : rawOption === "__PLAYER_WISH__"
          ? state.playerWish
          : rawOption;
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<span>${roundNumerals[index + 1]}</span><strong></strong>`;
      button.querySelector("strong").textContent = option;
      button.addEventListener("click", () => {
        if (state.backendChoice !== null) return;
        state.backendChoice = index;
        [...backendOptions.children].forEach((item, itemIndex) => {
          item.disabled = true;
          item.classList.toggle("is-chosen", itemIndex === index);
        });
        document.querySelector("#backend-result").textContent = story.result;
        backendNext.hidden = false;
        backendReselect.hidden = false;
        if (!playAssetSfx(state.backendRound === 10 ? "message" : "branchDelete", 0.62)) playPaperSound();
      });
      backendOptions.append(button);
    });
  }

  function clearEndingTimers() {
    if (finalCountdownTimer) window.clearInterval(finalCountdownTimer);
    if (finalAutoConfirmTimer) window.clearTimeout(finalAutoConfirmTimer);
    if (deletionRevealTimer) window.clearTimeout(deletionRevealTimer);
    if (peaceTimer) window.clearTimeout(peaceTimer);
    if (reflectionHookTimer) window.clearTimeout(reflectionHookTimer);
    if (textTerrorTimer) window.clearTimeout(textTerrorTimer);
    if (finalMutationTimer) window.clearTimeout(finalMutationTimer);
    finalCountdownTimer = null;
    finalAutoConfirmTimer = null;
    deletionRevealTimer = null;
    peaceTimer = null;
    reflectionHookTimer = null;
    textTerrorTimer = null;
    finalMutationTimer = null;
    textTerror?.classList.remove("is-visible");
    selfChoiceButtons.forEach((button) => button.classList.remove("is-corrupted"));
    document.body.classList.remove("interface-fault", "choice-corruption");
    clearPressureState();
  }

  function startFalsePeaceSequence() {
    if (peaceTimer) window.clearTimeout(peaceTimer);
    falsePeaceStage = 0;
    document.body.classList.remove("operator-reading");
    const kicker = document.querySelector("#false-peace-kicker");
    const title = document.querySelector("#false-peace-title");
    const wish = document.querySelector("#peace-wish");
    const peaceStatus = document.querySelector("#false-peace-status");
    const systemWish = "希望下一位替我继续祈愿";
    kicker.textContent = "愿册校验";
    title.textContent = "任务已完成";
    wish.textContent = `“${state.playerWish}”`;
    wish.classList.remove("is-rewriting");
    peaceStatus.classList.remove("is-count-anomaly");
    peaceStatus.innerHTML = "<span></span> 鹤我这豹脾气 · 已注销";
    viewOperator.hidden = true;
    viewOperator.disabled = true;
    viewOperator.querySelector("span").textContent = "返回愿册";

    const rewriteWish = () => {
      title.textContent = "你的愿望即将实现";
      peaceStatus.innerHTML = "<span></span> 正在校正愿望表述……";
      wish.classList.add("is-rewriting");
      const current = [...(state.playerWish || "未填写")];
      const target = [...systemWish];
      const operations = [];
      const sharedLength = Math.min(current.length, target.length);
      for (let index = 0; index < sharedLength; index += 1) {
        if (current[index] !== target[index]) operations.push(() => { current[index] = target[index]; });
      }
      for (let index = current.length - 1; index >= target.length; index -= 1) {
        operations.push(() => { current.splice(index, 1); });
      }
      for (let index = current.length; index < target.length; index += 1) {
        operations.push(() => { current.push(target[index]); });
      }

      let operationIndex = 0;
      const applyNextCharacter = () => {
        operations[operationIndex]?.();
        wish.textContent = `“${current.join("")}”`;
        if (operationIndex % 4 === 0) {
          playAssetSfx("message", 0.18);
          vibrate(18, "story");
        }
        operationIndex += 1;
        if (operationIndex < operations.length) {
          peaceTimer = window.setTimeout(applyNextCharacter, state.reduceMotion ? 24 : 105);
          return;
        }
        wish.textContent = `“${systemWish}”`;
        wish.classList.remove("is-rewriting");
        kicker.textContent = "愿望送达";
        peaceStatus.innerHTML = "<span></span> 原愿已校正为续祈申请";
        peaceTimer = window.setTimeout(() => {
          viewOperator.hidden = false;
          viewOperator.disabled = false;
          peaceTimer = null;
        }, state.reduceMotion ? 220 : 1500);
      };
      applyNextCharacter();
    };
    peaceTimer = window.setTimeout(rewriteWish, state.reduceMotion ? 450 : 2200);
  }

  function beginPeaceReview() {
    if (peaceTimer) window.clearTimeout(peaceTimer);
    peaceTimer = null;
    falsePeaceStage = 1;
    viewOperator.disabled = true;
    viewOperator.hidden = true;
    document.querySelector("#false-peace-kicker").textContent = "子夜结算";
    document.querySelector("#false-peace-title").textContent = "愿册已闭合";
    document.querySelector("#peace-wish").textContent = "正在整理今夜记录……";
    const steps = [
      "已处理愿签：十二",
      "已注销引导员：一",
      "今夜留愿人数：二十八",
      "祈序未结：一",
    ];
    let index = 0;
    const advance = () => {
      document.querySelector("#false-peace-status").innerHTML = `<span></span> ${steps[index]}`;
      document.querySelector("#false-peace-status").classList.toggle("is-count-anomaly", index === 2);
      if (index === steps.length - 1) {
        document.querySelector("#false-peace-title").textContent = "还有一项记录";
        document.querySelector("#peace-wish").textContent = "记录类型：续祈";
        viewOperator.querySelector("span").textContent = "查看未归档记录";
        viewOperator.hidden = false;
        viewOperator.disabled = false;
        peaceTimer = null;
        return;
      }
      index += 1;
      peaceTimer = window.setTimeout(advance, state.reduceMotion ? 420 : 1650);
    };
    peaceTimer = window.setTimeout(advance, state.reduceMotion ? 400 : 1200);
  }

  function clearAuditSequence() {
    auditTimers.forEach((timer) => window.clearTimeout(timer));
    auditTimers = [];
  }

  function startAuditSequence() {
    clearAuditSequence();
    auditCount.closest(".scene--audit")?.classList.remove("is-count-breach");
    auditCount.textContent = "12";
    auditCount.classList.remove("is-wrong");
    auditUnexpected.hidden = true;
    auditOwner.hidden = true;
    auditSeals.hidden = true;
    auditSeals.classList.remove("is-resolved");
    auditPrompt.hidden = true;
    auditContinue.hidden = true;
    auditContinue.disabled = true;
    auditContinue.setAttribute("aria-hidden", "true");
    auditSealButtons.forEach((button) => {
      button.disabled = false;
      button.classList.remove("is-chosen", "is-dismissed", "is-wrong-pick");
    });

    const schedule = (callback, normalDelay, reducedDelay) => {
      auditTimers.push(window.setTimeout(callback, state.reduceMotion ? reducedDelay : normalDelay));
    };

    schedule(() => {
      auditCount.textContent = "13";
      auditCount.classList.add("is-wrong");
      auditCount.closest(".scene--audit")?.classList.add("is-count-breach");
      playAssetSfx("message", 0.52) || playPaperSound();
      vibrate([35, 90, 35], "pressure");
    }, 1800, 250);
    schedule(() => {
      auditUnexpected.hidden = false;
      auditSeals.hidden = false;
      auditPrompt.hidden = false;
    }, 3400, 500);
  }

  function mutateFinalChoice(phaseIndex, seconds, phase) {
    const scripts = {
      "0-10": { index: 0, title: "原署名已褪色", detail: "与当前笔迹一致" },
      "0-6": { index: 1, title: "此处曾有第四项", detail: "删除时间：尚未发生" },
      "0-3": { index: 2, title: "候补引导员", detail: "状态：已到岗" },
      "1-7": { index: 1, title: state.playerName || "未名", detail: "登记来源：上一页" },
      "1-4": { index: 0, title: "202", detail: "原称谓已归档" },
      "1-2": { index: 2, title: "第二十八位", detail: "等待分配姓名" },
      "2-6": { all: true },
      "2-3": { index: 2, title: "续祈者", detail: "确认已由系统代填" },
    };
    const corruption = scripts[`${phaseIndex}-${seconds}`];
    if (!corruption) return;
    if (finalMutationTimer) window.clearTimeout(finalMutationTimer);
    finalChoicePhase = phaseIndex;
    document.body.classList.add("interface-fault", "choice-corruption");

    if (corruption.all) {
      selfChoiceButtons.forEach((button) => {
        button.querySelector("strong").textContent = state.playerName || "未名";
        button.querySelector("i").textContent = "三项记录，共用同一署名";
        button.classList.add("is-corrupted");
      });
    } else {
      const button = selfChoiceButtons[corruption.index];
      button.querySelector("strong").textContent = corruption.title;
      button.querySelector("i").textContent = corruption.detail;
      button.classList.add("is-corrupted");
    }

    playAssetSfx("message", 0.3);
    finalMutationTimer = window.setTimeout(() => {
      finalMutationTimer = null;
      if (state.scene !== "final-choice" || finalChoicePhase !== phaseIndex || state.finalChoice) return;
      selfChoiceButtons.forEach((button, index) => {
        button.querySelector("strong").textContent = phase.choices[index][0];
        button.querySelector("i").textContent = phase.choices[index][1];
        button.classList.remove("is-corrupted");
      });
      document.body.classList.remove("interface-fault", "choice-corruption");
    }, state.reduceMotion ? 100 : corruption.all ? 920 : 560);
  }

  function setFinalPressureStage(stage, seconds, phaseIndex = 0, phase = null) {
    document.body.classList.remove(
      "pressure-stage-1",
      "pressure-stage-2",
      "pressure-stage-3",
      "pressure-stage-4",
    );
    document.body.classList.add("is-under-pressure", `pressure-stage-${stage}`);
    selfChoiceButtons.forEach((button) => button.classList.toggle("is-pressing", stage >= 3));

    const signalSets = {
      1: ["它也在等待", "它没有移开视线", "它知道按钮在哪里"],
      2: ["它选择保留自己", "它正在判断你", "它向你这边看"],
      3: ["它选择删除你", "它也按下了", "它正在抢先确认"],
      4: ["删除目标：你", "它选择保留自己", "它选择删除你"],
    };
    finalSignals.forEach((signal, index) => {
      signal.textContent = signalSets[stage][index];
    });

    const terrorScripts = [
      {
        7: ["迟疑已记入", 1820, "ink"],
        4: ["第三项先于你确认", 1680, "bone"],
        2: [state.playerName || "未名", 1500, "cyan"],
      },
      {
        7: ["称谓与本人无关", 1760, "bone"],
        4: ["本页仅留一个读者", 1700, "cyan"],
        2: ["记录 202", 1480, "ink"],
      },
      {
        7: ["祝声来自下一页", 1840, "cyan"],
        4: ["第二十八位已入册", 1720, "ink"],
        2: ["此处原有一人", 1580, "vermilion"],
      },
    ];
    const bossLines = [
      ["不必着急。它们会替你先选。", "你的停顿也会被记录。", "别回头看上一行。", "已经记下了。"],
      ["姓名只用于归档。", "它正在采用更合适的称谓。", "旧名字不会影响结果。", "校正完成。"],
      ["你听见的不是回声。", "下一页已经有人在读。", "空位只保留到倒计时结束。", "人数已齐。"],
    ][phaseIndex] || [];
    if (seconds === 10) document.querySelector("#final-boss-line").textContent = `鹤我这豹脾气：${bossLines[0] || "快一点。"}`;
    if (seconds === 7) document.querySelector("#final-boss-line").textContent = `鹤我这豹脾气：${bossLines[1] || "你已经落后一次了。"}`;
    if (seconds === 4) document.querySelector("#final-boss-line").textContent = `鹤我这豹脾气：${bossLines[2] || "它看见你了。"}`;
    if (seconds <= 2) document.querySelector("#final-boss-line").textContent = `鹤我这豹脾气：${bossLines[3] || "现在。"}`;
    const terror = terrorScripts[phaseIndex]?.[seconds];
    if (terror) showTextTerror(...terror);
    if (phase) mutateFinalChoice(phaseIndex, seconds, phase);

    if (stage === 3) setPlayerThought("它们知道我想选谁。");
    if (stage === 4) setPlayerThought("我们都在想：删掉最慢的那个。", true);

    const pressureHaptics = {
      1: [34],
      2: [48, 105, 34],
      3: [62, 68, 62],
      4: [88, 42, 88, 70, 118],
    };
    vibrate(pressureHaptics[stage], "pressure");

  }

  function startFinalChoice() {
    clearEndingTimers();
    state.finalChoice = null;
    state.finalChoiceUnlocked = false;
    document.body.classList.remove("final-selection-made");
    document.body.classList.add("choices-locked");
    const ownWishAction = state.roundHistory.find((entry) => entry.round === 5)?.assignments?.[1];
    const accusation = {
      keep: "你让自己的愿望等到无期。现在，三个你也只能留一个。",
      give: "你把自己的愿望送给了下一位。现在，把一个自己也送出去。",
      tear: "你亲手撕过自己的愿望。现在决定由谁记得这件事。",
    }[ownWishAction] || "你已经学会怎样处理别人的愿望。现在处理自己。";
    const phases = [
      {
        seconds: 13,
        title: "留下一个你",
        threat: "三个版本也在同时选择。<br />最慢的那个，会被另外两个删除。",
        boss: accusation,
        thought: "它们也在选择。慢下来的那个会被删除。",
        choices: [
          ["写下愿望的你", "仍在等待实现"],
          ["看见异常的你", "记得所有删去的分支"],
          ["替别人选择的你", "已经学会如何引导下一位"],
        ],
      },
      {
        seconds: 9,
        title: "留下一种名字",
        threat: "题目已经更换。<br />请选择愿册以后如何称呼你。",
        boss: "不喜欢刚才的问法？那就换一个。",
        thought: "字变了。三个选择还在原来的位置。",
        choices: [
          ["许愿者", "继续等待自己的愿望"],
          ["见证者", "继续记得被删掉的人"],
          ["引导员", "继续替后来的人选择"],
        ],
      },
      {
        seconds: 8,
        title: "留下一种祈",
        threat: "祈不是愿望。<br />祈是让一个人替另一个人继续开口。",
        boss: "名字也不喜欢？最后换一次。",
        thought: "它不是在问答案。它只是在等我承担其中一个名字。",
        choices: [
          ["为自己祈", "愿望仍归你所有"],
          ["替别人祈", "名字将留在愿册"],
          ["让别人替你祈", "下一位会接过你的话"],
        ],
      },
    ];

    selfChoiceButtons.forEach((button) => {
      button.disabled = true;
      button.classList.remove("is-chosen", "is-erased", "is-pressing", "is-last-message");
      button.classList.add("is-locked");
    });
    finalChoiceControls.hidden = true;
    finalConfirm.querySelector("span").textContent = "确认留下";
    syncSceneBgm("final-choice");

    const runPhase = (phaseIndex) => {
      const phase = phases[phaseIndex];
      let seconds = phase.seconds;
      finalChoicePhase = phaseIndex;
      if (finalMutationTimer) window.clearTimeout(finalMutationTimer);
      finalMutationTimer = null;
      document.body.classList.remove("interface-fault", "choice-corruption");
      document.querySelector("#final-choice-title").textContent = phase.title;
      document.querySelector(".final-threat").innerHTML = phase.threat;
      document.querySelector("#final-pressure").textContent = `还有${seconds}秒`;
      document.querySelector("#final-boss-line").textContent = `鹤我这豹脾气：${phase.boss}`;
      setPlayerThought(phase.thought, phaseIndex > 0);
      selfChoiceButtons.forEach((button, index) => {
        button.querySelector("strong").textContent = phase.choices[index][0];
        button.querySelector("i").textContent = phase.choices[index][1];
        button.classList.remove("is-pressing");
      });
      const phaseEntrances = [
        ["请核对当前署名", 1180, "vermilion"],
        ["称谓已自动校正", 1450, "bone"],
        ["本页不接受空白", 1520, "ink"],
      ];
      showTextTerror(...phaseEntrances[phaseIndex]);
      setFinalPressureStage(1, seconds, phaseIndex, phase);

      finalCountdownTimer = window.setInterval(() => {
        seconds -= 1;
        document.querySelector("#final-pressure").textContent = `还有${Math.max(seconds, 0)}秒`;
        const ratio = seconds / phase.seconds;
        const stage = ratio > 0.72 ? 1 : ratio > 0.46 ? 2 : ratio > 0.2 ? 3 : 4;
        setFinalPressureStage(stage, seconds, phaseIndex, phase);
        if (seconds > 0) return;
        window.clearInterval(finalCountdownTimer);
        finalCountdownTimer = null;
        selfChoiceButtons.forEach((button) => button.classList.remove("is-pressing"));
        document.querySelector("#final-pressure").textContent = "……";
        setPlayerThought(phaseIndex < phases.length - 1 ? "还是没有选择。" : "为什么不选？", true);
        thoughtPrefix.textContent = "鹤我这豹脾气 ·";

        if (phaseIndex < phases.length - 1) {
          finalAutoConfirmTimer = window.setTimeout(() => {
            finalAutoConfirmTimer = null;
            runPhase(phaseIndex + 1);
          }, state.reduceMotion ? 450 : 1700);
          return;
        }

        finalAutoConfirmTimer = window.setTimeout(() => {
          thoughtText.textContent = "选择一直都在。能选的从来不是你。";
          finalAutoConfirmTimer = window.setTimeout(() => {
            thoughtText.textContent = "算了，我替你选。";
            finalAutoConfirmTimer = window.setTimeout(() => {
              finalAutoConfirmTimer = null;
              chooseFinalSelf("guide", true);
            }, state.reduceMotion ? 450 : 1200);
          }, state.reduceMotion ? 550 : 1900);
        }, state.reduceMotion ? 650 : 1800);
      }, 1000);
    };

    runPhase(0);
  }

  function chooseFinalSelf(choice, autoConfirm = false) {
    if (state.finalChoice) return;
    if (!state.finalChoiceUnlocked && !autoConfirm) return;
    state.finalChoice = choice;
    if (finalCountdownTimer) window.clearInterval(finalCountdownTimer);
    finalCountdownTimer = null;
    stopPressureAudio();
    vibrate(0);
    document.body.classList.remove(
      "is-under-pressure",
      "choices-locked",
      "pressure-stage-1",
      "pressure-stage-2",
      "pressure-stage-3",
      "pressure-stage-4",
    );
    document.body.classList.add("pressure-silence");
    document.body.classList.add("final-selection-made");
    selfChoiceButtons.forEach((button) => {
      button.disabled = true;
      button.classList.remove("is-locked");
      button.classList.toggle("is-chosen", button.dataset.selfChoice === choice);
      button.classList.toggle("is-erased", button.dataset.selfChoice !== choice);
      button.classList.remove("is-pressing");
    });
    const erasedButtons = selfChoiceButtons.filter((button) => button.dataset.selfChoice !== choice);
    erasedButtons[0]?.classList.add("is-last-message");
    finalSignals.forEach((signal, index) => {
      signal.textContent = selfChoiceButtons[index].dataset.selfChoice === choice ? "你选择留下它" : index === selfChoiceButtons.indexOf(erasedButtons[0]) ? "我也按下了" : "连接中断";
    });
    document.querySelector("#final-pressure").textContent = "……";
    document.querySelector("#final-boss-line").textContent = "";
    setPlayerThought("最后一声停了。什么都听不见。");
    finalChoiceControls.hidden = true;

    deletionRevealTimer = window.setTimeout(() => {
      deletionRevealTimer = null;
      document.body.classList.remove("pressure-silence");
      document.querySelector("#final-pressure").textContent = "删除完成。";
      document.querySelector("#final-boss-line").textContent = autoConfirm
        ? "鹤我这豹脾气：太慢了。我替你留下这个。"
        : "鹤我这豹脾气：可以重选。确认以后，就不能了。";
      finalConfirm.querySelector("span").textContent = "以鹤之名落印";
      setPlayerThought("202说，真正决定注销对象的，是最后一次落印。");
      finalChoiceControls.hidden = false;
      if (autoConfirm) {
        finalReselect.hidden = true;
      } else {
        finalReselect.hidden = false;
      }
    }, state.reduceMotion ? 1200 : 2000);
  }

  function confirmFinalSelf() {
    if (!state.finalChoice || finalChoiceControls.hidden) return;
    if (finalAutoConfirmTimer) window.clearTimeout(finalAutoConfirmTimer);
    finalAutoConfirmTimer = null;
    playAssetSfx("cut", 0.72);
    finalChoiceControls.hidden = true;
    document.querySelector("#final-boss-line").textContent = "鹤我这豹脾气：等等。确认栏里为什么是我的名字？";
    setPlayerThought("最后一次署名已经送出。注销对象不是我。");
    vibrate([90, 40, 120, 40, 180], "seal");
    window.setTimeout(() => showTextTerror("注销对象\n鹤我这豹脾气", 2100), state.reduceMotion ? 120 : 420);
    window.setTimeout(() => {
      state.conversationChapter = 9;
      showScene("conversation");
    }, state.reduceMotion ? 700 : 2900);
  }

  function resetHold() {
    if (holdFrame) cancelAnimationFrame(holdFrame);
    holdFrame = null;
    holdPointerId = null;
    sealButton.classList.remove("is-holding");
    sealButton.style.setProperty("--hold-progress", "0");
    if (!state.sealed) vibrate(0);
  }

  function finishSeal() {
    if (state.sealed) return;
    state.sealed = true;
    if (holdFrame) cancelAnimationFrame(holdFrame);
    holdFrame = null;
    sealButton.classList.remove("is-holding");
    sealButton.classList.add("is-complete");
    sealButton.style.setProperty("--hold-progress", "1");
    incantationScene.classList.add("seal-shock");
    stopWishChant();
    vibrate([180, 60, 600], "seal");
    playAssetSfx("seal", 0.74);

    document.body.classList.remove("is-word-shifting", "is-ink-gathering");
    knockFlash.classList.remove("is-visible");
    setStatus("落印完成。记名已成。");

    window.setTimeout(() => {
      showScene("registered");
    }, state.reduceMotion ? 80 : 420);
  }

  function advanceHold(now) {
    const progress = Math.min((now - holdStart) / holdDuration, 1);
    sealButton.style.setProperty("--hold-progress", progress.toFixed(3));
    if (progress >= 1) {
      finishSeal();
      return;
    }
    holdFrame = requestAnimationFrame(advanceHold);
  }

  function startHold(pointerId = null) {
    if (state.sealed || holdFrame) return;
    warmAudio();
    holdPointerId = pointerId;
    holdStart = performance.now();
    sealButton.classList.add("is-holding");
    vibrate([28, Math.max(0, holdDuration - 28), 180, 60, 600], "seal");
    holdFrame = requestAnimationFrame(advanceHold);
  }

  document.addEventListener("click", (event) => {
    const nextButton = event.target.closest("[data-next]");
    if (!nextButton) return;
    warmAudio();
    if (nextButton === coverEnter && state.afterVictoryReturn) {
      state.afterVictoryReturn = false;
      state.returnCountAnimated = false;
      showScene("false-peace");
      beginPeaceReview();
      return;
    }
    showScene(nextButton.dataset.next, nextButton.dataset.next === "name" ? "input" : undefined);
  });

  pactRules.forEach((rule, index) => {
    rule.addEventListener("click", () => openPactRule(index));
  });

  nameForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validateName()) showScene("wish", "textarea");
  });

  wishForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validateWish()) showScene("incantation", "#seal-button");
  });

  wishInput.addEventListener("input", updateWishCount);

  sealButton.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    sealButton.setPointerCapture?.(event.pointerId);
    startHold(event.pointerId);
  });

  sealButton.addEventListener("pointerup", (event) => {
    if (event.pointerId === holdPointerId && !state.sealed) resetHold();
  });

  sealButton.addEventListener("pointercancel", resetHold);
  sealButton.addEventListener("lostpointercapture", () => {
    if (!state.sealed) resetHold();
  });

  sealButton.addEventListener("keydown", (event) => {
    if ((event.key === " " || event.key === "Enter") && !event.repeat) {
      event.preventDefault();
      startHold();
    }
  });

  sealButton.addEventListener("keyup", (event) => {
    if ((event.key === " " || event.key === "Enter") && !state.sealed) {
      event.preventDefault();
      resetHold();
    }
  });

  enterGame.addEventListener("click", async () => {
    warmAudio();
    primeWishChant();
    try {
      await document.documentElement.requestFullscreen?.();
    } catch {
      // Some mobile browsers do not expose page fullscreen; play continues normally.
    }
    await audioManifestReady;
    playAssetSfx("enter", 0.62);
    syncSceneBgm("cover");
    entryVeil.classList.add("is-open");
    window.setTimeout(() => entryVeil.remove(), state.reduceMotion ? 20 : 720);
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      activeBgm?.pause();
    } else if (
      state.scene === "incantation"
      && !state.sealed
      && !wishChantBgm.ended
      && wishChantBgm.currentTime > 0
      && wishChantBgm.currentTime < incantationSealTime
    ) {
      wishChantBgm.play().then(startWishChantTimeline).catch(() => {});
    } else {
      syncSceneBgm();
    }
  });

  wishChantBgm.addEventListener("timeupdate", updateWishChantTimeline);
  wishChantBgm.addEventListener("seeked", updateWishChantTimeline);
  wishChantBgm.addEventListener("playing", () => {
    resumeChant.hidden = true;
  });
  wishChantBgm.addEventListener("error", () => {
    resumeChant.hidden = true;
  });

  wishChantBgm.addEventListener("canplay", () => {
    if (
      state.scene === "incantation"
      && !state.sealed
      && wishChantBgm.paused
      && !wishChantBgm.ended
      && wishChantBgm.currentTime < incantationSealTime
    ) startWishChant();
  });

  document.addEventListener("pointerdown", () => {
    if (
      state.scene === "incantation"
      && !state.sealed
      && wishChantBgm.paused
      && !wishChantBgm.ended
      && wishChantBgm.currentTime < incantationSealTime
    ) {
      if (wishChantBgm.currentTime > 0) {
        wishChantBgm.play().then(startWishChantTimeline).catch(() => {});
      } else {
        startWishChant();
      }
    }
  }, { capture: true });

  resumeChant.addEventListener("click", () => {
    warmAudio();
    startWishChant();
  });

  document.querySelector("#preview-next").addEventListener("click", () => {
    state.currentRound = 1;
    resetRoundSelection();
    showScene("wish-round", "[data-wish-index='0']");
  });

  roundOneCards.forEach((card) => {
    card.addEventListener("click", () => selectRoundCard(Number(card.dataset.wishIndex)));
  });

  roundOneActions.forEach((button) => {
    button.addEventListener("click", () => assignRoundAction(button.dataset.wishAction));
  });

  refuseRoundButton.addEventListener("click", () => {
    if (state.currentRound !== 8 || state.roundAssignments.some(Boolean)) return;
    state.roundRefused = true;
    state.roundAssignments = ["refuse", "refuse", "refuse"];
    roundOneCards.forEach((card) => {
      card.classList.add("is-resolved", "action--refuse");
      card.classList.remove("is-selected");
      card.setAttribute("aria-pressed", "false");
      card.querySelector(".wish-card__result").textContent = "拒签";
    });
    roundProgress.textContent = "已拒签";
    refuseRoundButton.disabled = true;
    document.querySelector(".wish-actions > p").hidden = true;
    document.querySelector(".wish-actions > div").hidden = true;
    roundConfirm.querySelector("span").textContent = "提交拒签";
    roundConfirm.hidden = false;
    roundReselect.hidden = false;
    roundLiveFeedback.textContent = "拒签已提交。愿册正在要求当前引导员代填空白。";
    setStatus("你已拒签。根据交接规则，当前引导员必须代填空白。");
  });

  roundReselect.addEventListener("click", () => {
    resetRoundSelection();
    prepareWishRound();
    roundOneCards[0].focus();
    setStatus("本轮选择已清空，可以重新选择。");
  });

  function advanceFromRoundComplete() {
    if (roundAutoTimer) window.clearTimeout(roundAutoTimer);
    roundAutoTimer = null;
    if (state.currentRound < 8) {
      if (state.currentRound === 1) {
        state.conversationChapter = 1;
        showScene("conversation");
        return;
      }
      if (state.currentRound === 2) {
        state.echoVisit = 1;
        showScene("echo", "[data-echo-index='0']");
        return;
      }
      if (state.currentRound === 3) {
        state.conversationChapter = 3;
        showScene("conversation");
        return;
      }
      if (state.currentRound === 4) {
        state.conversationChapter = 4;
        showScene("conversation");
        return;
      }
      if (state.currentRound >= 5 && state.currentRound <= 7) {
        state.conversationChapter = state.currentRound + 1;
        showScene("conversation");
        return;
      }
      state.currentRound += 1;
      resetRoundSelection();
      showScene("wish-round", "[data-wish-index='0']");
      return;
    }
    showScene("return-gate");
  }

  roundConfirm.addEventListener("click", () => {
    state.roundHistory.push({
      round: state.currentRound,
      assignments: [...state.roundAssignments],
    });
    buildRoundSummary();
    playAssetSfx("confirm", 0.72);
    vibrate([70, 35, 120], "seal");
    showScene("round-complete");
    const autoDelivery = ![4, 8].includes(state.currentRound);
    document.querySelector('[data-scene="round-complete"]').classList.toggle("is-auto-delivery", autoDelivery);
    nextRoundButton.hidden = autoDelivery;
    document.querySelector("#next-round-label").textContent = autoDelivery
      ? "愿签正在送达"
      : state.currentRound >= 8
        ? "八愿已入册"
        : `${roundNumerals[state.currentRound + 1] || "下一"}愿正在启封`;
    if (autoDelivery) {
      const autoDelay = state.currentRound >= 6 ? 5000 : state.currentRound === 5 ? 4100 : 3200;
      roundAutoTimer = window.setTimeout(advanceFromRoundComplete, state.reduceMotion ? 900 : autoDelay);
    }
    if (state.currentRound === 6) {
      window.setTimeout(() => showTextTerror("你撕掉的\n不是愿望", 1900), state.reduceMotion ? 250 : 1250);
    }
    if (state.currentRound === 7) {
      window.setTimeout(() => showTextTerror("我也按下了", 1750), state.reduceMotion ? 250 : 1000);
    }
  });

  nextRoundButton.addEventListener("click", advanceFromRoundComplete);

  conversationContinue.addEventListener("click", () => {
    clearConversationTimers();
    if (state.conversationChapter === 9) {
      showScene("false-peace");
      return;
    }
    if (state.conversationChapter === 4) {
      state.echoVisit = 2;
      showScene("echo", "[data-echo-index='0']");
      return;
    }
    if (state.conversationChapter === 5) {
      state.currentRound = 5;
      resetRoundSelection();
      showScene("wish-round", "[data-wish-index='0']");
      return;
    }
    const nextRoundByConversation = { 1: 2, 2: 3, 3: 4, 6: 6, 7: 7, 8: 8 };
    state.currentRound = nextRoundByConversation[state.conversationChapter] || state.currentRound + 1;
    resetRoundSelection();
    showScene("wish-round", "[data-wish-index='0']");
  });

  echoEnvelopes.forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.dataset.echoIndex);
      if (state.echoOpened[index]) return;
      state.echoOpened[index] = true;
      button.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      button.querySelector("b").textContent = "已拆";
      playAssetSfx("woodKnock", 0.46);
      vibrate(24, "interaction");
      const opened = state.echoOpened.filter(Boolean).length;
      echoResult.textContent = `已拆开 ${opened} / 3 封回执。`;
      if (opened === 3) {
        const data = getEchoData();
        echoResult.textContent = data.result;
        echoResult.classList.toggle("is-warning", state.echoVisit === 2);
        echoContinue.hidden = false;
        setStatus("三封回执均已拆开，可以继续。");
      }
    });
  });

  echoContinue.addEventListener("click", () => {
    if (state.echoVisit === 1) {
      state.conversationChapter = 2;
      showScene("conversation");
      return;
    }
    showScene("audit");
  });

  auditSealButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      if (auditSeals.classList.contains("is-resolved")) return;
      const isUnexpectedSeal = index === auditSealButtons.length - 1;
      if (!isUnexpectedSeal) {
        const group = Math.floor(index / 3) + 1;
        button.classList.remove("is-wrong-pick");
        void button.offsetWidth;
        button.classList.add("is-wrong-pick");
        auditPrompt.textContent = `第${roundNumerals[index + 1]}枚属于前四轮中的第${roundNumerals[group]}组，再找一次。`;
        setStatus(`第${index + 1}枚属于前四轮，不能作为多出的愿签。`);
        playAssetSfx("woodKnock", 0.28);
        vibrate([24, 55, 24], "interaction");
        const clearWrongPick = window.setTimeout(() => {
          button.classList.remove("is-wrong-pick");
          if (!auditSeals.classList.contains("is-resolved")) {
            auditPrompt.textContent = "请点出不属于前四轮的那一枚";
          }
        }, state.reduceMotion ? 180 : 900);
        auditTimers.push(clearWrongPick);
        return;
      }
      auditSeals.classList.add("is-resolved");
      auditSealButtons.forEach((item) => {
        item.disabled = true;
        item.classList.toggle("is-chosen", item === button);
        item.classList.toggle("is-dismissed", item !== button);
      });
      auditPrompt.textContent = "愿册正在核验你选中的印记……";
      auditTimers.push(window.setTimeout(() => {
        auditOwner.textContent = "签十三　提交时间：你进入愿册以前";
        auditOwner.hidden = false;
        auditPrompt.textContent = "不是它多出来了。";
        showTextTerror("十三没有多出来\n多出来的是你", 2200, "ink");
      }, state.reduceMotion ? 180 : 850));
      auditTimers.push(window.setTimeout(() => {
        auditContinue.hidden = false;
        auditContinue.disabled = false;
        auditContinue.setAttribute("aria-hidden", "false");
        auditContinue.focus();
      }, state.reduceMotion ? 550 : 2500));
    });
  });

  auditContinue.addEventListener("click", () => {
    clearAuditSequence();
    auditSeals.classList.remove("is-resolved");
    state.conversationChapter = 5;
    showScene("conversation");
  });

  backendNext.addEventListener("click", () => {
    if (state.backendRound < 11) {
      state.backendRound += 1;
      renderBackendRound();
      syncSceneBgm("backend");
      window.scrollTo({ top: 0, behavior: state.reduceMotion ? "auto" : "smooth" });
      return;
    }
    showScene("final-choice");
  });

  backendReselect.addEventListener("click", () => {
    renderBackendRound();
    backendOptions.querySelector("button")?.focus();
    setStatus("本轮后台选择已清空。");
  });

  selfChoiceButtons.forEach((button) => {
    button.addEventListener("click", () => chooseFinalSelf(button.dataset.selfChoice));
  });

  finalReselect.addEventListener("click", () => {
    startFinalChoice();
    selfChoiceButtons[0].focus();
    setStatus("最终选择已清空，倒计时重新开始。");
  });

  finalConfirm.addEventListener("click", confirmFinalSelf);

  goodbye.addEventListener("click", () => {
    showScene("epilogue");
  });

  epilogueClose.addEventListener("click", () => {
    epilogueObserver?.disconnect();
    epilogueObserver = null;
    epilogueClose.hidden = true;
    epilogueStory.hidden = true;
    epilogueScene.classList.add("is-credits");
    epilogueEnding.hidden = false;
    epilogueScene.scrollTo({ top: 0, behavior: state.reduceMotion ? "auto" : "smooth" });
    if (activeBgm) {
      stopBgm(activeBgm);
      activeBgm = null;
    }
    playAssetSfx("confirm", 0.58);
    vibrate([70, 45, 160], "seal");
    setStatus("谢谢游玩。游戏至此结束。");
  });

  viewOperator.addEventListener("click", () => {
    if (falsePeaceStage === 0) {
      state.afterVictoryReturn = true;
      showScene("cover");
      return;
    }
    falsePeaceStage = 2;
    viewOperator.disabled = true;
    viewOperator.hidden = true;
    document.body.classList.add("operator-reading");
    document.querySelector("#false-peace-kicker").textContent = "未归档记录";
    document.querySelector("#false-peace-title").textContent = "正在读取";
    document.querySelector("#peace-wish").textContent = "记录编号：待分配";
    document.querySelector("#false-peace-status").innerHTML = "<span></span> 正在恢复记录内容……";
    playLoopBgm("finalPressure");
    playAssetSfx("message", 0.56);
    vibrate([40, 180, 40], "story");
    const scanSteps = [
      "正在读取第二十八位的最后署名……",
      "署名与当前操作者一致。",
      "正在继承未完成愿望……",
      "正在确认续祈者……",
      "记录归属：操作员",
    ];
    let scanIndex = 0;
    const advanceScan = () => {
      if (scanIndex >= scanSteps.length) {
        showScene("reflection");
        return;
      }
      document.querySelector("#false-peace-status").innerHTML = `<span></span> ${scanSteps[scanIndex]}`;
      playAssetSfx("message", 0.38 + scanIndex * 0.07);
      vibrate(scanIndex === 2 ? [45, 50, 90] : 35, "story");
      scanIndex += 1;
      peaceTimer = window.setTimeout(advanceScan, state.reduceMotion ? 260 : 1450);
    };
    peaceTimer = window.setTimeout(advanceScan, state.reduceMotion ? 240 : 900);
  });

  document.querySelectorAll("[data-reset-game]").forEach((button) => {
    button.addEventListener("click", () => {
      sessionStorage.removeItem("qi.playerName");
      sessionStorage.removeItem("qi.playerWish");
      state.playerName = "";
      state.playerWish = "";
      state.sealed = false;
      state.currentRound = 1;
      state.roundSelected = 0;
      state.roundAssignments = [null, null, null];
      state.roundRefused = false;
      state.tutorialStep = 0;
      state.roundHistory = [];
      state.conversationChapter = 0;
      state.conversationReplies = {};
      state.echoVisit = 0;
      state.echoOpened = [];
      state.backendRound = 9;
      state.backendChoice = null;
      state.finalChoice = null;
      state.finalChoiceUnlocked = false;
      state.afterVictoryReturn = false;
      nameInput.value = "";
      wishInput.value = "";
      sealButton.classList.remove("is-complete");
      resetHold();
      clearPactTimers();
      if (roundAutoTimer) window.clearTimeout(roundAutoTimer);
      roundAutoTimer = null;
      clearEndingTimers();
      clearAuditSequence();
      reflectionHook.hidden = true;
      goodbye.hidden = true;
      textTerror.classList.remove("is-visible");
      coverCount.classList.remove("has-new-arrival");
      document.body.classList.remove("is-final-black", "is-under-pressure", "choices-locked", "operator-reading", "interface-fault", "choice-corruption", "story-phase-warm", "story-phase-unease", "story-phase-breach", "story-phase-horror");
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      renderWishRound();
      updateWishCount();
      showScene("cover");
    });
  });

  nameInput.value = state.playerName;
  wishInput.value = state.playerWish;
  updateWishCount();
  renderWishRound();
  updateSettings();
  setAppHeight();
  preloadGameAssets();
  window.addEventListener("resize", setAppHeight);
  window.visualViewport?.addEventListener("resize", setAppHeight);
})();
