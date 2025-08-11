"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGeneralStore } from "@/stores/settings/general/store";
import { Info } from "lucide-react";
import { useEffect } from "react";

const TOOLTIPS = {
  telemetry: "我们收集匿名数据，了解功能使用情况、性能和错误，以改进产品。",
};

export function Privacy() {
  const isLoading = useGeneralStore((state) => state.isLoading);
  const telemetryEnabled = useGeneralStore((state) => state.telemetryEnabled);
  const setTelemetryEnabled = useGeneralStore(
    (state) => state.setTelemetryEnabled
  );
  const setTelemetryNotifiedUser = useGeneralStore(
    (state) => state.setTelemetryNotifiedUser
  );
  const loadSettings = useGeneralStore((state) => state.loadSettings);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleTelemetryToggle = (checked: boolean) => {
    setTelemetryEnabled(checked);

    if (checked) {
      setTelemetryNotifiedUser(true);

      if (typeof window !== "undefined") {
        fetch("/api/telemetry", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: "consent",
            action: "enable_from_settings",
            timestamp: new Date().toISOString(),
          }),
        }).catch(() => {
          // Silently fail - this is just telemetry
        });
      }
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h2 className="mb-[22px] font-medium text-lg">隐私设置</h2>
        <div className="space-y-4">
          {isLoading ? (
            <SettingRowSkeleton />
          ) : (
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="telemetry" className="font-medium">
                  允许匿名遥测数据收集
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 p-1 text-gray-500"
                      aria-label="Learn more about telemetry data collection"
                    >
                      <Info className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[300px] p-3">
                    <p className="text-sm">{TOOLTIPS.telemetry}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                id="telemetry"
                checked={telemetryEnabled}
                onCheckedChange={handleTelemetryToggle}
                disabled={isLoading}
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <p className="text-muted-foreground text-xs">
          我们使用 OpenTelemetry 收集匿名使用数据以改进产品。所有数据的收集都
          遵循我们的隐私政策，您可以随时选择退出。此设置
          将应用于您在所有设备上的帐户。
        </p>
      </div>
    </div>
  );
}

const SettingRowSkeleton = () => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center gap-2">
      <Skeleton className="h-5 w-48" />
    </div>
    <Skeleton className="h-6 w-12" />
  </div>
);
