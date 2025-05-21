export interface User {
  auth: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
  firestore: {
    name: string;
    email: string;
    photoURL: string;
    createdAt: any;
    updatedAt: any;
  } | null;
}

export interface Idea {
  id: string;
  title: string;
  body: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface MarketResearchResult {
  marketOverview: {
    marketSize: string;
    growthRate: string;
    marketTrends: string[];
    keyDrivers: string[];
    marketChallenges: string[];
  };
  targetAudience: {
    demographics: string[];
    psychographics: string[];
    painPoints: string[];
    buyingBehavior: string[];
    userPersonas: Array<{
      name: string;
      description: string;
      needs: string[];
    }>;
  };
  competitiveAnalysis: {
    directCompetitors: Array<{
      name: string;
      strengths: string[];
      weaknesses: string[];
      marketShare: string;
    }>;
    indirectCompetitors: string[];
    competitiveAdvantages: string[];
    marketGaps: string[];
  };
  industryInsights: {
    regulations: string[];
    technologicalTrends: string[];
    socialTrends: string[];
    economicFactors: string[];
  };
  opportunityAnalysis: {
    marketOpportunities: string[];
    potentialThreats: string[];
    entryBarriers: string[];
    growthPotential: string;
  };
  recommendations: {
    marketEntry: string[];
    positioning: string[];
    pricing: string[];
    marketing: string[];
  };
  marketMetrics: {
    totalAddressableMarket: string;
    serviceableAddressableMarket: string;
    serviceableObtainableMarket: string;
    marketPenetration: string;
  };
}

export interface BrandKit {
  name: string;
  tagline: string;
  description: string;
  usp: string[];
  brandVoice: {
    tone: string;
    personality: string[];
    keywords: string[];
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    gradients: string[];
  };
  typography: {
    heading: string;
    body: string;
    display: string;
    weights: {
      light: string;
      regular: string;
      medium: string;
      bold: string;
    };
  };
  logo: {
    concept: string;
    style: string;
    elements: string[];
    variations: string[];
    usage: string[];
  };
  ui: {
    style: string;
    components: string[];
    layout: string;
    spacing: string;
    shadows: string[];
    animations: string[];
  };
  marketing: {
    socialMedia: {
      platforms: string[];
      tone: string;
      contentTypes: string[];
    };
    messaging: {
      headlines: string[];
      callsToAction: string[];
      valueProps: string[];
    };
  };
}
