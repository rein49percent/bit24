import { useState, useEffect } from 'react';
import { MessageSquare, Cloud, TrendingUp, Menu, X } from 'lucide-react';
import ChatInterface from './components/ChatInterface';
import WeatherPanel from './components/WeatherPanel';
import MarketPanel from './components/MarketPanel';
import Sidebar from './components/Sidebar';
import {
  createConversation,
  getConversations,
  updateConversationTitle,
  Conversation,
} from './services/chatService';
import { supabase } from './lib/supabase';

type Tab = 'chat' | 'weather' | 'market';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const data = await getConversations();
    setConversations(data);

    if (data.length > 0 && !activeConversationId) {
      setActiveConversationId(data[0].id);
    }
  };

  const handleNewConversation = async () => {
    const newConv = await createConversation();
    if (newConv) {
      setConversations([newConv, ...conversations]);
      setActiveConversationId(newConv.id);
      setActiveTab('chat');
      setSidebarOpen(false);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    await supabase.from('conversations').delete().eq('id', id);

    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);

    if (activeConversationId === id) {
      setActiveConversationId(updated.length > 0 ? updated[0].id : null);
    }
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    setActiveTab('chat');
    setSidebarOpen(false);
  };

  useEffect(() => {
    if (activeConversationId && activeTab === 'chat') {
      const conversation = conversations.find((c) => c.id === activeConversationId);
      if (conversation && conversation.title === 'New Conversation') {
        const timer = setTimeout(async () => {
          const messages = await supabase
            .from('messages')
            .select('content')
            .eq('conversation_id', activeConversationId)
            .eq('role', 'user')
            .order('created_at', { ascending: true })
            .limit(1)
            .maybeSingle();

          if (messages.data) {
            const title = messages.data.content.slice(0, 40) + (messages.data.content.length > 40 ? '...' : '');
            await updateConversationTitle(activeConversationId, title);
            loadConversations();
          }
        }, 2000);

        return () => clearTimeout(timer);
      }
    }
  }, [activeConversationId, conversations, activeTab]);

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-green-500 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              <div className="text-3xl">🌾</div>
              <div>
                <h1 className="text-2xl font-bold">Yaung Chi</h1>
                <p className="text-xs text-green-100">AI Agriculture Assistant</p>
              </div>
            </div>
          </div>

          <nav className="flex gap-2 mt-4">
            <button
              onClick={() => {
                setActiveTab('chat');
                if (!activeConversationId && conversations.length === 0) {
                  handleNewConversation();
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'chat'
                  ? 'bg-white text-green-700 font-semibold'
                  : 'text-white hover:bg-green-500'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('weather')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'weather'
                  ? 'bg-white text-green-700 font-semibold'
                  : 'text-white hover:bg-green-500'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span className="text-sm">Weather</span>
            </button>
            <button
              onClick={() => setActiveTab('market')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'market'
                  ? 'bg-white text-green-700 font-semibold'
                  : 'text-white hover:bg-green-500'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Market Prices</span>
            </button>
          </nav>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div
          className={`${
            sidebarOpen ? 'block' : 'hidden'
          } lg:block fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-0 bg-black bg-opacity-50 lg:bg-transparent`}
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="h-full w-64 bg-white lg:bg-transparent"
            onClick={(e) => e.stopPropagation()}
          >
            {activeTab === 'chat' && (
              <Sidebar
                conversations={conversations}
                activeConversationId={activeConversationId}
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                onDeleteConversation={handleDeleteConversation}
              />
            )}
          </div>
        </div>

        <main className="flex-1 overflow-hidden bg-gray-50">
          {activeTab === 'chat' && (
            <>
              {activeConversationId ? (
                <ChatInterface conversationId={activeConversationId} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🌾</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Yaung Chi</h2>
                    <p className="text-gray-600 mb-6">Start a new conversation to begin</p>
                    <button
                      onClick={handleNewConversation}
                      className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
                    >
                      Start New Chat
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
          {activeTab === 'weather' && <WeatherPanel />}
          {activeTab === 'market' && <MarketPanel />}
        </main>
      </div>
    </div>
  );
}

export default App;
