"use client";

import { DeployModal } from "@/app/workspace/[workspaceId]/w/[workflowId]/components/control-bar/components";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { WorkspaceUserPermissions } from "@/hooks/use-user-permissions";
import { cn } from "@/lib/utils";
import { useWorkflowRegistry } from "@/stores/workflows/registry/store";
import type { WorkflowState } from "@/stores/workflows/workflow/types";
import { Loader2, Rocket } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface DeploymentControlsProps {
  activeWorkflowId: string | null;
  needsRedeployment: boolean;
  setNeedsRedeployment: (value: boolean) => void;
  deployedState: WorkflowState | null;
  isLoadingDeployedState: boolean;
  refetchDeployedState: () => Promise<void>;
  userPermissions: WorkspaceUserPermissions;
}

export function DeploymentControls({
  activeWorkflowId,
  needsRedeployment,
  setNeedsRedeployment,
  deployedState,
  isLoadingDeployedState,
  refetchDeployedState,
  userPermissions,
}: DeploymentControlsProps) {
  const deploymentStatus = useWorkflowRegistry((state) =>
    state.getWorkflowDeploymentStatus(activeWorkflowId)
  );
  const isDeployed = deploymentStatus?.isDeployed || false;

  const workflowNeedsRedeployment = needsRedeployment;

  const [isDeploying, _setIsDeploying] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const lastWorkflowIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (activeWorkflowId !== lastWorkflowIdRef.current) {
      lastWorkflowIdRef.current = activeWorkflowId;
    }
  }, [activeWorkflowId]);

  const refetchWithErrorHandling = async () => {
    if (!activeWorkflowId) return;

    try {
      await refetchDeployedState();
    } catch (error) {}
  };

  const canDeploy = userPermissions.canAdmin;
  const isDisabled = isDeploying || !canDeploy;

  const handleDeployClick = useCallback(() => {
    if (canDeploy) {
      setIsModalOpen(true);
    }
  }, [canDeploy, setIsModalOpen]);

  const getTooltipText = () => {
    if (!canDeploy) {
      return "管理员权限才能部署工作流";
    }
    if (isDeploying) {
      return "部署中...";
    }
    if (isDeployed && workflowNeedsRedeployment) {
      return "工作流有变更";
    }
    if (isDeployed) {
      return "部署设置";
    }
    return "部署为API";
  };

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="relative">
            <Button
              variant="outline"
              onClick={handleDeployClick}
              disabled={isDisabled}
              className={cn(
                "h-12 w-12 rounded-[11px] border-[hsl(var(--card-border))] bg-[hsl(var(--card-background))] text-[hsl(var(--card-text))] shadow-xs",
                "hover:border-[#701FFC] hover:bg-[#701FFC] hover:text-white",
                "transition-all duration-200",
                isDeployed && "text-[#802FFF]",
                isDisabled &&
                  "cursor-not-allowed opacity-50 hover:border-[hsl(var(--card-border))] hover:bg-[hsl(var(--card-background))] hover:text-[hsl(var(--card-text))] hover:shadow-xs"
              )}
            >
              {isDeploying ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Rocket className="h-5 w-5" />
              )}
              <span className="sr-only">Deploy API</span>
            </Button>

            {isDeployed && workflowNeedsRedeployment && (
              <div className="pointer-events-none absolute right-2 bottom-2 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 h-[6px] w-[6px] animate-ping rounded-full bg-amber-500/50" />
                  <div className="zoom-in fade-in relative h-[6px] w-[6px] animate-in rounded-full bg-amber-500/80 duration-300" />
                </div>
                <span className="sr-only">有变更</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>{getTooltipText()}</TooltipContent>
      </Tooltip>

      <DeployModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        workflowId={activeWorkflowId}
        needsRedeployment={workflowNeedsRedeployment}
        setNeedsRedeployment={setNeedsRedeployment}
        deployedState={deployedState as WorkflowState}
        isLoadingDeployedState={isLoadingDeployedState}
        refetchDeployedState={refetchWithErrorHandling}
      />
    </>
  );
}
