import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/dashboard.tsx"),
  route("chat", "routes/chat.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("profile", "routes/profile.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
  route("diary", "routes/diary.tsx"),
  route("medications", "routes/medications.tsx"),
  route("export", "routes/export.tsx"),
] satisfies RouteConfig;
