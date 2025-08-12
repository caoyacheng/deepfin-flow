"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "@/lib/auth-client";
import { createLogger } from "@/lib/logs/console/logger";
import { Check, Copy, KeySquare, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const logger = createLogger("ApiKeys");

interface ApiKeysProps {
  onOpenChange?: (open: boolean) => void;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsed?: string;
  createdAt: string;
  expiresAt?: string;
}

export function ApiKeys({ onOpenChange }: ApiKeysProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Fetch API keys
  const fetchApiKeys = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/users/me/api-keys");
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.keys || []);
      }
    } catch (error) {
      logger.error("Error fetching API keys:", { error });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate a new API key
  const handleCreateKey = async () => {
    if (!userId || !newKeyName.trim()) return;

    setIsCreating(true);
    try {
      const response = await fetch("/api/users/me/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Show the new key dialog with the API key (only shown once)
        setNewKey(data.key);
        setShowNewKeyDialog(true);
        // Reset form
        setNewKeyName("");
        // Refresh the keys list
        fetchApiKeys();
      }
    } catch (error) {
      logger.error("Error creating API key:", { error });
    } finally {
      setIsCreating(false);
    }
  };

  // Delete an API key
  const handleDeleteKey = async () => {
    if (!userId || !deleteKey) return;

    try {
      const response = await fetch(`/api/users/me/api-keys/${deleteKey.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the keys list
        fetchApiKeys();
        // Close the dialog
        setShowDeleteDialog(false);
        setDeleteKey(null);
      }
    } catch (error) {
      logger.error("Error deleting API key:", { error });
    }
  };

  // Copy API key to clipboard
  const copyToClipboard = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // Load API keys on mount
  useEffect(() => {
    if (userId) {
      fetchApiKeys();
    }
  }, [userId]);

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-xl">API Keys</h2>
        <Button
          onClick={() => setIsCreating(true)}
          disabled={isLoading}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          创建 API Key
        </Button>
      </div>

      <p className="text-muted-foreground text-sm leading-relaxed">
        API keys 用于身份验证和触发工作流。请妥善保管您的 API keys。它们
        具有访问您账户和工作流的权限。
      </p>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          <KeySkeleton />
          <KeySkeleton />
        </div>
      ) : apiKeys.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed p-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <KeySquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-medium text-lg">暂无 API Key</h3>
            <p className="mt-2 max-w-sm text-muted-foreground text-sm">
              您还没有创建任何 API Key。请点击下方按钮创建一个。
            </p>
            <Button
              variant="default"
              className="mt-4"
              onClick={() => setIsCreating(true)}
              size="sm"
            >
              <Plus className="mr-1.5 h-4 w-4" /> 创建 API Key
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {apiKeys.map((key) => (
            <Card
              key={key.id}
              className="p-4 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-base">{key.name}</h3>
                  <div className="flex items-center space-x-1">
                    <p className="text-muted-foreground text-xs">
                      创建时间: {formatDate(key.createdAt)} • 最后使用时间:{" "}
                      {formatDate(key.lastUsed)}
                    </p>
                    <div className="rounded bg-muted/50 px-1.5 py-0.5 font-mono text-xs">
                      •••••{key.key.slice(-6)}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setDeleteKey(key);
                    setShowDeleteDialog(true);
                  }}
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">删除 API Key</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create API Key Dialog */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建新的 API Key</DialogTitle>
            <DialogDescription>
              为您的 API Key 命名，以便稍后识别。此 Key
              具有访问您账户和工作流的权限。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="keyName">API Key 名称</Label>
              <Input
                id="keyName"
                placeholder="例如: 开发环境, 生产环境等"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="focus-visible:ring-primary"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              取消
            </Button>
            <Button onClick={handleCreateKey} disabled={!newKeyName.trim()}>
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New API Key Dialog */}
      <Dialog
        open={showNewKeyDialog}
        onOpenChange={(open) => {
          setShowNewKeyDialog(open);
          if (!open) setNewKey(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新的 API Key 已创建</DialogTitle>
            <DialogDescription>
              这是您唯一一次看到 API Key 的机会。请立即复制并妥善保管。
            </DialogDescription>
          </DialogHeader>
          {newKey && (
            <div className="space-y-4 py-3">
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="relative">
                  <Input
                    readOnly
                    value={newKey.key}
                    className="border-slate-300 bg-muted/50 pr-10 font-mono text-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="-translate-y-1/2 absolute top-1/2 right-1 h-7 w-7"
                    onClick={() => copyToClipboard(newKey.key)}
                  >
                    {copySuccess ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Copy to clipboard</span>
                  </Button>
                </div>
                <p className="mt-1 text-muted-foreground text-xs">
                  出于安全考虑，我们不会存储完整的密钥。您将无法再次查看它。
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-end">
            <Button
              onClick={() => {
                setShowNewKeyDialog(false);
                setNewKey(null);
              }}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>删除 API Key</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteKey && (
                <>
                  您确定要删除 API Key{" "}
                  <span className="font-semibold">{deleteKey.name}</span> 吗？
                  此操作无法撤销，并且任何使用此 API Key 的应用都将停止工作。
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:justify-end">
            <AlertDialogCancel onClick={() => setDeleteKey(null)}>
              取消
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteKey}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KeySkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="mb-2 h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </Card>
  );
}
