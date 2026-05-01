export const figmaFrameMap = {
  home: { nodeId: "1:6437", route: "/" },
  suppliersList: { nodeId: "1:7144", route: "/marketplace" },
  supplierProfile: { nodeId: "1:6920", route: "/marketplace/[supplierId]" },
  aiPlanner: { nodeId: "1:6363", route: "/ai-planner" },
  jobsListUser: { nodeId: "1:2777", route: "/jobs" },
  jobsListSupplier: { nodeId: "1:2950", route: "/jobs" },
  jobsPublish: { nodeId: "1:2690", route: "/jobs/publish" },
  userLogin: { nodeId: "1:1565", route: "/auth/login" },
  userRegister: { nodeId: "1:1502", route: "/auth/register" },
  adminDashboard: { nodeId: "1:4491", route: "/admin" },
  supplierDashboard: { nodeId: "1:13", route: "/supplier/dashboard" },
  notificationsOverlay: { nodeId: "1:617", route: "/notifications" },
} as const;
