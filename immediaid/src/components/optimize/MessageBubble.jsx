import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, CheckCircle2, AlertCircle, Loader2, ChevronRight, Clock, Zap } from 'lucide-react';
import { cn } from "../../libs/utils";
import { toast } from "sonner";

const FunctionDisplay = ({ toolCall }) => {
  const [expanded, setExpanded] = useState(false);
  const name = toolCall?.name || 'Function';
  const status = toolCall?.status || 'pending';
  const results = toolCall?.results;

  const parsedResults = (() => {
    if (!results) return null;
    try { return typeof results === 'string' ? JSON.parse(results) : results; }
    catch { return results; }
  })();

  const isError = results && (
    (typeof results === 'string' && /error|failed/i.test(results)) ||
    (parsedResults?.success === false)
  );

  const statusConfig = {
    pending: { icon: Clock, color: 'text-slate-400', text: 'Pending' },
    running: { icon: Loader2, color: 'text-blue-500', text: 'Running...', spin: true },
    in_progress: { icon: Loader2, color: 'text-blue-500', text: 'Running...', spin: true },
    completed: isError ? { icon: AlertCircle, color: 'text-red-500', text: 'Failed' } : { icon: CheckCircle2, color: 'text-green-600', text: 'Done' },
    success: { icon: CheckCircle2, color: 'text-green-600', text: 'Done' },
    failed: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' },
    error: { icon: AlertCircle, color: 'text-red-500', text: 'Failed' }
  }[status] || { icon: Zap, color: 'text-slate-500', text: '' };

  const Icon = statusConfig.icon;
  const formattedName = name.split('.').pop()?.replace(/_/g, ' ') || name;

  return (
    <div className="mt-1.5 text-xs">
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all w-full text-left",
          "hover:bg-slate-50",
          expanded ? "bg-slate-50 border-slate-300" : "bg-white border-slate-200"
        )}
      >
        <Icon className={cn("h-3 w-3 shrink-0", statusConfig.color, statusConfig.spin && "animate-spin")} />
        <span className="text-slate-700 capitalize">{formattedName}</span>
        {statusConfig.text && <span className={cn("text-slate-400", isError && "text-red-500")}>· {statusConfig.text}</span>}
        {!statusConfig.spin && (toolCall.arguments_string || results) && (
          <ChevronRight className={cn("h-3 w-3 text-slate-400 ml-auto transition-transform", expanded && "rotate-90")} />
        )}
      </button>
      {expanded && !statusConfig.spin && (
        <div className="mt-1 ml-3 pl-3 border-l-2 border-slate-200 space-y-2">
          {toolCall.arguments_string && (
            <div>
              <p className="text-slate-400 mb-1">Input:</p>
              <pre className="bg-slate-50 rounded p-2 text-slate-600 whitespace-pre-wrap overflow-auto max-h-32">
                {(() => { try { return JSON.stringify(JSON.parse(toolCall.arguments_string), null, 2); } catch { return toolCall.arguments_string; } })()}
              </pre>
            </div>
          )}
          {parsedResults && (
            <div>
              <p className="text-slate-400 mb-1">Result:</p>
              <pre className="bg-slate-50 rounded p-2 text-slate-600 whitespace-pre-wrap overflow-auto max-h-32">
                {typeof parsedResults === 'object' ? JSON.stringify(parsedResults, null, 2) : parsedResults}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user';
  if (message.role === 'system') return null;

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-3.5 h-3.5 text-primary" />
        </div>
      )}
      <div className={cn("max-w-[85%]", isUser && "flex flex-col items-end")}>
        {message.content && (
          <div className={cn(
            "rounded-2xl px-4 py-2.5",
            isUser ? "bg-primary text-primary-foreground" : "bg-white border border-border"
          )}>
            {isUser ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <div className="text-sm prose prose-sm prose-slate max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                <ReactMarkdown
                  components={{
                    code: ({ className, children, ...props }) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return match ? (
                        <div className="relative group/code">
                          <pre className="bg-slate-900 text-slate-100 rounded-lg p-3 overflow-x-auto my-2">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                          <button
                            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover/code:opacity-100 bg-slate-800 hover:bg-slate-700 rounded flex items-center justify-center"
                            onClick={() => { navigator.clipboard.writeText(String(children)); toast.success('Copied'); }}
                          >
                            <Copy className="h-3 w-3 text-slate-400" />
                          </button>
                        </div>
                      ) : (
                        <code className="px-1 py-0.5 rounded bg-slate-100 text-slate-700 text-xs">{children}</code>
                      );
                    },
                    p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="my-1 ml-4 list-disc">{children}</ul>,
                    ol: ({ children }) => <ol className="my-1 ml-4 list-decimal">{children}</ol>,
                    li: ({ children }) => <li className="my-0.5">{children}</li>,
                    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
        {message.tool_calls?.length > 0 && (
          <div className="w-full space-y-1 mt-1">
            {message.tool_calls.map((tc, i) => <FunctionDisplay key={i} toolCall={tc} />)}
          </div>
        )}
      </div>
    </div>
  );
}