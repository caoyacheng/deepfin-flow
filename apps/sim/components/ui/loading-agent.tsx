"use client";

export interface LoadingAgentProps {
  size?: "sm" | "md" | "lg";
}

export function LoadingAgent({ size = "md" }: LoadingAgentProps) {
  // 路径长度可以按文字长度估计，这里用 800，微调即可
  const pathLength = 800;

  const sizes = {
    sm: { width: 120, height: 32 },
    md: { width: 180, height: 48 },
    lg: { width: 240, height: 64 },
  };

  const { width, height } = sizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* 定义从左到右展开的剪裁区域 */}
      <defs>
        <clipPath id="reveal">
          <rect x="0" y="0" width="0" height={height}>
            <animate
              attributeName="width"
              from="0"
              to={width}
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
        </clipPath>
      </defs>
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        fontSize={height * 0.5}
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="bold"
        letterSpacing={2}
        fill="#2563eb"
        clipPath="url(#reveal)"
      >
        Loongflow
      </text>

      <style>
        {`
          @keyframes write {
            0%   { stroke-dashoffset: ${pathLength}; }
            100% { stroke-dashoffset: 0; }
          }
        `}
      </style>
    </svg>
  );
}
