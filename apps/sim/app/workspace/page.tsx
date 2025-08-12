"use client";

import { LoadingAgent } from "@/components/ui/loading-agent";
import { useSession } from "@/lib/auth-client";
import { createLogger } from "@/lib/logs/console/logger";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const logger = createLogger("WorkspacePage");

export default function WorkspacePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const redirectToFirstWorkspace = async () => {
      // Wait for session to load
      if (isPending) {
        return;
      }

      // If user is not authenticated, redirect to login
      if (!session?.user) {
        logger.info("用户未认证，正在重定向到登录页面");
        router.replace("/login");
        return;
      }

      try {
        // Check if we need to redirect a specific workflow from old URL format
        const urlParams = new URLSearchParams(window.location.search);
        const redirectWorkflowId = urlParams.get("redirect_workflow");

        if (redirectWorkflowId) {
          // Try to get the workspace for this workflow
          try {
            const workflowResponse = await fetch(
              `/api/workflows/${redirectWorkflowId}`
            );
            if (workflowResponse.ok) {
              const workflowData = await workflowResponse.json();
              const workspaceId = workflowData.data?.workspaceId;

              if (workspaceId) {
                logger.info(
                  `Redirecting workflow ${redirectWorkflowId} to workspace ${workspaceId}`
                );
                router.replace(
                  `/workspace/${workspaceId}/w/${redirectWorkflowId}`
                );
                return;
              }
            }
          } catch (error) {
            logger.error("获取重定向工作流的工作空间时出错:", error);
          }
        }

        // Fetch user's workspaces
        const response = await fetch("/api/workspaces");

        if (!response.ok) {
          throw new Error("获取用户工作空间失败");
        }

        const data = await response.json();
        const workspaces = data.workspaces || [];

        if (workspaces.length === 0) {
          logger.warn("用户没有工作空间，正在创建默认工作空间");

          try {
            const createResponse = await fetch("/api/workspaces", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: "My Workspace" }),
            });

            if (createResponse.ok) {
              const createData = await createResponse.json();
              const newWorkspace = createData.workspace;

              if (newWorkspace?.id) {
                logger.info(`默认工作空间创建成功: ${newWorkspace.id}`);
                router.replace(`/workspace/${newWorkspace.id}/w`);
                return;
              }
            }

            logger.error("创建默认工作空间失败");
          } catch (createError) {
            logger.error("创建默认工作空间时出错:", createError);
          }

          // If we can't create a workspace, redirect to login to reset state
          router.replace("/login");
          return;
        }

        // Get the first workspace (they should be ordered by most recent)
        const firstWorkspace = workspaces[0];
        logger.info(`正在重定向到第一个工作空间: ${firstWorkspace.id}`);

        // Redirect to the first workspace
        router.replace(`/workspace/${firstWorkspace.id}/w`);
      } catch (error) {
        logger.error("获取用户工作空间时出错:", error);
        // Don't redirect if there's an error - let the user stay on the page
      }
    };

    // Only run this logic when we're at the root /workspace path
    // If we're already in a specific workspace, the children components will handle it
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/workspace"
    ) {
      redirectToFirstWorkspace();
    }
  }, [session, isPending, router]);

  // Show loading state while we determine where to redirect
  if (isPending) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center align-middle">
          <LoadingAgent size="lg" />
        </div>
      </div>
    );
  }

  // If user is not authenticated, show nothing (redirect will happen)
  if (!session?.user) {
    return null;
  }

  return null;
}
