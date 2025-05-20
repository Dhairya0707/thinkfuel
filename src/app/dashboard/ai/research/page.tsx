"use client";

import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { doc, getDoc } from "firebase/firestore";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { auth, db } from "../../../../../service/firebase.config";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Loader2,
  Search,
  Download,
  Share2,
  ArrowLeft,
  BarChart2,
  TrendingUp,
  Users,
  Target,
  Building2,
  Globe,
  DollarSign,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const genAI = new GoogleGenerativeAI("AIzaSyDMVDpZW6ytIFHfr-BCET7JQvWcs6ETDyI");

interface MarketResearchResult {
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

export default function MarketResearch() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ideaContent, setIdeaContent] = useState("");
  const [researching, setResearching] = useState(false);
  const [researchResult, setResearchResult] =
    useState<MarketResearchResult | null>(null);
  const [ideaTitle, setIdeaTitle] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        try {
          const docRef = doc(db, "users", authUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              auth: authUser,
              firestore: userData,
            });
          } else {
            setUser({
              auth: authUser,
              firestore: null,
            });
          }
        } catch (error) {
          console.error("Error fetching Firestore user data:", error);
          toast.error("Failed to fetch user data");
        } finally {
          setLoading(false);
        }
      } else {
        router.replace("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchIdea = async () => {
      if (params?.id) {
        try {
          const ideaRef = doc(db, "ideas", params.id as string);
          const ideaSnap = await getDoc(ideaRef);
          if (ideaSnap.exists()) {
            const ideaData = ideaSnap.data();
            setIdeaContent(ideaData.body);
            setIdeaTitle(ideaData.title);
          }
        } catch (error) {
          console.error("Error fetching idea:", error);
          toast.error("Failed to fetch idea");
        }
      }
    };

    fetchIdea();
  }, [params?.id]);

  useEffect(() => {
    const transferredIdea = searchParams.get("idea");
    if (transferredIdea) {
      setIdeaContent(transferredIdea);
    }
  }, [searchParams]);

  const conductResearch = async () => {
    if (!ideaContent.trim()) {
      toast.error("Please provide an idea to research");
      return;
    }

    setResearching(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are an expert market researcher and business analyst with extensive experience in conducting comprehensive market research. Analyze the following business idea and provide detailed, practical market research based on real-world data and current market conditions.

Idea to research:
${ideaContent}

Return a JSON object with this exact structure (no additional text or formatting). Make sure all array fields contain at least one item. Focus on practical, real-world aspects with specific data points and actionable insights:

{
  "marketOverview": {
    "marketSize": "string - Include specific numbers and growth projections",
    "growthRate": "string - Include percentage and timeframe",
    "marketTrends": ["string - Include current trends with data points"],
    "keyDrivers": ["string - List specific market drivers with evidence"],
    "marketChallenges": ["string - Include specific challenges with impact"]
  },
  "targetAudience": {
    "demographics": ["string - Include specific age groups, locations, income levels"],
    "psychographics": ["string - Include specific behaviors, values, lifestyles"],
    "painPoints": ["string - List specific problems with examples"],
    "buyingBehavior": ["string - Include specific purchasing patterns"],
    "userPersonas": [
      {
        "name": "string - Persona name",
        "description": "string - Detailed persona description",
        "needs": ["string - List specific needs and motivations"]
      }
    ]
  },
  "competitiveAnalysis": {
    "directCompetitors": [
      {
        "name": "string - Competitor name",
        "strengths": ["string - List specific strengths with evidence"],
        "weaknesses": ["string - List specific weaknesses with impact"],
        "marketShare": "string - Include specific percentage"
      }
    ],
    "indirectCompetitors": ["string - List specific indirect competitors"],
    "competitiveAdvantages": ["string - List specific advantages with evidence"],
    "marketGaps": ["string - List specific market opportunities"]
  },
  "industryInsights": {
    "regulations": ["string - List specific regulations with impact"],
    "technologicalTrends": ["string - Include specific tech trends with examples"],
    "socialTrends": ["string - List specific social trends with data"],
    "economicFactors": ["string - Include specific economic factors with impact"]
  },
  "opportunityAnalysis": {
    "marketOpportunities": ["string - List specific opportunities with potential"],
    "potentialThreats": ["string - List specific threats with probability"],
    "entryBarriers": ["string - List specific barriers with solutions"],
    "growthPotential": "string - Include specific growth projections"
  },
  "recommendations": {
    "marketEntry": ["string - List specific entry strategies"],
    "positioning": ["string - List specific positioning strategies"],
    "pricing": ["string - List specific pricing strategies"],
    "marketing": ["string - List specific marketing strategies"]
  },
  "marketMetrics": {
    "totalAddressableMarket": "string - Include specific TAM value",
    "serviceableAddressableMarket": "string - Include specific SAM value",
    "serviceableObtainableMarket": "string - Include specific SOM value",
    "marketPenetration": "string - Include specific penetration rate"
  }
}

Make the research extremely practical and actionable. Include specific numbers, timelines, and real-world examples where possible.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
      const research = JSON.parse(cleanJson);
      setResearchResult(research);
    } catch (error) {
      console.error("Error conducting research:", error);
      toast.error("Failed to conduct market research");
    } finally {
      setResearching(false);
    }
  };

  const downloadReport = () => {
    if (!researchResult) return;

    const report = {
      title: ideaTitle || "Market Research Report",
      date: new Date().toLocaleDateString(),
      ideaContent,
      research: researchResult,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `market-research-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-0 data-[orientation=vertical]:h-4"
            />
            <span className="truncate font-medium">Market Research</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="bg-muted/50 min-h-[calc(100vh-8rem)] flex-1 rounded-xl p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  📊 Market Research
                </h1>
                <p className="text-muted-foreground text-lg">
                  Get comprehensive market insights for your idea
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Paste Your Idea</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Paste your idea here or it will be automatically loaded if you came from the idea generator..."
                    value={ideaContent}
                    onChange={(e) => setIdeaContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                  <div className="flex justify-end mt-4 gap-2">
                    {params?.id && (
                      <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Idea
                      </Button>
                    )}
                    <Button
                      onClick={conductResearch}
                      disabled={researching || !ideaContent.trim()}
                    >
                      {researching ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Researching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Conduct Research
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {researchResult && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-1">
                            <CardTitle className="text-2xl">
                              Market Overview
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Key market metrics and insights
                            </p>
                          </div>
                          <Button
                            onClick={downloadReport}
                            className="w-full md:w-auto"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download Report
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">Market Size</h3>
                            </div>
                            <p className="text-sm leading-relaxed">
                              {researchResult.marketOverview.marketSize}
                            </p>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">Growth Rate</h3>
                            </div>
                            <p className="text-sm leading-relaxed">
                              {researchResult.marketOverview.growthRate}
                            </p>
                          </div>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2">
                              <BarChart2 className="h-5 w-5 text-primary" />
                              <h3 className="font-semibold">
                                Key Market Trends
                              </h3>
                            </div>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.marketOverview.marketTrends.map(
                                (trend, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {trend}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Target Audience Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h3 className="font-semibold">Demographics</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.targetAudience.demographics.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                            <h3 className="font-semibold">Psychographics</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.targetAudience.psychographics.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-semibold">Pain Points</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.targetAudience.painPoints.map(
                                (point, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {point}
                                  </li>
                                )
                              )}
                            </ul>
                            <h3 className="font-semibold">Buying Behavior</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.targetAudience.buyingBehavior.map(
                                (behavior, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {behavior}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Competitive Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {researchResult.competitiveAnalysis.directCompetitors.map(
                            (competitor, index) => (
                              <div
                                key={index}
                                className="border rounded-lg p-4 space-y-4"
                              >
                                <div className="flex justify-between items-center">
                                  <h3 className="font-semibold text-lg">
                                    {competitor.name}
                                  </h3>
                                  <span className="text-sm text-muted-foreground">
                                    Market Share: {competitor.marketShare}
                                  </span>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Strengths
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                      {competitor.strengths.map(
                                        (strength, idx) => (
                                          <li
                                            key={idx}
                                            className="text-sm leading-relaxed"
                                          >
                                            {strength}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-2">
                                      Weaknesses
                                    </h4>
                                    <ul className="list-disc pl-4 space-y-1">
                                      {competitor.weaknesses.map(
                                        (weakness, idx) => (
                                          <li
                                            key={idx}
                                            className="text-sm leading-relaxed"
                                          >
                                            {weakness}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="h-5 w-5" />
                          Industry Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h3 className="font-semibold">Regulations</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.industryInsights.regulations.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                            <h3 className="font-semibold">
                              Technological Trends
                            </h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.industryInsights.technologicalTrends.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-semibold">Social Trends</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.industryInsights.socialTrends.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                            <h3 className="font-semibold">Economic Factors</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.industryInsights.economicFactors.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5" />
                          Opportunity Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h3 className="font-semibold">
                              Market Opportunities
                            </h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.opportunityAnalysis.marketOpportunities.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                            <h3 className="font-semibold">Growth Potential</h3>
                            <p className="text-sm leading-relaxed">
                              {
                                researchResult.opportunityAnalysis
                                  .growthPotential
                              }
                            </p>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-semibold">Potential Threats</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.opportunityAnalysis.potentialThreats.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                            <h3 className="font-semibold">Entry Barriers</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.opportunityAnalysis.entryBarriers.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          Market Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2">
                                Total Addressable Market (TAM)
                              </h3>
                              <p className="text-sm leading-relaxed">
                                {
                                  researchResult.marketMetrics
                                    .totalAddressableMarket
                                }
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">
                                Serviceable Addressable Market (SAM)
                              </h3>
                              <p className="text-sm leading-relaxed">
                                {
                                  researchResult.marketMetrics
                                    .serviceableAddressableMarket
                                }
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2">
                                Serviceable Obtainable Market (SOM)
                              </h3>
                              <p className="text-sm leading-relaxed">
                                {
                                  researchResult.marketMetrics
                                    .serviceableObtainableMarket
                                }
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">
                                Market Penetration
                              </h3>
                              <p className="text-sm leading-relaxed">
                                {researchResult.marketMetrics.marketPenetration}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          Strategic Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h3 className="font-semibold">Market Entry</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.recommendations.marketEntry.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                            <h3 className="font-semibold">Positioning</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.recommendations.positioning.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-semibold">Pricing</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.recommendations.pricing.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                            <h3 className="font-semibold">Marketing</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {researchResult.recommendations.marketing.map(
                                (item, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {item}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
