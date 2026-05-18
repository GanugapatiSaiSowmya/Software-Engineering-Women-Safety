export const NAV_ITEMS = [
  { id: "guard",    icon: "🛡️", label: "Upload Guard"    },
  { id: "takedown", icon: "⚖️", label: "Takedown"        },
  { id: "sos",      icon: "🆘", label: "Trusted Contacts"    },
  { id: "support",  icon: "❓", label: "Support Hub"    },
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

// Support Hub Data
export const SUPPORT_FAQS = [
  {
    question: "How does Upload Guard protect my photos before posting?",
    answer: "Upload Guard uses advanced AI and image analysis to scan photos for sensitive content, personal identifiers, and metadata before you share them. It checks for faces, location data, license plates, and other information that could compromise your privacy. You get a risk assessment and recommendations before posting anywhere online.",
  },
  {
    question: "What does Safety Audit do?",
    answer: "Safety Audit continuously monitors the internet to find where your photos might have been shared without your consent. It searches across social media, image hosting sites, forums, and other platforms. When matches are found, it gives you the location, risk level, and evidence so you can take action.",
  },
  {
    question: "Can I actually remove content from websites?",
    answer: "Yes. The Takedown module helps you file removal requests with platforms. It provides templates for DMCA (Digital Millennium Copyright Act) takedowns, platform reporting forms, and guides for different sites. We also help you document your case and track the status of each removal request.",
  },
  {
    question: "How secure is my data with this platform?",
    answer: "We prioritize your privacy. All image processing happens locally on your device by default. No images are stored on our servers unless you explicitly consent. Your personal data is encrypted, and we follow data protection regulations. Read our Privacy Policy and Terms of Service for complete details.",
  },
  {
    question: "What is Guardian SOS?",
    answer: "Guardian SOS lets you set up emergency contacts (guardians) who can receive instant alerts if you trigger an SOS signal. When activated, designated trusted people get notified immediately with your location and status. It's designed for situations where you need immediate help from people you trust.",
  },
  {
    question: "Is this service free?",
    answer: "Yes, the basic platform is free to use. We provide core features for image checking, monitoring, and takedown assistance at no cost. We may offer premium features in the future, but essential safety tools will always be available to you.",
  },
  {
    question: "What should I do if I find my image online without consent?",
    answer: "First, document the evidence (screenshots, URLs, timestamps). Then use our Safety Audit to confirm the content. File removal requests through the Takedown module following platform-specific procedures. For serious cases like non-consensual intimate images, contact law enforcement and local authorities. Our legal resources can guide you.",
  },
  {
    question: "How often does Safety Audit check for my photos?",
    answer: "Safety Audit can be set to monitor continuously or on your preferred schedule. You can configure daily, weekly, or manual checks based on your needs. More frequent monitoring helps catch unauthorized content faster.",
  },
];

export const SUPPORT_RESOURCES = [
  {
    icon: "📖",
    title: "Getting Started Guide",
    category: "Beginner",
    description: "Learn the basics of using each module to protect your digital presence.",
    details: "This guide walks you through account setup, uploading your first photo to Upload Guard, configuring your guardians, and understanding your safety dashboard. Takes about 10 minutes to complete.",
  },
  {
    icon: "🎓",
    title: "Digital Privacy 101",
    category: "Education",
    description: "Understand metadata, image forensics, and how your data can be exploited.",
    details: "Learn what metadata is hidden in your photos, how reverse image search works, common privacy threats online, and best practices for sharing content safely. Expert articles and interactive lessons.",
  },
  {
    icon: "🛡️",
    title: "Online Safety Best Practices",
    category: "Education",
    description: "Tips and tricks to stay safe while using social media and the internet.",
    details: "Comprehensive guide covering password management, recognizing phishing, secure browsing, and how to respond if your accounts are compromised. Updated regularly with emerging threats.",
  },
  {
    icon: "⚖️",
    title: "Legal Rights & Resources",
    category: "Legal",
    description: "Know your rights and find resources for image-based abuse situations.",
    details: "Information about non-consensual intimate images (NCII), revenge porn laws, DMCA protections, defamation, and harassment laws. Links to free legal resources, bar associations, and advocacy organizations.",
  },
  {
    icon: "🚀",
    title: "Advanced Features Tutorial",
    category: "Advanced",
    description: "Master advanced features like bulk uploads, scheduled monitoring, and case management.",
    details: "Deep dive into batch processing, custom alert settings, integration with other tools, and advanced search techniques to find your content across the internet.",
  },
  {
    icon: "💡",
    title: "Real Stories & Case Studies",
    category: "Inspiration",
    description: "Read how others have reclaimed their digital identity and privacy.",
    details: "Anonymous stories from people who successfully removed non-consensual content, protected their reputation, and built stronger digital privacy habits. Real strategies that worked.",
  },
  {
    icon: "📱",
    title: "Mobile Security Guide",
    category: "Mobile",
    description: "Secure your photos and accounts on phones and tablets.",
    details: "Device security settings, app permissions, backup safety, and how to prevent unauthorized access to your mobile accounts. Platform-specific (iOS and Android) recommendations.",
  },
  {
    icon: "👥",
    title: "Community Guidelines",
    category: "Community",
    description: "Be part of a supportive community while protecting privacy.",
    details: "How our community works, discussion forum guidelines, how to report misuse, and how to share your experience safely with others.",
  },
];

export const SUPPORT_CONTACTS = [
  {
    icon: "✉️",
    label: "Email Support",
    description: "General inquiries and non-urgent issues",
    link: "mailto:support@womensafety.app",
    cta: "Send Email",
    external: true,
  },
  {
    icon: "💬",
    label: "Live Chat",
    description: "Instant help during business hours",
    link: "#chat",
    cta: "Start Chat",
    external: false,
  },
  {
    icon: "📞",
    label: "Phone Support",
    description: "Call our support team weekdays 9AM-6PM",
    link: "tel:+919876543210",
    cta: "Call Now",
    external: true,
  },
  {
    icon: "🐦",
    label: "Social Media",
    description: "Follow us for updates and quick responses",
    link: "https://twitter.com/womensafety_app",
    cta: "Visit Twitter",
    external: true,
  },
  {
    icon: "🤝",
    label: "Community Forum",
    description: "Ask questions and learn from others",
    link: "#forum",
    cta: "Join Forum",
    external: false,
  },
  {
    icon: "🐛",
    label: "Report a Bug",
    description: "Help us improve by reporting issues",
    link: "mailto:bugs@womensafety.app?subject=Bug%20Report",
    cta: "Report Bug",
    external: true,
  },
];
