"use client";
import { useState, useEffect } from "react";
import {
  Lightbulb,
  Brain,
  LockIcon,
  Share2,
  ArrowRight,
  CheckCircle2,
  Menu,
  X,
  ChevronDown,
  Star,
  Mail,
  Plus,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../service/firebase.config";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { trackVisitor } from "@/services/visitors";

const GradientCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition duration-300"
      style={{
        background: `radial-gradient(600px at ${position.x}px ${position.y}px, rgba(120, 119, 198, 0.05), transparent 80%)`,
      }}
    />
  );
};

// Button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  className?: string;
}

const Button = ({
  children,
  variant = "primary",
  size = "default",
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "font-medium rounded-full transition-all duration-200 inline-flex items-center justify-center";

  const variantClasses: Record<string, string> = {
    primary:
      "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25",
    secondary:
      "bg-white hover:bg-gray-50 text-indigo-600 border border-gray-200",
    outline:
      "bg-transparent hover:bg-indigo-50 text-indigo-600 border border-indigo-200 hover:border-indigo-300",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  };

  const sizeClasses: Record<string, string> = {
    sm: "text-sm px-4 py-2",
    default: "px-6 py-3",
    lg: "text-lg px-8 py-4",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// FAQ Accordion Item Component
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        className="flex w-full justify-between items-center py-4 text-left font-medium text-gray-900 dark:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{question}</span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-96 pb-4" : "max-h-0"
        }`}
      >
        <p className="text-gray-600 dark:text-gray-300">{answer}</p>
      </div>
    </div>
  );
};

// Feature card component
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300 group">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-5 group-hover:scale-110 transition-transform duration-300">
      <Icon className="h-6 w-6" />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">{description}</p>
  </div>
);

// Testimonial card component
interface TestimonialCardProps {
  avatar: string;
  name: string;
  role: string;
  testimonial: string;
}

const TestimonialCard = ({
  avatar,
  name,
  role,
  testimonial,
}: TestimonialCardProps) => (
  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none border border-gray-100 dark:border-gray-700 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all duration-300">
    <div className="flex items-center mb-4">
      <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium">
        {avatar}
      </div>
      <div className="ml-3">
        <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{role}</p>
      </div>
    </div>
    <div className="mb-3">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className="w-4 h-4 inline-block text-yellow-400"
          fill="#FBBF24"
        />
      ))}
    </div>
    <p className="text-gray-600 dark:text-gray-300 italic">{testimonial}</p>
  </div>
);

export default function ThinkFuelLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Track visitor when page loads
    trackVisitor();
  }, []);

  const loginpage = () => {
    router.push("/login");
  };
  const signuppage = () => {
    router.push("/signup");
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "subscribers"), {
        email,
        subscribedAt: serverTimestamp(),
      });

      toast.success("Thank you for subscribing!");
      setEmail("");
    } catch (error) {
      console.error("Error adding subscriber:", error);
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <GradientCursor />

      {/* Header + Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white">
                <Lightbulb className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                ThinkFuel
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium"
              >
                Testimonials
              </a>
              <a
                href="#faq"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium"
              >
                FAQ
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button variant="outline" onClick={signuppage}>
                Sign In
              </Button>
              <Button onClick={loginpage}>Get Started</Button>
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 dark:text-gray-300"
              >
                {isMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 space-y-3">
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium py-2"
              >
                Features
              </a>
              <a
                href="#pricing"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium py-2"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium py-2"
              >
                Testimonials
              </a>
              <a
                href="#faq"
                onClick={() => setIsMenuOpen(false)}
                className="block text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 font-medium py-2"
              >
                FAQ
              </a>
              <div className="pt-3 space-y-3">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
                <Button className="w-full">Get Started</Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 relative">
        {/* Abstract Shapes */}
        <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-br from-indigo-50 via-transparent to-purple-50 dark:from-indigo-950/40 dark:via-transparent dark:to-purple-950/40" />
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-200/30 dark:bg-indigo-900/10 blur-3xl" />
        <div className="absolute  top-20 right-0 w-80 h-80 rounded-full bg-purple-200/30 dark:bg-purple-900/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Transform Your Ideas Into Reality
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto">
              The all-in-one platform for capturing, organizing, and developing
              your ideas with
              <span className="relative whitespace-nowrap mx-1">
                <span className="relative z-10">AI-powered assistance</span>
                <span className="absolute bottom-0 left-0 right-0 h-3 bg-indigo-200/50 dark:bg-indigo-900/50 -z-10 transform -rotate-1"></span>
              </span>
            </p>
            <div className="flex flex-col  sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={loginpage}>
                Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="secondary" size="lg">
                <a href="#how-it-works" className="flex flex-row">
                  See How It Works <ArrowUpRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="mt-10 text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
              <span className="mx-2">•</span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>14-day free trial</span>
              <span className="mx-2">•</span>
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Cancel anytime</span>
            </div>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent z-10  bottom-0"></div>
            <div className="relative z-0 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/10 border border-gray-200 dark:border-gray-800">
              <img
                src="dashboard2.png"
                alt="ThinkFuel Platform Dashboard"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-600 dark:text-gray-400 font-medium mb-8">
            Trusted by innovative teams worldwide
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            {[
              "TechFlow Solutions",
              "InnovateLabs",
              "FutureWave Tech",
              "SmartMind Systems",
              "CreativeSpark",
            ].map((company) => (
              <div
                key={company}
                className="h-8 text-gray-400 dark:text-gray-600 font-semibold text-xl opacity-80 hover:opacity-100 transition-opacity"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-200/30 dark:bg-indigo-900/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Powerful Features for Ideas Management
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Everything you need to capture, organize, and develop your ideas
              in one place
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI Idea Generator"
              description="Generate innovative ideas with our advanced AI system that understands your context and goals."
            />
            <FeatureCard
              icon={Sparkles}
              title="Rich Text Editor"
              description="Powerful rich text editor with formatting, media embedding, and real-time collaboration."
            />
            <FeatureCard
              icon={LockIcon}
              title="AI Potential Checker"
              description="Evaluate your ideas' potential with AI-powered market analysis and feasibility assessment."
            />
            <FeatureCard
              icon={Share2}
              title="AI Market Research"
              description="Get instant market insights, competitor analysis, and trend predictions for your ideas."
            />
            <FeatureCard
              icon={Plus}
              title="AI Idea Chat"
              description="Have natural conversations with AI about your ideas to refine and develop them further."
            />
            <FeatureCard
              icon={ArrowUpRight}
              title="AI Brand Kit Maker"
              description="Automatically generate brand identities, logos, and style guides for your ideas."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section
        id="how-it-works"
        className="py-24 bg-white dark:bg-gray-900 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              How ThinkFuel Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A simple yet powerful workflow to help you bring your ideas to
              life
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6 text-xl font-bold">
                1
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Capture & Generate
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Use our AI-powered tools to capture existing ideas or generate
                new ones with our advanced AI system.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6 text-xl font-bold">
                2
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Develop & Research
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Refine your ideas with AI assistance, conduct market research,
                and evaluate potential with our tools.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 mb-6 text-xl font-bold">
                3
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Execute & Brand
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create brand identities, export your ideas, and prepare them for
                implementation with our comprehensive toolkit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 relative">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-purple-200/30 dark:bg-purple-900/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of creative thinkers who are already using
              ThinkFuel
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              avatar="JD"
              name="John Doe"
              role="Product Designer"
              testimonial="ThinkFuel has revolutionized how I manage my design ideas. The AI features are incredibly helpful for expanding on my initial concepts."
            />
            <TestimonialCard
              avatar="SL"
              name="Sarah Lin"
              role="Entrepreneur"
              testimonial="As a startup founder, I'm constantly juggling dozens of ideas. ThinkFuel helps me keep everything organized and prioritized."
            />
            <TestimonialCard
              avatar="MR"
              name="Michael Rodriguez"
              role="Creative Director"
              testimonial="The collaboration features allow my team to build on each other's ideas seamlessly. It's become an essential part of our creative process."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              During our testing phase, all users get access to our Pro plan
              features for free!
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 overflow-hidden shadow-xl shadow-indigo-500/25">
              <div className="p-8">
                <h3 className="text-lg font-medium text-indigo-100 mb-2">
                  Pro Plan
                </h3>
                <div className="flex items-baseline mb-6">
                  <span className="text-5xl font-bold text-white">$0</span>
                  <span className="text-indigo-200 ml-2">/month</span>
                </div>
                <p className="text-indigo-100 mb-6">
                  Unlock the full potential of ThinkFuel with all premium
                  features.
                </p>
                <Button
                  variant="secondary"
                  onClick={signuppage}
                  className="w-full mb-6 bg-white text-indigo-600 hover:bg-gray-100"
                >
                  Start Free Trial
                </Button>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">AI Idea Generation</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Rich Text Editor</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">AI Market Research</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">AI Brand Kit Maker</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">
                      Export to Multiple Formats
                    </span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-indigo-200 mt-0.5 mr-3 flex-shrink-0" />
                    <span className="text-white">Priority Support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Everything you need to know about ThinkFuel
            </p>
          </div>

          <div className="space-y-6">
            <FAQItem
              question="What is ThinkFuel?"
              answer="ThinkFuel is an AI-powered platform for capturing, organizing, and developing ideas. It combines modern web technologies with artificial intelligence to help individuals and teams manage their creative process."
            />
            <FAQItem
              question="How does the AI feature work?"
              answer="Our AI analyzes your ideas and provides suggestions, improvements, and related concepts based on your input. It uses natural language processing and machine learning to understand the context of your ideas and generate relevant recommendations."
            />
            <FAQItem
              question="Can I use ThinkFuel with my team?"
              answer="Absolutely! ThinkFuel offers robust collaboration features that allow you to share ideas with team members, assign permissions, and work together in real-time. The Pro plan includes advanced collaboration tools designed specifically for teams."
            />
            <FAQItem
              question="Is my data secure?"
              answer="Yes, we take security very seriously. ThinkFuel uses enterprise-grade encryption to protect your data, and we never share your ideas with third parties. All data is stored in secure cloud environments with regular backups."
            />
            <FAQItem
              question="Can I export my ideas?"
              answer="Yes, ThinkFuel allows you to export your ideas in multiple formats including PDF, Markdown, and plain text. This makes it easy to use your ideas in other tools or share them with people who don't use ThinkFuel."
            />
            <FAQItem
              question="What if I need help?"
              answer="We offer comprehensive support through our help center, email support, and live chat. Pro users get priority support with faster response times."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Fuel Your Next Big Idea?
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto opacity-90">
            Join ThinkFuel today and experience the future of idea management.
            Get started with our free trial and unlock your creative potential.
          </p>
          <Button
            variant="secondary"
            size="lg"
            onClick={signuppage}
            className="bg-white text-indigo-600 hover:bg-gray-100 shadow-lg"
          >
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Column 1: Brand & About */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-600 text-white">
                  <Lightbulb className="h-5 w-5" />
                </span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  ThinkFuel
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Transforming ideas into reality with AI-powered assistance.
              </p>
            </div>
            {/* Column 2: Product */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Product
              </h5>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#features"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-sm"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-sm"
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-sm"
                  >
                    How It Works
                  </a>
                </li>
              </ul>
            </div>
            {/* Column 3: Contact */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Contact Us
              </h5>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:dhairyadarji025@gmail.com"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-sm flex items-center"
                  >
                    <Mail className="h-4 w-4 mr-2" /> dhairyadarji025@gmail.com
                  </a>
                </li>
                {/* <li>
                  <a
                    href="tel:+1234567890"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-sm flex items-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" /> +1 (234) 567-890
                  </a>
                </li> */}
                {/* <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-sm flex items-center"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" /> Support Center
                  </a>
                </li> */}
              </ul>
            </div>
            {/* Column 4: Newsletter */}
            <div>
              <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Stay Updated
              </h5>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                Subscribe to our newsletter for the latest updates and features.
              </p>
              <form className="space-y-2" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="submit" className="w-full">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              © {new Date().getFullYear()} ThinkFuel. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-sm"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400 text-sm"
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
