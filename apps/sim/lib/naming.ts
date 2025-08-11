/**
 * Utility functions for generating names for all entities (workspaces, folders, workflows)
 */

import type { WorkflowFolder } from "@/stores/folders/store";
import type { Workspace } from "@/stores/organization/types";

export interface NameableEntity {
  name: string;
}

interface WorkspacesApiResponse {
  workspaces: Workspace[];
}

interface FoldersApiResponse {
  folders: WorkflowFolder[];
}

const ADJECTIVES = [
  "可爱的",
  "萌萌的",
  "呆萌的",
  "憨厚的",
  "温顺的",
  "活泼的",
  "调皮的",
  "机灵的",
  "聪明的",
  "勇敢的",
  "威武的",
  "强壮的",
  "敏捷的",
  "灵活的",
  "迅速的",
  "矫健的",
  "优雅的",
  "高贵的",
  "神气的",
  "傲娇的",
  "霸气的",
  "帅气的",
  "英俊的",
  "漂亮的",
  "精致的",
  "娇小的",
  "庞大的",
  "巨大的",
  "迷你的",
  "圆滚滚的",
  "毛茸茸的",
  "软绵绵的",
  "胖乎乎的",
  "小巧的",
  "笨拙的",
  "笨重的",
  "轻盈的",
  "灵巧的",
  "敦厚的",
  "稳重的",
  "文静的",
  "安静的",
  "热情的",
  "友好的",
  "善良的",
  "乖巧的",
  "听话的",
  "顽皮的",
  "淘气的",
  "好动的",
  "活蹦乱跳的",
  "慢悠悠的",
  "悠闲的",
  "从容的",
  "沉稳的",
  "稳健的",
];

const NOUNS = [
  "霸王龙",
  "三角龙",
  "剑龙",
  "迅猛龙",
  "腕龙",
  "梁龙",
  "蛇颈龙",
  "甲龙",
  "棘龙",
  "异特龙",
  "双冠龙",
  "伤齿龙",
  "暴龙",
  "镰刀龙",
  "鸭嘴龙",
  "副栉龙",
  "禽龙",
  "始祖鸟",
  "蜿龙",
  "翼龙",
  "魔鬼蛙",
  "梁龙",
  "雷龙",
  "鲨齿龙",
  "棘龙",
  "盾龙",
  "角龙",
  "原角龙",
  "副角龙",
  "戟龙",
  "厚头龙",
  "鳄龙",
  "南方巨兽龙",
  "蛇颈龙",
  "梁龙",
  "腔骨龙",
  "剑龙",
  "甲龙",
  "棘龙",
  "异特龙",
  "双冠龙",
  "伤齿龙",
  "暴龙",
  "镰刀龙",
  "鸭嘴龙",
  "副栉龙",
  "禽龙",
  "始祖鸟",
  "蜿龙",
  "翼龙",
  "魔鬼蛙",
  "梁龙",
  "雷龙",
  "鲨齿龙",
  "棘龙",
  "盾龙",
  "角龙",
  "原角龙",
  "副角龙",
  "戟龙",
  "厚头龙",
  "鳄龙",
  "南方巨兽龙",
  "蛇颈龙",
  "梁龙",
  "腔骨龙",
  "剑龙",
  "甲龙",
  "棘龙",
  "异特龙",
  "双冠龙",
  "伤齿龙",
  "暴龙",
  "镰刀龙",
  "鸭嘴龙",
  "副栉龙",
];

/**
 * Generates the next incremental name for entities following pattern: "{prefix} {number}"
 *
 * @param existingEntities - Array of entities with name property
 * @param prefix - Prefix for the name (e.g., "Workspace", "Folder", "Subfolder")
 * @returns Next available name (e.g., "Workspace 3")
 */
export function generateIncrementalName<T extends NameableEntity>(
  existingEntities: T[],
  prefix: string
): string {
  // Create regex pattern for the prefix (e.g., /^Workspace (\d+)$/)
  const pattern = new RegExp(
    `^${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")} (\\d+)$`
  );

  // Extract numbers from existing entities that match the pattern
  const existingNumbers = existingEntities
    .map((entity) => entity.name.match(pattern))
    .filter((match) => match !== null)
    .map((match) => Number.parseInt(match![1], 10));

  // Find next available number (highest + 1, or 1 if none exist)
  const nextNumber =
    existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;

  return `${prefix} ${nextNumber}`;
}

/**
 * Generates the next workspace name
 */
export async function generateWorkspaceName(): Promise<string> {
  const response = await fetch("/api/workspaces");
  const data = (await response.json()) as WorkspacesApiResponse;
  const workspaces = data.workspaces || [];

  return generateIncrementalName(workspaces, "Workspace");
}

/**
 * Generates the next folder name for a workspace
 */
export async function generateFolderName(workspaceId: string): Promise<string> {
  const response = await fetch(`/api/folders?workspaceId=${workspaceId}`);
  const data = (await response.json()) as FoldersApiResponse;
  const folders = data.folders || [];

  // Filter to only root-level folders (parentId is null)
  const rootFolders = folders.filter((folder) => folder.parentId === null);

  return generateIncrementalName(rootFolders, "文件夹");
}

/**
 * Generates the next subfolder name for a parent folder
 */
export async function generateSubfolderName(
  workspaceId: string,
  parentFolderId: string
): Promise<string> {
  const response = await fetch(`/api/folders?workspaceId=${workspaceId}`);
  const data = (await response.json()) as FoldersApiResponse;
  const folders = data.folders || [];

  // Filter to only subfolders of the specified parent
  const subfolders = folders.filter(
    (folder) => folder.parentId === parentFolderId
  );

  return generateIncrementalName(subfolders, "Subfolder");
}

/**
 * Generates a creative workflow name using random adjectives and nouns
 * @returns A creative workflow name like "blazing-phoenix" or "crystal-dragon"
 */
export function generateCreativeWorkflowName(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective.toLowerCase()}-${noun.toLowerCase()}`;
}
