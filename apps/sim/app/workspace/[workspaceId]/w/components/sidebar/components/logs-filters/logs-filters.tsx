"use client";

import FilterSection from "@/app/workspace/[workspaceId]/logs/components/filters/components/filter-section";
import FolderFilter from "@/app/workspace/[workspaceId]/logs/components/filters/components/folder";
import Level from "@/app/workspace/[workspaceId]/logs/components/filters/components/level";
import Timeline from "@/app/workspace/[workspaceId]/logs/components/filters/components/timeline";
import Trigger from "@/app/workspace/[workspaceId]/logs/components/filters/components/trigger";
import Workflow from "@/app/workspace/[workspaceId]/logs/components/filters/components/workflow";
import { ScrollArea } from "@/components/ui/scroll-area";

export function LogsFilters() {
  const sections = [
    { key: "timeline", title: "时间范围", component: <Timeline /> },
    { key: "level", title: "日志等级", component: <Level /> },
    { key: "trigger", title: "触发条件", component: <Trigger /> },
    { key: "folder", title: "文件夹", component: <FolderFilter /> },
    { key: "workflow", title: "工作流", component: <Workflow /> },
  ];

  return (
    <div className="h-full">
      <ScrollArea className="h-full" hideScrollbar={true}>
        <div className="space-y-4 px-3 py-3">
          {sections.map((section) => (
            <FilterSection
              key={section.key}
              title={section.title}
              content={section.component}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
