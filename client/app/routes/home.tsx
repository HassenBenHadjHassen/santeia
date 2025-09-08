import { Link } from "react-router";
import { Button } from "components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Header } from "components/layout/header";
import {
  Heart,
  MessageSquare,
  BarChart3,
  Lightbulb,
  Shield,
  Users,
} from "lucide-react";

export function meta() {
  return [
    { title: "SantéAI - Your Personal Health Assistant" },
    {
      name: "description",
      content:
        "Get personalized health guidance through natural conversations with AI",
    },
  ];
}

export default function Home() {
  const features = [
    {
      icon: MessageSquare,
      title: "Natural Conversations",
      description:
        "Chat naturally about your health concerns without filling out forms or questionnaires.",
    },
    {
      icon: BarChart3,
      title: "Personalized Insights",
      description:
        "Get tailored health recommendations based on your conversation history and patterns.",
    },
    {
      icon: Shield,
      title: "Privacy & Safety",
      description:
        "Your health data is stored securely and our AI always encourages professional medical advice.",
    },
    {
      icon: Users,
      title: "Adaptive Learning",
      description:
        "The more you interact, the better SantéAI understands your unique health needs and preferences.",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-6 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <Heart className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Your Personal Health Assistant
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              SantéAI learns from every conversation to provide personalized
              health guidance. Chat naturally about symptoms, lifestyle, or
              health questions and get smarter insights over time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/chat">Try Demo Chat</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How SantéAI Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Unlike traditional health tools, SantéAI adapts to your
              communication style and learns from every interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary to-primary/80 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of users who trust SantéAI for personalized health
            guidance.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/signup">Create Your Account</Link>
          </Button>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-amber-50 dark:bg-amber-950">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">
              Important Health Disclaimer
            </h3>
            <p className="text-amber-700 dark:text-amber-300">
              SantéAI provides informational guidance only and is not a
              substitute for professional medical advice. Always consult with
              healthcare professionals for medical concerns, especially for
              urgent symptoms.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
