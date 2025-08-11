import type { AuthType } from "@/app/workspace/[workspaceId]/w/[workflowId]/components/control-bar/components/deploy-modal/components/chat-deploy/hooks/use-chat-form";
import { Button, Card, CardContent, Input, Label } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  Check,
  Copy,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";

interface AuthSelectorProps {
  authType: AuthType;
  password: string;
  emails: string[];
  onAuthTypeChange: (type: AuthType) => void;
  onPasswordChange: (password: string) => void;
  onEmailsChange: (emails: string[]) => void;
  disabled?: boolean;
  isExistingChat?: boolean;
  error?: string;
}

export function AuthSelector({
  authType,
  password,
  emails,
  onAuthTypeChange,
  onPasswordChange,
  onEmailsChange,
  disabled = false,
  isExistingChat = false,
  error,
}: AuthSelectorProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=";
    let result = "";
    const length = 24;

    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    onPasswordChange(result);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleAddEmail = () => {
    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail) &&
      !newEmail.startsWith("@")
    ) {
      setEmailError(
        "Please enter a valid email or domain (e.g., user@example.com or @example.com)"
      );
      return;
    }

    if (emails.includes(newEmail)) {
      setEmailError("This email or domain is already in the list");
      return;
    }

    onEmailsChange([...emails, newEmail]);
    setNewEmail("");
    setEmailError("");
  };

  const handleRemoveEmail = (email: string) => {
    onEmailsChange(emails.filter((e) => e !== email));
  };

  return (
    <div className="space-y-2">
      <Label className="font-medium text-sm">访问控制</Label>

      {/* Auth Type Selection */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {(["public", "password", "email"] as const).map((type) => (
          <Card
            key={type}
            className={cn(
              "cursor-pointer overflow-hidden shadow-none transition-colors hover:bg-accent/30",
              authType === type
                ? "border border-muted-foreground hover:bg-accent/50"
                : "border border-input"
            )}
          >
            <CardContent className="relative flex flex-col items-center justify-center p-4 text-center">
              <button
                type="button"
                className="absolute inset-0 z-10 h-full w-full cursor-pointer"
                onClick={() => !disabled && onAuthTypeChange(type)}
                aria-label={`Select ${type} access`}
                disabled={disabled}
              />
              <div className="justify-center text-center align-middle">
                <h3 className="font-medium text-sm">
                  {type === "public" && "公开访问"}
                  {type === "password" && "密码保护"}
                  {type === "email" && "电子邮件访问"}
                </h3>
                <p className="text-muted-foreground text-xs">
                  {type === "public" && "对所有人公开，包括未登录用户"}
                  {type === "password" && "仅允许已授权用户访问"}
                  {type === "email" && "仅允许指定电子邮件访问"}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Auth Settings */}
      {authType === "password" && (
        <Card className="shadow-none">
          <CardContent className="p-4">
            <h3 className="mb-2 font-medium text-sm">Password Settings</h3>

            {isExistingChat && !password && (
              <div className="mb-2 flex items-center text-muted-foreground text-xs">
                <div className="mr-2 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  密码已设置
                </div>
                <span>当前密码已安全存储</span>
              </div>
            )}

            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder={
                  isExistingChat ? "输入新密码（留空保持当前密码）" : "输入密码"
                }
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                disabled={disabled}
                className="pr-28"
                required={!isExistingChat}
                autoComplete="new-password"
              />
              <div className="absolute top-0 right-0 flex h-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={generatePassword}
                  disabled={disabled}
                  className="px-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Generate password</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(password)}
                  disabled={!password || disabled}
                  className="px-2"
                >
                  {copySuccess ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">复制密码</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={disabled}
                  className="px-2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "隐藏密码" : "显示密码"}
                  </span>
                </Button>
              </div>
            </div>

            <p className="mt-2 text-muted-foreground text-xs">
              {isExistingChat
                ? "留空保持当前密码，输入新密码以更改密码。"
                : "这将是访问您的聊天的密码。"}
            </p>
          </CardContent>
        </Card>
      )}

      {authType === "email" && (
        <Card className="shadow-none">
          <CardContent className="p-4">
            <h3 className="mb-2 font-medium text-sm">Email Access Settings</h3>

            <div className="flex gap-2">
              <Input
                placeholder="user@example.com or @domain.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={disabled}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddEmail();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddEmail}
                disabled={!newEmail.trim() || disabled}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {emailError && (
              <p className="mt-1 text-destructive text-sm">{emailError}</p>
            )}

            {emails.length > 0 && (
              <div className="mt-3 max-h-[150px] overflow-y-auto rounded-md border bg-background px-2 py-0 shadow-none">
                <ul className="divide-y divide-border">
                  {emails.map((email) => (
                    <li key={email} className="relative">
                      <div className="group my-1 flex items-center justify-between rounded-sm px-2 py-2 text-sm">
                        <span className="font-medium text-foreground">
                          {email}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveEmail(email)}
                          disabled={disabled}
                          className="h-7 w-7 opacity-70"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-2 text-muted-foreground text-xs">
              添加特定的电子邮件地址或整个域名（@example.com）
            </p>
          </CardContent>
        </Card>
      )}

      {authType === "public" && (
        <Card className="shadow-none">
          <CardContent className="p-4">
            <h3 className="mb-2 font-medium text-sm">公开访问设置</h3>
            <p className="text-muted-foreground text-xs">
              此聊天将对所有人公开，包括未登录用户。
            </p>
          </CardContent>
        </Card>
      )}

      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}
