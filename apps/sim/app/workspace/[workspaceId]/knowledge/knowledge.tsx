"use client";

import {
  BaseOverview,
  CreateModal,
  EmptyStateCard,
  KnowledgeBaseCardSkeletonGrid,
  KnowledgeHeader,
  PrimaryButton,
  SearchInput,
} from "@/app/workspace/[workspaceId]/knowledge/components";
import { useUserPermissionsContext } from "@/app/workspace/[workspaceId]/providers/workspace-permissions-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useKnowledgeBasesList } from "@/hooks/use-knowledge";
import type { KnowledgeBaseData } from "@/stores/knowledge/store";
import { LibraryBig, Plus } from "lucide-react";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

interface KnowledgeBaseWithDocCount extends KnowledgeBaseData {
  docCount?: number;
}

export function Knowledge() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { knowledgeBases, isLoading, error, addKnowledgeBase, refreshList } =
    useKnowledgeBasesList(workspaceId);
  const userPermissions = useUserPermissionsContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleKnowledgeBaseCreated = (newKnowledgeBase: KnowledgeBaseData) => {
    addKnowledgeBase(newKnowledgeBase);
  };

  const handleRetry = () => {
    refreshList();
  };

  const filteredKnowledgeBases = useMemo(() => {
    if (!searchQuery.trim()) return knowledgeBases;

    const query = searchQuery.toLowerCase();
    return knowledgeBases.filter(
      (kb) =>
        kb.name.toLowerCase().includes(query) ||
        kb.description?.toLowerCase().includes(query)
    );
  }, [knowledgeBases, searchQuery]);

  const formatKnowledgeBaseForDisplay = (kb: KnowledgeBaseWithDocCount) => ({
    id: kb.id,
    title: kb.name,
    docCount: kb.docCount || 0,
    description: kb.description || "未提供描述",
  });

  const breadcrumbs = [{ id: "knowledge", label: "Knowledge" }];

  return (
    <>
      <div className="flex h-screen flex-col pl-64">
        {/* Header */}
        <KnowledgeHeader breadcrumbs={breadcrumbs} />

        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 overflow-auto">
              <div className="px-6 pb-6">
                {/* Search and Create Section */}
                <div className="mb-4 flex items-center justify-between pt-1">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder="搜索知识库"
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <PrimaryButton
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={userPermissions.canEdit !== true}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>创建知识库</span>
                      </PrimaryButton>
                    </TooltipTrigger>
                    {userPermissions.canEdit !== true && (
                      <TooltipContent>
                        需要写入权限才能创建知识库
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>

                {/* Error State */}
                {error && (
                  <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
                    <p className="text-red-800 text-sm">
                      Error loading knowledge bases: {error}
                    </p>
                    <button
                      onClick={handleRetry}
                      className="mt-2 text-red-600 text-sm underline hover:text-red-800"
                    >
                      重试
                    </button>
                  </div>
                )}

                {/* Content Area */}
                {isLoading ? (
                  <KnowledgeBaseCardSkeletonGrid count={8} />
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredKnowledgeBases.length === 0 ? (
                      knowledgeBases.length === 0 ? (
                        <EmptyStateCard
                          title="创建您的第一个知识库"
                          description={
                            userPermissions.canEdit === true
                              ? "上传您的文档以创建知识库。"
                              : "知识库将出现在这里。请联系管理员创建知识库。"
                          }
                          buttonText={
                            userPermissions.canEdit === true
                              ? "创建知识库"
                              : "联系管理员"
                          }
                          onClick={
                            userPermissions.canEdit === true
                              ? () => setIsCreateModalOpen(true)
                              : () => {}
                          }
                          icon={
                            <LibraryBig className="h-4 w-4 text-muted-foreground" />
                          }
                        />
                      ) : (
                        <div className="col-span-full py-12 text-center">
                          <p className="text-muted-foreground">
                            没有匹配您搜索的知识库。
                          </p>
                        </div>
                      )
                    ) : (
                      filteredKnowledgeBases.map((kb) => {
                        const displayData = formatKnowledgeBaseForDisplay(
                          kb as KnowledgeBaseWithDocCount
                        );
                        return (
                          <BaseOverview
                            key={kb.id}
                            id={displayData.id}
                            title={displayData.title}
                            docCount={displayData.docCount}
                            description={displayData.description}
                          />
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <CreateModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onKnowledgeBaseCreated={handleKnowledgeBaseCreated}
      />
    </>
  );
}
