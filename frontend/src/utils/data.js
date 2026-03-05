export const NAV_ITEMS = [
  { id: "vault",    icon: "◈", label: "Identity Vault"  },
  { id: "guard",    icon: "⬡", label: "Upload Guard"    },
  { id: "audit",    icon: "◉", label: "Safety Audit"    },
  { id: "takedown", icon: "⚖", label: "Takedown"        },
  { id: "sos",      icon: "⊕", label: "Guardian SOS"    },
];

export const RISK_DATA = [
  { day: "Mon", level: 2 }, { day: "Tue", level: 4 }, { day: "Wed", level: 7 },
  { day: "Thu", level: 3 }, { day: "Fri", level: 8 }, { day: "Sat", level: 5 },
  { day: "Sun", level: 1 },
];

export const ALERTS = [
  { site: "reddit.com/r/leaked",    date: "2 hrs ago",  score: 87, status: "red"   },
  { site: "t.me/channel/unknown",   date: "1 day ago",  score: 43, status: "amber" },
  { site: "imgbb.com/gallery/x9k2", date: "3 days ago", score: 12, status: "green" },
];

export const CASES = {
  todo:     [{ id: 1, title: "Telegram deepfake report", urgency: "red"   },
             { id: 2, title: "Google DMCA request",      urgency: "amber" }],
  pending:  [{ id: 3, title: "Instagram takedown",       urgency: "amber" }],
  resolved: [{ id: 4, title: "Reddit image removed",     urgency: "green" },
             { id: 5, title: "Facebook content pulled",  urgency: "green" }],
};

export const GUARDIANS = [
  { name: "Mom",          phone: "+91 98765 43210", email: "mom@gmail.com"    },
  { name: "Sister Ananya",phone: "+91 87654 32109", email: "ananya@gmail.com" },
  { name: "Riya (Friend)",phone: "+91 76543 21098", email: "riya@gmail.com"   },
];

export const ALIASES = [
  { platform: "Instagram", handle: "@priya.sharma",    linked: true  },
  { platform: "LinkedIn",  handle: "priya-sharma-dev", linked: true  },
  { platform: "X (Twitter)", handle: "",               linked: false },
];
