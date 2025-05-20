import {
  BarChart2,
  BookOpenCheck,
  Brain,
  Gem,
  Globe,
  LifeBuoy,
  Lightbulb,
  MessageCircle,
  MessageSquare,
  Newspaper,
  PaintbrushIcon,
  Settings,
  Sparkles,
} from "lucide-react";

const ideasBlock = {
  title: "Ideas",
  items: [
    {
      title: "My Ideas",
      url: "/dashboard",
      icon: Lightbulb, // Assuming Lightbulb is defined elsewhere
      tooltip: "Your saved and created ideas",
    },
    {
      title: "Public / Trending",
      url: "/dashboard/public",
      icon: Globe, // Assuming Globe is defined elsewhere
      tooltip: "Explore trending public ideas",
    },
  ],
};

const aiToolsBlock = {
  title: "AI Tools",
  items: [
    {
      title: "AI Generator",
      url: "/dashboard/ai/generator",
      icon: Sparkles, // Assuming Sparkles is defined elsewhere
      tooltip: "Generate new ideas with AI",
    },
    {
      title: "Idea Checker",
      url: "/dashboard/ai/checker",
      icon: Brain, // Assuming Brain is defined elsewhere
      tooltip: "Check feasibility of your idea",
    },
    {
      title: "Market Research",
      url: "/dashboard/ai/research",
      icon: BarChart2, // Assuming BarChart2 is defined elsewhere
      tooltip: "AI-driven market insights",
    },
    {
      title: "Chat With Idea",
      url: "/dashboard/ai/chat",
      icon: MessageCircle, // Assuming MessageCircle is defined elsewhere
      tooltip: "Talk with your idea like a chatbot",
    },
    {
      title: "Branding Kit",
      url: "/dashboard/ai/brandkit",
      icon: PaintbrushIcon,
      tooltip: "Generate catchy business names and taglines",
    },
  ],
};

const resourcesBlock = {
  title: "Resources",
  items: [
    {
      title: "Blogs & Updates",
      url: "/dashboard/blogs",
      icon: Newspaper, // Assuming Newspaper is defined elsewhere
      tooltip: "Latest updates and news",
    },
  ],
};

const settingsSupportBlock = {
  title: "Settings & Support",
  items: [
    {
      title: "App Settings",
      url: "/dashboard/settings",
      icon: Settings, // Assuming Settings is defined elsewhere
      tooltip: "Customize your experience",
    },
    {
      title: "Support & Feedback",
      url: "/dashboard/support",
      icon: MessageSquare, // Assuming MessageSquare is defined elsewhere
      tooltip: "Send Support & Feedback",
    },
  ],
};

const user = {
  name: "Dhairya",
  email: "dhairyadarji025@gmail.com",
  avatar: "",
  isPro: false,
};

export { ideasBlock, aiToolsBlock, resourcesBlock, settingsSupportBlock, user };
