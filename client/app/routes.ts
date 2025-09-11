import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/chat.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("profile", "routes/profile.tsx"),
  route("onboarding", "routes/onboarding.tsx"),
] satisfies RouteConfig;
