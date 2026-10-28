"use client";

import { useState } from "react";

const TOOLS = [
  { key: "json", label: "JSON 정리" },
  { key: "base64", label: "Base64" },
  { key: "url", label: "URL 인코딩" },
  { key: "hash", label: "해시 생성" },
  { key: "uuid", label: "UUID 생성" },
  { key: "time", label: "타임스탬프" },
] as const;

type ToolKey = (typeof TOOLS)[number]["key"];

export default function DevTools() {
  const [tool, setTool] = useState<ToolKey>("json");

  return (
    <div>
      <div role="tablist" className="mb-5 flex flex-wrap gap-1.5">
        {TOOLS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tool === t.key}
            onClick={() => setTool(t.key)}
            className={`btn btn-sm ${tool === t.key ? "btn-primary" : "btn-secondary"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tool === "json" && <JsonTool />}
      {tool === "base64" && <TransformTool encode={encodeBase64} decode={decodeBase64} />}
      {tool === "url" && <TransformTool encode={encodeURIComponent} decode={decodeURIComponent} />}
      {tool === "hash" && <HashTool />}
      {tool === "uuid" && <UuidTool />}
      {tool === "time" && <TimeTool />}
    </div>
  );
}

function encodeBase64(text: string) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

function decodeBase64(text: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(text.trim()), (c) => c.charCodeAt(0)));
}

function Output({ value, error }: { value: string; error?: string }) {
  const [copied, setCopied] = useState(false);
  if (error) return <p className="text-sm text-danger">{error}</p>;
  return (
    <div className="relative">
      <textarea readOnly value={value} rows={8} aria-label="결과" className="input font-mono text-xs" />
      {value && (
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="btn btn-secondary btn-sm absolute top-2 right-2 bg-background"
        >
          {copied ? "복사됨" : "복사"}
        </button>
      )}
    </div>
  );
}

function JsonTool() {
  const [input, setInput] = useState('{"hello":"world","items":[1,2,3]}');
  const [indent, setIndent] = useState(2);

  let output = "";
  let error: string | undefined;
  try {
    output = input.trim() ? JSON.stringify(JSON.parse(input), null, indent || undefined) : "";
  } catch (e) {
    error = `JSON 형식 오류: ${(e as Error).message}`;
  }

  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={8}
        aria-label="JSON 입력"
        className="input font-mono text-xs"
      />
      <div className="flex gap-1.5 text-sm">
        {[
          { value: 2, label: "2칸 들여쓰기" },
          { value: 4, label: "4칸 들여쓰기" },
          { value: 0, label: "한 줄로 압축" },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setIndent(opt.value)}
            className={`btn btn-sm ${indent === opt.value ? "btn-primary" : "btn-secondary"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <Output value={output} error={error} />
    </div>
  );
}

function TransformTool({
  encode,
  decode,
}: {
  encode: (text: string) => string;
  decode: (text: string) => string;
}) {
  const [input, setInput] = useState("안녕하세요, Next.js!");
  const [mode, setMode] = useState<"encode" | "decode">("encode");

  let output = "";
  let error: string | undefined;
  try {
    output = mode === "encode" ? encode(input) : decode(input);
  } catch {
    error = "입력값을 변환할 수 없습니다. 올바른 형식인지 확인하세요.";
  }

  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        aria-label="입력"
        className="input font-mono text-xs"
      />
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => setMode("encode")}
          className={`btn btn-sm ${mode === "encode" ? "btn-primary" : "btn-secondary"}`}
        >
          인코딩
        </button>
        <button
          type="button"
          onClick={() => setMode("decode")}
          className={`btn btn-sm ${mode === "decode" ? "btn-primary" : "btn-secondary"}`}
        >
          디코딩
        </button>
        <button
          type="button"
          onClick={() => {
            if (!error) setInput(output);
            setMode(mode === "encode" ? "decode" : "encode");
          }}
          className="btn btn-sm btn-secondary"
        >
          결과를 입력으로 ↔
        </button>
      </div>
      <Output value={output} error={error} />
    </div>
  );
}

function HashTool() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState("SHA-256");
  const [output, setOutput] = useState("");

  async function run() {
    const digest = await crypto.subtle.digest(algorithm, new TextEncoder().encode(input));
    setOutput(Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join(""));
  }

  return (
    <div className="space-y-3">
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        rows={5}
        placeholder="해시할 텍스트를 입력하세요"
        aria-label="입력"
        className="input font-mono text-xs"
      />
      <div className="flex gap-2">
        <select
          value={algorithm}
          onChange={(e) => setAlgorithm(e.target.value)}
          aria-label="알고리즘"
          className="input w-40"
        >
          <option>SHA-1</option>
          <option>SHA-256</option>
          <option>SHA-384</option>
          <option>SHA-512</option>
        </select>
        <button type="button" onClick={run} className="btn btn-primary">
          생성
        </button>
      </div>
      <Output value={output} />
    </div>
  );
}

function UuidTool() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="number"
          min={1}
          max={100}
          value={count}
          onChange={(e) => setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))}
          aria-label="개수"
          className="input w-24"
        />
        <button
          type="button"
          onClick={() => setUuids(Array.from({ length: count }, () => crypto.randomUUID()))}
          className="btn btn-primary"
        >
          UUID v4 생성
        </button>
      </div>
      <Output value={uuids.join("\n")} />
    </div>
  );
}

function TimeTool() {
  const [input, setInput] = useState("");

  const trimmed = input.trim();
  let date: Date | null = null;
  if (/^\d+$/.test(trimmed)) {
    // 10자리 이하면 초 단위, 그보다 길면 밀리초 단위로 봅니다.
    date = new Date(trimmed.length <= 10 ? Number(trimmed) * 1000 : Number(trimmed));
  } else if (trimmed) {
    date = new Date(trimmed);
  }
  const valid = date && !Number.isNaN(date.getTime());

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="유닉스 타임스탬프 또는 날짜 (예: 1700000000, 2026-01-01T09:00)"
          aria-label="타임스탬프 또는 날짜"
          className="input font-mono"
        />
        <button
          type="button"
          onClick={() => setInput(String(Math.floor(Date.now() / 1000)))}
          className="btn btn-secondary"
        >
          현재 시각
        </button>
      </div>
      {trimmed && !valid && <p className="text-sm text-danger">해석할 수 없는 값입니다.</p>}
      {valid && date && (
        <dl className="grid grid-cols-[8rem_1fr] gap-y-2 rounded-lg bg-surface p-4 font-mono text-xs">
          <dt className="text-muted">Unix (초)</dt>
          <dd>{Math.floor(date.getTime() / 1000)}</dd>
          <dt className="text-muted">Unix (밀리초)</dt>
          <dd>{date.getTime()}</dd>
          <dt className="text-muted">ISO 8601 (UTC)</dt>
          <dd>{date.toISOString()}</dd>
          <dt className="text-muted">한국 시간</dt>
          <dd>{date.toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}</dd>
          <dt className="text-muted">내 브라우저</dt>
          <dd>{date.toLocaleString()}</dd>
        </dl>
      )}
    </div>
  );
}
