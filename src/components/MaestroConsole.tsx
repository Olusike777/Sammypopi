import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Mic, 
  MicOff, 
  Paperclip, 
  Wrench, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  ArrowRight,
  FileText,
  X
} from 'lucide-react';
import { ChatMessage, Agent, Project } from '../types/orchestration';

interface MaestroConsoleProps {
  messages: ChatMessage[];
  onSendMessage: (content: string, options?: { tool?: string; attachment?: string }) => void;
  isLoading: boolean;
  agents: Agent[];
  activeProject: Project;
}

export const MaestroConsole: React.FC<MaestroConsoleProps> = ({
  messages,
  onSendMessage,
  isLoading,
  agents,
  activeProject,
}) => {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<{ name: string; size: string } | null>(null);
  const [showToolDrawer, setShowToolDrawer] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const maestro = agents.find(a => a.isMaestro) || agents[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachment) return;
    onSendMessage(input.trim(), {
      tool: selectedTool || undefined,
      attachment: attachment ? attachment.name : undefined,
    });
    setInput('');
    setAttachment(null);
    setSelectedTool(null);
    setShowToolDrawer(false);
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      // Simulate speech-to-text dictation
      setTimeout(() => {
        setInput(prev => (prev ? prev + ' ' : '') + 'Sammypopi, audit our landing page against anti-slop rules.');
        setIsRecording(false);
      }, 2500);
    }
  };

  const handleAttachMockFile = () => {
    setAttachment({
      name: 'Apex_Studio_Brand_Brief_2026.pdf',
      size: '2.4 MB',
    });
  };

  const promptStarters = [
    'Deconstruct project into specialist tasks',
    'Audit wireframe for anti-slop compliance',
    'Direct Samsmith to research luxury portfolio trends',
    'Have Samuel review Samsonite’s contrast ratio',
  ];

  return (
    <div className="flex h-[calc(100vh-7.5rem)] flex-col rounded-xl border border-neutral-800 bg-neutral-950">
      
      {/* Console Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-900/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={maestro.avatar}
              alt={maestro.name}
              referrerPolicy="no-referrer"
              className="h-9 w-9 rounded-full border border-amber-400/40 object-cover"
            />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-neutral-950 bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-neutral-100">{maestro.name}</h2>
              <span className="text-xs text-neutral-500">·</span>
              <span className="text-xs font-mono text-amber-400">Maestro Orchestrator</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Coordinating {agents.length - 1} specialist agents for {activeProject.name.split('—')[0]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowToolDrawer(!showToolDrawer)}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors ${
              showToolDrawer || selectedTool
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>{selectedTool ? `Tool: ${selectedTool}` : 'Tools'}</span>
          </button>
        </div>
      </div>

      {/* Tool Selection Drawer (if active) */}
      {showToolDrawer && (
        <div className="border-b border-neutral-800 bg-neutral-900/80 px-4 py-3">
          <div className="flex items-center justify-between pb-2 text-xs font-medium text-neutral-300">
            <span>Assign Tool to Maestro Dispatch:</span>
            {selectedTool && (
              <button
                onClick={() => setSelectedTool(null)}
                className="text-[11px] text-amber-400 hover:underline"
              >
                Clear Selection
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { id: 'web_search', label: 'Web Intelligence', agent: 'Samsmith', active: true },
              { id: 'image_gen', label: 'Visual Engine', agent: 'Samkindle', active: true },
              { id: 'layout_synth', label: 'Layout Blueprint', agent: 'Samsonite', active: true },
              { id: 'quality_audit', label: 'Anti-Slop Audit', agent: 'Samuel', active: true },
            ].map(tool => (
              <button
                key={tool.id}
                onClick={() => setSelectedTool(selectedTool === tool.id ? null : tool.id)}
                className={`rounded-md border p-2 text-left text-xs transition-all ${
                  selectedTool === tool.id
                    ? 'border-amber-400 bg-amber-400/10 text-amber-200'
                    : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                }`}
              >
                <div className="font-medium text-neutral-200">{tool.label}</div>
                <div className="text-[10px] text-neutral-500 font-mono">Assigned: {tool.agent}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.map(message => {
          const isUser = message.sender === 'user';
          const orchestration = message.orchestrationData;

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <img
                  src={maestro.avatar}
                  alt={maestro.name}
                  referrerPolicy="no-referrer"
                  className="h-8 w-8 rounded-full border border-amber-400/40 object-cover shrink-0 mt-0.5"
                />
              )}

              <div className={`max-w-2xl space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                
                {/* Main bubble */}
                <div
                  className={`rounded-xl px-4 py-3 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Subtask Decomposition Tree (if orchestrated by Sammypopi) */}
                {orchestration?.subtasksPlanned && orchestration.subtasksPlanned.length > 0 && (
                  <div className="rounded-lg border border-neutral-800/90 bg-neutral-900/60 p-3 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
                      <Layers className="h-3.5 w-3.5 text-amber-400" />
                      <span>Task Decomposition & Delegation Protocol:</span>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {orchestration.subtasksPlanned.map((sub, i) => {
                        const targetAgent = agents.find(a => a.id === sub.agentId);
                        return (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5"
                          >
                            <div className="flex items-center gap-2">
                              {targetAgent && (
                                <img
                                  src={targetAgent.avatar}
                                  alt={targetAgent.name}
                                  referrerPolicy="no-referrer"
                                  className="h-5 w-5 rounded-full object-cover"
                                />
                              )}
                              <span className="font-semibold text-neutral-200">
                                {targetAgent?.name || sub.agentId}
                              </span>
                              <span className="text-neutral-500">·</span>
                              <span className="text-neutral-400 truncate max-w-sm">
                                {sub.task}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Dispatched
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {orchestration.critiqueInvolved && (
                      <div className="flex items-center gap-2 rounded-md border border-rose-950 bg-rose-950/20 px-2.5 py-1.5 text-[11px] text-rose-300">
                        <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                        <span>Independent Review: Samuel will audit against the design constitution before final sign-off.</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-[10px] text-neutral-500 px-1 font-mono">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {isUser && (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 shrink-0 mt-0.5 border border-neutral-700">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-3">
            <img
              src={maestro.avatar}
              alt={maestro.name}
              referrerPolicy="no-referrer"
              className="h-8 w-8 rounded-full border border-amber-400/40 object-cover shrink-0"
            />
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3 text-xs text-neutral-400 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-spin" />
              <span>Sammypopi is synthesizing with specialized agents...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Starters */}
      <div className="border-t border-neutral-800/80 bg-neutral-900/30 px-4 py-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-neutral-500 whitespace-nowrap">Direct Maestro:</span>
          {promptStarters.map((starter, i) => (
            <button
              key={i}
              onClick={() => setInput(starter)}
              className="whitespace-nowrap rounded-md border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-[11px] text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
            >
              {starter}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="border-t border-neutral-800 bg-neutral-950 p-4">
        
        {/* Attachment preview */}
        {attachment && (
          <div className="mb-2 flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs">
            <div className="flex items-center gap-2 text-neutral-300">
              <FileText className="h-3.5 w-3.5 text-amber-400" />
              <span>{attachment.name}</span>
              <span className="text-neutral-500">({attachment.size})</span>
            </div>
            <button
              onClick={() => setAttachment(null)}
              className="text-neutral-400 hover:text-neutral-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              rows={2}
              placeholder="Instruct Sammypopi (e.g. 'Synthesize a landing page for our boutique studio with unboxed metadata...')"
              className="w-full resize-none rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-100 placeholder-neutral-500 focus:border-amber-500/60 focus:outline-none"
            />
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-1.5 pb-1">
            
            {/* Attachment trigger */}
            <button
              type="button"
              onClick={handleAttachMockFile}
              title="Attach brief file"
              className="rounded-md border border-neutral-800 bg-neutral-900 p-2 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 transition-colors"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            {/* Voice dictation trigger */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              title={isRecording ? 'Stop Recording' : 'Voice Dictation'}
              className={`rounded-md border p-2 transition-all ${
                isRecording
                  ? 'border-rose-500 bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
              }`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || (!input.trim() && !attachment)}
              className="rounded-md bg-amber-400 px-3.5 py-2 text-xs font-semibold text-neutral-950 transition-all hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-2 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Maestro coordinates specialists directly · Enter to send</span>
          <span className="font-mono text-neutral-400">Model: gemini-3.8-flash</span>
        </div>
      </div>

    </div>
  );
};
