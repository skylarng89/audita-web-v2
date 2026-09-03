import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Route guards (blueprint Sprint 1, Task 1.7): global auth guard mirrors
// v1's auth.global.ts behaviour — session restore on first navigation, then
// redirect unauthenticated users to /auth/sign-in.

const routes: RouteRecordRaw[] = [
  {
    path: "/auth",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "sign-in",
        name: "sign-in",
        component: () => import("@/pages/auth/SignInPage.vue"),
      },
      {
        path: "forgot-password",
        name: "forgot-password",
        component: () => import("@/pages/auth/ForgotPasswordPage.vue"),
      },
      {
        path: "reset-password",
        name: "reset-password",
        component: () => import("@/pages/auth/ResetPasswordPage.vue"),
      },
      {
        path: "accept-invite",
        name: "accept-invite",
        component: () => import("@/pages/auth/AcceptInvitePage.vue"),
      },
    ],
  },
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        path: "",
        name: "dashboard",
        component: () => import("@/pages/DashboardPage.vue"),
      },
      {
        path: "change-requests",
        name: "cr-list",
        component: () =>
          import("@/pages/change-requests/ChangeRequestListPage.vue"),
      },
      {
        path: "change-requests/new",
        name: "cr-new",
        component: () =>
          import("@/pages/change-requests/ChangeRequestNewPage.vue"),
      },
      {
        path: "change-requests/:id",
        name: "cr-detail",
        component: () =>
          import("@/pages/change-requests/ChangeRequestDetailPage.vue"),
      },
      {
        path: "audit-trail",
        name: "audit-trail",
        component: () => import("@/pages/audit-trail/AuditTrailPage.vue"),
      },
      // Sprint 5 admin/platform pages mount here as they are implemented.
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    redirect: { name: "dashboard" },
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!auth.isAuthenticated) {
    await auth.restore();
  }
  const isAuthRoute = to.path.startsWith("/auth");
  if (!auth.isAuthenticated && !isAuthRoute) {
    return { name: "sign-in", query: { redirect: to.fullPath } };
  }
  if (auth.isAuthenticated && isAuthRoute) {
    return { name: "dashboard" };
  }
  return true;
});
