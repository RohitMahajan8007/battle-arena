import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Swords, Paperclip, Image as ImageIcon, ArrowRight, PanelLeftOpen, ChevronDown, Check, Lock, LogIn as LogInIcon, FileText, X as CloseIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import Sidebar from '../layout/Sidebar';
import MessageItem from './MessageItem';
import axios from "axios"

const AuthOverlay = () => {
  const navigate = useNavigate();
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[6px]"></div>
      <div className="relative bg-[#1c1a19] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-center">
          <div className="bg-white/5 p-5 rounded-2xl border border-white/10 shadow-inner">
            <Lock size={48} className="text-gray-400" strokeWidth={1.5} />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-serif font-bold text-gray-100 mb-3">Arena is Locked</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            Register or sign in to participate in the AI Battle Arena and track your chat history.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <button 
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-white text-black rounded-xl font-bold text-sm hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
          >
            <LogInIcon size={18} />
            Sign In to Continue
          </button>
          <p className="text-xs text-gray-500">
            Don't have an account? <Link to="/register" className="text-gray-300 hover:text-white underline font-semibold transition-colors">Apply for access</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const ChatInputBox = ({ inputText, setInputText, handleSend, isTyping, textareaRef, disabled, onFileSelect, selectedFile, setSelectedFile }) => (
  <div className={`w-full max-w-4xl mx-auto flex flex-col gap-2 relative transition-all duration-300 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
    {selectedFile && (
      <div className="flex items-center gap-2 p-2 px-3 bg-[#1c1a19] border border-white/10 rounded-xl w-fit animate-in slide-in-from-bottom-2 duration-200">
        {selectedFile.type.startsWith('image/') ? <ImageIcon size={14} className="text-blue-400" /> : <FileText size={14} className="text-red-400" />}
        <span className="text-xs text-gray-300 truncate max-w-[150px]">{selectedFile.name}</span>
        <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-white transition-colors">
          <CloseIcon size={14} />
        </button>
      </div>
    )}
    <div className="rounded-2xl bg-[#302e2c] border border-white/5 shadow-2xl p-2 sm:p-3 flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        autoFocus
        disabled={disabled}
        className="w-full bg-transparent px-2 py-3 min-h-[50px] sm:min-h-[70px] max-h-[250px] resize-none outline-none text-[#ececec] placeholder-gray-500 rounded-lg no-scrollbar text-base"
        placeholder="Ask anything..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        rows={1}
      />
      <div className="flex items-center justify-between px-1 pb-1">
        <div className="flex items-center gap-2">
           <button onClick={() => onFileSelect('pdf')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium transition-colors">
              <Paperclip size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Add files</span>
           </button>
           <button onClick={() => onFileSelect('image')} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm font-medium transition-colors">
              <ImageIcon size={16} strokeWidth={2} />
              <span className="hidden sm:inline">Image</span>
           </button>
        </div>
        
        <button
          onClick={handleSend}
          disabled={(!inputText.trim() && !selectedFile) || isTyping || disabled}
          className="p-2.5 rounded-full bg-white/10 text-gray-300 hover:text-white hover:bg-white/20 disabled:opacity-30 transition-colors flex items-center justify-center shrink-0 ml-2"
        >
          <ArrowRight size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  </div>
);

const ChatDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [battleModeOpen, setBattleModeOpen] = useState(false);
  const [battleMode, setBattleMode] = useState('Battle Mode');
  const battleModes = ['Battle Mode', 'Side-by-Side', 'Judge Only', 'Speed Run'];

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [inputText, setInputText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  // Load user data
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchSessions = async () => {
      try {
        const response = await axios.get("/chat/sessions");
        if (response.data.success) {
          setSessions(response.data.sessions);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        if (error.response?.status === 401) handleLogout();
      }
    };
    fetchSessions();
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setIsLoggedIn(false);
    setUser(null);
    setSessions([]);
    setActiveSessionId(null);
    navigate('/login');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const activeSession = sessions.find(s => s._id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const onFileSelect = (type) => {
    if (type === 'pdf') fileInputRef.current.click();
    else imageInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // PRECISE WORD-BY-WORD STREAMING (CHATGPT STYLE)
  const simulateStream = (sessionId, realMsgId, tempMsgId, sol1, sol2, judgeData) => {
    // Split by words while keeping newlines/whitespace intact
    const chunks1 = sol1.split(/(\s+)/);
    const chunks2 = sol2.split(/(\s+)/);
    let idx1 = 0;
    let idx2 = 0;
    
    const interval = setInterval(() => {
      // Reveal 2 chunks at a time for a smooth but readable speed
      idx1 = Math.min(idx1 + 2, chunks1.length);
      idx2 = Math.min(idx2 + 2, chunks2.length);
      
      const finished = idx1 === chunks1.length && idx2 === chunks2.length;
      const currentSol1 = chunks1.slice(0, idx1).join("");
      const currentSol2 = chunks2.slice(0, idx2).join("");

      setSessions(prevSessions => {
        return prevSessions.map(s => {
          if (s._id === sessionId) {
            return {
              ...s,
              messages: s.messages.map(m => {
                if (m._id === realMsgId || m._id === tempMsgId) {
                  return {
                    ...m,
                    solution_1: currentSol1,
                    solution_2: currentSol2,
                    judge: finished ? judgeData : null
                  };
                }
                return m;
              })
            };
          }
          return s;
        });
      });

      if (finished) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 45); // 45ms per word-chunk for a natural 'typing' pace
  };

  const handleSend = async (e) => {
    if (!isLoggedIn) return;
    if (e) e.preventDefault();
    const currentInputText = inputText;
    const currentFile = selectedFile;
    const tempId = "temp-" + Date.now();
    const currentActiveId = activeSessionId;
    
    setIsTyping(true);
    setInputText("");
    setSelectedFile(null);

    // Optimistic Update
    const tempMessage = {
      _id: tempId,
      problem: currentInputText || (currentFile ? `Uploaded ${currentFile.name}` : ""),
      solution_1: "",
      solution_2: "",
      judge: null,
      model_a: "Evaluating...",
      model_b: "Evaluating...",
      preference: null,
      file: currentFile ? { name: currentFile.name, fileType: currentFile.type } : undefined
    };

    if (!currentActiveId) {
      const tempSessionId = "temp-session-" + Date.now();
      setSessions([{ _id: tempSessionId, title: "New Chat", messages: [tempMessage] }, ...sessions]);
      setActiveSessionId(tempSessionId);
    } else {
      setSessions(prev => prev.map(s => s._id === currentActiveId ? { ...s, messages: [...s.messages, tempMessage] } : s));
    }

    try {
      let fileData = null;
      if (currentFile) {
        fileData = { name: currentFile.name, type: currentFile.type, base64: await fileToBase64(currentFile) };
      }

      const response = await axios.post("/chat/invoke", { 
        input: currentInputText, 
        sessionId: currentActiveId?.startsWith("temp-") ? null : currentActiveId,
        file: fileData
      });

      if (response.data.success) {
        const { session, message } = response.data;
        
        // Sync State
        setSessions(prev => {
          if (currentActiveId?.startsWith("temp-") || !currentActiveId) {
            return prev.map(s => (s._id?.startsWith("temp-") || s._id === currentActiveId) ? session : s);
          } else {
            return prev.map(s => s._id === session._id ? {
              ...s,
              messages: s.messages.map(m => m._id === tempId ? { ...message, solution_1: "", solution_2: "" } : m)
            } : s);
          }
        });

        setActiveSessionId(session._id);
        
        // START STREAMING WITH BOTH IDS
        simulateStream(session._id, message._id, tempId, message.solution_1, message.solution_2, message.judge);
      }
    } catch (error) {
      console.error("Invoke Error:", error);
      setIsTyping(false);
      setSessions(prev => prev.map(s => (s._id === currentActiveId || s._id?.startsWith("temp-")) ? { ...s, messages: s.messages.filter(m => m._id !== tempId) } : s));
    }
    textareaRef.current?.focus();
  };

  const handleNewChat = () => setActiveSessionId(null);

  const handleDeleteSession = async (sessionId) => {
    try {
      const res = await axios.delete(`/chat/session/${sessionId}`);
      if (res.data.success) {
        setSessions(prev => prev.filter(s => s._id !== sessionId));
        if (activeSessionId === sessionId) setActiveSessionId(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleVote = async (messageId, preference) => {
    if (activeSessionId?.startsWith("temp-") || messageId?.startsWith("temp-")) return;
    console.log("Voting:", { activeSessionId, messageId, preference });
    try {
      const res = await axios.post("/chat/vote", { sessionId: activeSessionId, messageId, preference });
      if (res.data.success) {
        setSessions(prev => prev.map(s => s._id === activeSessionId ? {
          ...s,
          messages: s.messages.map(m => m._id === messageId ? { ...m, preference } : m)
        } : s));
      }
    } catch (e) { console.error("Vote Error:", e.response?.data || e.message); }
  };

  return (
    <div className="flex h-screen bg-[#242220] font-sans text-gray-200 overflow-hidden selection:bg-white/20 relative">
      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.doc,.docx" onChange={handleFileChange} />
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {!isLoggedIn && <AuthOverlay />}

      <Sidebar 
         user={user} onLogout={handleLogout} onNewChat={handleNewChat} 
         isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} onClose={() => setIsSidebarOpen(false)} 
         sessions={sessions} activeSessionId={activeSessionId}
         onSelectSession={setActiveSessionId} onDeleteSession={handleDeleteSession}
         disabled={!isLoggedIn}
      />

      <div className={`flex-1 flex flex-col min-w-0 h-full relative transition-all duration-500 ${!isLoggedIn ? 'blur-[2px]' : ''}`}>
        <header className="flex flex-none items-center justify-between px-4 py-3 bg-[#242220]/90 backdrop-blur-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 text-gray-400 hover:text-white"><Menu size={22} /></button>
            {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="hidden md:flex p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5"><PanelLeftOpen size={20} /></button>}
            <div className="relative">
              <button onClick={() => setBattleModeOpen(!battleModeOpen)} className="flex items-center gap-2 text-gray-300 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm">
                <Swords size={16} /> <span>{battleMode}</span> <ChevronDown size={14} />
              </button>
              {battleModeOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 bg-[#1c1a19] border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden">
                  {battleModes.map(m => <button key={m} onClick={() => { setBattleMode(m); setBattleModeOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-white/5 text-gray-300">{m}</button>)}
                </div>
              )}
            </div>
          </div>
        </header>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-8">
            <h2 className="text-4xl md:text-5xl font-serif text-[#ececec]">Choose your battle</h2>
            <ChatInputBox inputText={inputText} setInputText={setInputText} handleSend={handleSend} isTyping={isTyping} textareaRef={textareaRef} disabled={!isLoggedIn} onFileSelect={onFileSelect} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
          </div>
        ) : (
          <>
            <main className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-8 space-y-12">
              <div className="max-w-6xl mx-auto space-y-12 pb-32">
                {messages.map((m, idx) => <MessageItem key={m._id || idx} msg={m} onVote={handleVote} />)}
                <div ref={messagesEndRef} />
              </div>
            </main>
            <div className="p-4 md:px-8 pb-10 bg-gradient-to-t from-[#242220] via-[#242220]/95 to-transparent pt-12 shrink-0">
               <ChatInputBox inputText={inputText} setInputText={setInputText} handleSend={handleSend} isTyping={isTyping} textareaRef={textareaRef} disabled={!isLoggedIn} onFileSelect={onFileSelect} selectedFile={selectedFile} setSelectedFile={setSelectedFile} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;
