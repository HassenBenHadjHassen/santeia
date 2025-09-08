import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card";
import { Button } from "components/ui/button";
import { Header } from "components/layout/header";
import {
  Heart,
  MessageSquare,
  TrendingUp,
  Calendar,
  Activity,
  AlertCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router";

export function meta() {
  return [
    { title: "Dashboard - SantéAI" },
    { name: "description", content: "Your health dashboard and insights" },
  ];
}

export default function Dashboard() {
  // Mock data - in a real app, this would come from your backend
  const stats = {
    totalChats: 24,
    thisWeek: 5,
    healthScore: 85,
    lastActivity: "2 hours ago",
  };

  const recentInsights = [
    {
      id: 1,
      title: "Sleep Pattern Analysis",
      description: "Your sleep quality has improved by 15% this week",
      type: "positive",
      date: "2 days ago",
    },
    {
      id: 2,
      title: "Hydration Reminder",
      description:
        "Consider increasing your water intake during afternoon hours",
      type: "suggestion",
      date: "1 day ago",
    },
    {
      id: 3,
      title: "Exercise Consistency",
      description: "Great job maintaining your workout routine this month!",
      type: "positive",
      date: "3 days ago",
    },
  ];

  const quickActions = [
    {
      title: "Start New Chat",
      description: "Ask about symptoms or health concerns",
      icon: MessageSquare,
      href: "/chat",
      color: "bg-blue-500",
    },
    {
      title: "View Insights",
      description: "Check your health patterns and trends",
      icon: TrendingUp,
      href: "/insights",
      color: "bg-green-500",
    },
    {
      title: "Schedule Checkup",
      description: "Set reminders for health appointments",
      icon: Calendar,
      href: "/schedule",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="min-h-screen">
      <Header user={{ name: "John Doe", email: "john@example.com" }} />
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">
              Here's an overview of your health journey with SantéAI
            </p>
          </div>
          <Button asChild>
            <Link to="/chat">
              <Plus className="mr-2 h-4 w-4" />
              New Chat
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chats</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChats}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.thisWeek} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Health Score
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.healthScore}%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Last Activity
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.lastActivity}</div>
              <p className="text-xs text-muted-foreground">
                Active conversation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7/7</div>
              <p className="text-xs text-muted-foreground">
                Days of health tracking
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Insights</CardTitle>
              <CardDescription>
                AI-generated insights based on your conversations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentInsights.map((insight) => (
                <div key={insight.id} className="flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-full ${
                      insight.type === "positive"
                        ? "bg-green-100 text-green-600"
                        : insight.type === "suggestion"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    {insight.type === "positive" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : insight.type === "suggestion" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Heart className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.date}
                    </p>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full" asChild>
                <Link to="/insights">
                  View All Insights
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and features</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  asChild
                >
                  <Link to={action.href}>
                    <div
                      className={`p-2 rounded-full ${action.color} text-white mr-3`}
                    >
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Link>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Health Disclaimer */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800 dark:text-amber-200">
                  Important Health Disclaimer
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  SantéAI provides informational guidance only and is not a
                  substitute for professional medical advice. Always consult
                  with healthcare professionals for medical concerns, especially
                  for urgent symptoms.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
