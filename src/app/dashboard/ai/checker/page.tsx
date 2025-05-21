"use client";

import { useState, useEffect, Suspense } from "react";
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
  Sparkles,
  Clipboard,
  FileText,
  Download,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { apikey } from "@/app/Utils/gemini";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apikey);

interface EvaluationResult {
  scores: {
    marketPotential: number;
    technicalFeasibility: number;
    innovationLevel: number;
    monetizationPotential: number;
    scalability: number;
    riskLevel: number;
    implementationComplexity: number;
    competitiveAdvantage: number;
    marketTiming: number;
    resourceRequirements: number;
    regulatoryCompliance: number;
    userAdoption: number;
    sustainability: number;
    teamRequirements: number;
  };
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  nextSteps: string[];
  overallScore: number;
  marketAnalysis: {
    targetMarket: string;
    marketSize: string;
    competition: string[];
    marketTrends: string[];
  };
  technicalAnalysis: {
    requiredTechnologies: string[];
    developmentPhases: string[];
    technicalChallenges: string[];
  };
  financialAnalysis: {
    initialInvestment: string;
    revenueStreams: string[];
    breakEvenAnalysis: string;
    fundingRequirements: string[];
  };
  riskAnalysis: {
    highRisks: string[];
    mitigationStrategies: string[];
    contingencyPlans: string[];
  };
}

export default function IdeaChecker() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-muted/10">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <IdeaCheckerContent />
    </Suspense>
  );
}

function IdeaCheckerContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ideaContent, setIdeaContent] = useState("");
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
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

  // Fetch idea content if ID is provided
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

  // Handle idea transfer from edit page
  useEffect(() => {
    const transferredIdea = searchParams.get("idea");
    if (transferredIdea) {
      setIdeaContent(transferredIdea);
    }
  }, [searchParams]);

  const evaluateIdea = async () => {
    if (!ideaContent.trim()) {
      toast.error("Please provide an idea to evaluate");
      return;
    }

    setEvaluating(true);
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const prompt = `You are an expert business analyst and startup consultant with years of experience in evaluating business ideas. Analyze the following business idea and provide a detailed, practical evaluation based on real-world market conditions and startup experiences. Focus on actionable insights and specific, measurable points.

Idea to evaluate:
${ideaContent}

Return a JSON object with this exact structure (no additional text or formatting). Make sure all array fields contain at least one item. Focus on practical, real-world aspects:

{
  "scores": {
    "marketPotential": number (0-100),
    "technicalFeasibility": number (0-100),
    "innovationLevel": number (0-100),
    "monetizationPotential": number (0-100),
    "scalability": number (0-100),
    "riskLevel": number (0-100),
    "implementationComplexity": number (0-100),
    "competitiveAdvantage": number (0-100),
    "marketTiming": number (0-100),
    "resourceRequirements": number (0-100),
    "regulatoryCompliance": number (0-100),
    "userAdoption": number (0-100),
    "sustainability": number (0-100),
    "teamRequirements": number (0-100)
  },
  "suggestions": ["string - Include specific, actionable suggestions with real-world examples"],
  "strengths": ["string - Focus on concrete advantages with market evidence"],
  "weaknesses": ["string - Identify specific challenges with potential solutions"],
  "nextSteps": ["string - Provide clear, immediate actions with timelines"],
  "overallScore": number (0-100),
  "marketAnalysis": {
    "targetMarket": "string - Define specific demographics, locations, and market segments",
    "marketSize": "string - Include actual numbers and growth projections",
    "competition": ["string - List real competitors with their market positions"],
    "marketTrends": ["string - Include current trends with data points"]
  },
  "technicalAnalysis": {
    "requiredTechnologies": ["string - List specific technologies with versions"],
    "developmentPhases": ["string - Break down into realistic timeframes"],
    "technicalChallenges": ["string - Include specific technical hurdles with solutions"]
  },
  "financialAnalysis": {
    "initialInvestment": "string - Provide specific cost breakdown",
    "revenueStreams": ["string - Include pricing strategies and revenue models"],
    "breakEvenAnalysis": "string - Include timeline and key milestones",
    "fundingRequirements": ["string - Specify funding stages and amounts"]
  },
  "riskAnalysis": {
    "highRisks": ["string - Identify specific risks with probability assessment"],
    "mitigationStrategies": ["string - Provide concrete risk management steps"],
    "contingencyPlans": ["string - Include specific backup plans with triggers"]
  }
}

Make the evaluation extremely practical and actionable. Include specific numbers, timelines, and real-world examples where possible.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
      const evaluation = JSON.parse(cleanJson);

      // Ensure all required fields exist and are of the correct type
      const sanitizedEvaluation: EvaluationResult = {
        scores: {
          marketPotential: Number(evaluation.scores?.marketPotential) || 0,
          technicalFeasibility:
            Number(evaluation.scores?.technicalFeasibility) || 0,
          innovationLevel: Number(evaluation.scores?.innovationLevel) || 0,
          monetizationPotential:
            Number(evaluation.scores?.monetizationPotential) || 0,
          scalability: Number(evaluation.scores?.scalability) || 0,
          riskLevel: Number(evaluation.scores?.riskLevel) || 0,
          implementationComplexity:
            Number(evaluation.scores?.implementationComplexity) || 0,
          competitiveAdvantage:
            Number(evaluation.scores?.competitiveAdvantage) || 0,
          marketTiming: Number(evaluation.scores?.marketTiming) || 0,
          resourceRequirements:
            Number(evaluation.scores?.resourceRequirements) || 0,
          regulatoryCompliance:
            Number(evaluation.scores?.regulatoryCompliance) || 0,
          userAdoption: Number(evaluation.scores?.userAdoption) || 0,
          sustainability: Number(evaluation.scores?.sustainability) || 0,
          teamRequirements: Number(evaluation.scores?.teamRequirements) || 0,
        },
        suggestions: Array.isArray(evaluation.suggestions)
          ? evaluation.suggestions
          : [],
        strengths: Array.isArray(evaluation.strengths)
          ? evaluation.strengths
          : [],
        weaknesses: Array.isArray(evaluation.weaknesses)
          ? evaluation.weaknesses
          : [],
        nextSteps: Array.isArray(evaluation.nextSteps)
          ? evaluation.nextSteps
          : [],
        overallScore: Number(evaluation.overallScore) || 0,
        marketAnalysis: {
          targetMarket: String(
            evaluation.marketAnalysis?.targetMarket || "Not specified"
          ),
          marketSize: String(
            evaluation.marketAnalysis?.marketSize || "Not specified"
          ),
          competition: Array.isArray(evaluation.marketAnalysis?.competition)
            ? evaluation.marketAnalysis.competition
            : [],
          marketTrends: Array.isArray(evaluation.marketAnalysis?.marketTrends)
            ? evaluation.marketAnalysis.marketTrends
            : [],
        },
        technicalAnalysis: {
          requiredTechnologies: Array.isArray(
            evaluation.technicalAnalysis?.requiredTechnologies
          )
            ? evaluation.technicalAnalysis.requiredTechnologies
            : [],
          developmentPhases: Array.isArray(
            evaluation.technicalAnalysis?.developmentPhases
          )
            ? evaluation.technicalAnalysis.developmentPhases
            : [],
          technicalChallenges: Array.isArray(
            evaluation.technicalAnalysis?.technicalChallenges
          )
            ? evaluation.technicalAnalysis.technicalChallenges
            : [],
        },
        financialAnalysis: {
          initialInvestment: String(
            evaluation.financialAnalysis?.initialInvestment || "Not specified"
          ),
          revenueStreams: Array.isArray(
            evaluation.financialAnalysis?.revenueStreams
          )
            ? evaluation.financialAnalysis.revenueStreams
            : [],
          breakEvenAnalysis: String(
            evaluation.financialAnalysis?.breakEvenAnalysis || "Not specified"
          ),
          fundingRequirements: Array.isArray(
            evaluation.financialAnalysis?.fundingRequirements
          )
            ? evaluation.financialAnalysis.fundingRequirements
            : [],
        },
        riskAnalysis: {
          highRisks: Array.isArray(evaluation.riskAnalysis?.highRisks)
            ? evaluation.riskAnalysis.highRisks
            : [],
          mitigationStrategies: Array.isArray(
            evaluation.riskAnalysis?.mitigationStrategies
          )
            ? evaluation.riskAnalysis.mitigationStrategies
            : [],
          contingencyPlans: Array.isArray(
            evaluation.riskAnalysis?.contingencyPlans
          )
            ? evaluation.riskAnalysis.contingencyPlans
            : [],
        },
      };

      setEvaluationResult(sanitizedEvaluation);
    } catch (error) {
      console.error("Error evaluating idea:", error);
      toast.error("Failed to evaluate idea");
    } finally {
      setEvaluating(false);
    }
  };

  const downloadReport = () => {
    if (!evaluationResult) return;

    const report = {
      title: ideaTitle || "Idea Evaluation Report",
      date: new Date().toLocaleDateString(),
      ideaContent,
      evaluation: evaluationResult,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `idea-evaluation-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
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
            <span className="truncate font-medium">Idea Checker</span>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="bg-muted/50 min-h-[calc(100vh-8rem)] flex-1 rounded-xl p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="text-center space-y-4">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  🎯 Idea Checker
                </h1>
                <p className="text-muted-foreground text-lg">
                  Evaluate your idea's potential and get actionable insights
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
                      onClick={evaluateIdea}
                      disabled={evaluating || !ideaContent.trim()}
                    >
                      {evaluating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Evaluate Idea
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {evaluationResult && (
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="space-y-1">
                            <CardTitle className="text-2xl">
                              Overall Evaluation
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              Comprehensive analysis of your idea's potential
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
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-lg w-full md:w-48">
                            <span className="text-sm text-muted-foreground mb-2">
                              Overall Score
                            </span>
                            <div
                              className={`text-4xl font-bold ${getScoreColor(
                                evaluationResult.overallScore
                              )}`}
                            >
                              {evaluationResult.overallScore}%
                            </div>
                            <div className="mt-2 text-sm text-muted-foreground">
                              {evaluationResult.overallScore >= 80
                                ? "Excellent"
                                : evaluationResult.overallScore >= 60
                                ? "Good"
                                : "Needs Improvement"}
                            </div>
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(evaluationResult.scores)
                              .slice(0, 6) // Show top 6 scores in the overview
                              .map(([key, score]) => (
                                <div key={key} className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">
                                      {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                    <span
                                      className={`text-sm font-medium ${getScoreColor(
                                        score
                                      )}`}
                                    >
                                      {score}%
                                    </span>
                                  </div>
                                  <Progress value={score} className="h-1.5" />
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          📊 Detailed Scores
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid gap-4">
                          {Object.entries(evaluationResult.scores).map(
                            ([key, score]) => (
                              <div key={key} className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </span>
                                  <span className={getScoreColor(score)}>
                                    {score}%
                                  </span>
                                </div>
                                <Progress value={score} className="h-2" />
                              </div>
                            )
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          💪 Key Strengths & Areas for Improvement
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Strengths</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {evaluationResult.strengths.map(
                                (strength, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {strength}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">
                              Areas for Improvement
                            </h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {evaluationResult.weaknesses.map(
                                (weakness, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {weakness}
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
                          💡 Recommendations & Next Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">
                              Suggestions
                            </h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {evaluationResult.suggestions.map(
                                (suggestion, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {suggestion}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-semibold text-lg">
                              Next Steps
                            </h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {evaluationResult.nextSteps.map((step, index) => (
                                <li
                                  key={index}
                                  className="text-sm leading-relaxed"
                                >
                                  {step}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          📈 Market Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2">
                                Target Market
                              </h3>
                              <p className="text-sm leading-relaxed">
                                {evaluationResult.marketAnalysis.targetMarket}
                              </p>
                            </div>
                            <div>
                              <h3 className="font-semibold mb-2">
                                Market Size
                              </h3>
                              <p className="text-sm leading-relaxed">
                                {evaluationResult.marketAnalysis.marketSize}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-semibold mb-2">
                                Competition
                              </h3>
                              <ul className="list-disc pl-4 space-y-1">
                                {evaluationResult.marketAnalysis.competition.map(
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
                            <div>
                              <h3 className="font-semibold mb-2">
                                Market Trends
                              </h3>
                              <ul className="list-disc pl-4 space-y-1">
                                {evaluationResult.marketAnalysis.marketTrends.map(
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
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          🔧 Technical Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">
                            Required Technologies
                          </h3>
                          <ul className="list-disc pl-4 space-y-1">
                            {evaluationResult.technicalAnalysis.requiredTechnologies.map(
                              (tech, index) => (
                                <li
                                  key={index}
                                  className="text-sm leading-relaxed"
                                >
                                  {tech}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            Development Phases
                          </h3>
                          <ul className="list-disc pl-4 space-y-1">
                            {evaluationResult.technicalAnalysis.developmentPhases.map(
                              (phase, index) => (
                                <li
                                  key={index}
                                  className="text-sm leading-relaxed"
                                >
                                  {phase}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            Technical Challenges
                          </h3>
                          <ul className="list-disc pl-4 space-y-1">
                            {evaluationResult.technicalAnalysis.technicalChallenges.map(
                              (challenge, index) => (
                                <li
                                  key={index}
                                  className="text-sm leading-relaxed"
                                >
                                  {challenge}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          💰 Financial Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold mb-2">
                            Initial Investment
                          </h3>
                          <p className="text-sm leading-relaxed">
                            {
                              evaluationResult.financialAnalysis
                                .initialInvestment
                            }
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            Revenue Streams
                          </h3>
                          <ul className="list-disc pl-4 space-y-1">
                            {evaluationResult.financialAnalysis.revenueStreams.map(
                              (stream, index) => (
                                <li
                                  key={index}
                                  className="text-sm leading-relaxed"
                                >
                                  {stream}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            Break-Even Analysis
                          </h3>
                          <p className="text-sm leading-relaxed">
                            {
                              evaluationResult.financialAnalysis
                                .breakEvenAnalysis
                            }
                          </p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            Funding Requirements
                          </h3>
                          <ul className="list-disc pl-4 space-y-1">
                            {evaluationResult.financialAnalysis.fundingRequirements.map(
                              (req, index) => (
                                <li
                                  key={index}
                                  className="text-sm leading-relaxed"
                                >
                                  {req}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          ⚠️ Risk Analysis
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-6 md:grid-cols-3">
                          <div className="space-y-4">
                            <h3 className="font-semibold">High Risks</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {evaluationResult.riskAnalysis.highRisks.map(
                                (risk, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {risk}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-semibold">
                              Mitigation Strategies
                            </h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {evaluationResult.riskAnalysis.mitigationStrategies.map(
                                (strategy, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {strategy}
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                          <div className="space-y-4">
                            <h3 className="font-semibold">Contingency Plans</h3>
                            <ul className="list-disc pl-4 space-y-2">
                              {evaluationResult.riskAnalysis.contingencyPlans.map(
                                (plan, index) => (
                                  <li
                                    key={index}
                                    className="text-sm leading-relaxed"
                                  >
                                    {plan}
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
