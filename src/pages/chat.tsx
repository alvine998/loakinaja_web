import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ArrowLeft, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  ChatConversation,
  ChatMessage,
  getChatConversations,
  getChatMessages,
  openChatConversation,
  sendChatMessage,
} from '@/lib/db';

const formatTime = (date: string) => new Date(date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function ChatPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const openedListing = useRef('');

  const active = conversations.find((conversation) => conversation.id === activeId);
  const activeName = active
    ? (active.buyerId === user?.id ? active.seller?.name : active.buyer?.name) || 'Pengguna LoakinAja'
    : '';

  const refreshConversations = useCallback(async () => {
    const next = await getChatConversations();
    setConversations(next);
    return next;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
      return;
    }
    let cancelled = false;
    setLoading(true);
    refreshConversations()
      .then((items) => { if (!cancelled && !activeId && items.length) setActiveId(items[0].id); })
      .catch((reason: Error) => { if (!cancelled) setError(reason.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [authLoading, user, router, refreshConversations]);

  useEffect(() => {
    if (!user || !router.isReady || typeof router.query.listingId !== 'string') return;
    const listingId = router.query.listingId;
    if (openedListing.current === listingId) return;
    openedListing.current = listingId;
    openChatConversation(listingId)
      .then(async (conversation) => {
        await refreshConversations();
        setActiveId(conversation.id);
        setMobileView('chat');
      })
      .catch((reason: Error) => setError(reason.message));
  }, [user, router.isReady, router.query.listingId, refreshConversations]);

  useEffect(() => {
    if (!activeId || !user) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    const load = () => getChatMessages(activeId)
      .then((items) => { if (!cancelled) setMessages(items); })
      .catch((reason: Error) => { if (!cancelled) setError(reason.message); });
    load();
    const interval = window.setInterval(() => {
      load();
      refreshConversations().catch(() => undefined);
    }, 5000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [activeId, user, refreshConversations]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, activeId]);

  const selectConversation = (conversationId: string) => {
    setActiveId(conversationId);
    setMobileView('chat');
    setError('');
  };

  const submitMessage = async (event: FormEvent) => {
    event.preventDefault();
    const text = inputText.trim();
    if (!text || !active || sending) return;
    setSending(true);
    setError('');
    try {
      const message = await sendChatMessage(active.id, text);
      setMessages((current) => [...current, message]);
      setInputText('');
      await refreshConversations();
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head><title>Pesan - LoakinAja</title></Head>
      <div className="flex h-[72dvh] min-h-[26rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:h-[80vh]">
        <aside className={`${mobileView === 'chat' ? 'hidden md:flex' : 'flex'} w-full flex-col border-gray-200 bg-gray-50 md:w-80 md:shrink-0 md:border-r`}>
          <div className="border-b border-gray-200 bg-white px-4 py-3 sm:py-4">
            <h2 className="text-base font-bold text-gray-800 sm:text-lg">Pesan</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {!loading && conversations.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-500">
                <MessageSquare className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                Belum ada percakapan. Buka produk lalu pilih “Chat Penjual” untuk menghubungi penjualnya.
                <Link href="/" className="mt-3 inline-block font-semibold text-loak-blue">Jelajahi produk</Link>
              </div>
            )}
            {conversations.map((conversation) => {
              const name = conversation.buyerId === user?.id ? conversation.seller?.name : conversation.buyer?.name;
              const isActive = conversation.id === activeId;
              return (
                <button key={conversation.id} type="button" onClick={() => selectConversation(conversation.id)} className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${isActive && mobileView === 'chat' ? 'bg-loak-light' : 'bg-white hover:bg-gray-50'}`}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold sm:h-12 sm:w-12 ${isActive ? 'bg-loak-blue text-white' : 'bg-gray-300 text-gray-600'}`}>{(name || '?').charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-baseline justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">{name || 'Pengguna LoakinAja'}</h3>
                      <span className="shrink-0 text-[11px] text-gray-400">{conversation.lastMessage?.createdAt ? formatTime(conversation.lastMessage.createdAt) : ''}</span>
                    </div>
                    <p className="truncate text-xs text-gray-500 sm:text-sm">{conversation.listing?.title} · {conversation.lastMessage?.text || 'Mulai percakapan'}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <div className={`${mobileView === 'list' ? 'hidden md:flex' : 'flex'} w-full min-w-0 flex-1 flex-col bg-white`}>
          {active ? <>
            <div className="z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-3 sm:px-4">
              <button type="button" onClick={() => setMobileView('list')} aria-label="Kembali ke daftar pesan" className="-ml-1 shrink-0 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"><ArrowLeft className="h-5 w-5" /></button>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-loak-blue font-bold text-white sm:h-10 sm:w-10">{activeName.charAt(0).toUpperCase()}</div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">{activeName}</h3>
                <p className="truncate text-xs text-gray-500">{active.listing?.title}</p>
              </div>
            </div>
            <div className="min-h-0 flex flex-1 flex-col gap-3 overflow-y-auto bg-[#F0F2F5] p-3 sm:gap-4 sm:p-4">
              {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
              {messages.length === 0 && <p className="my-auto text-center text-sm text-gray-400">Belum ada pesan. Mulai percakapan dengan {activeName} tentang {active.listing?.title}.</p>}
              {messages.map((message) => {
                const isMe = message.senderId === user?.id;
                return <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 sm:max-w-[70%] sm:px-4 ${isMe ? 'rounded-br-none bg-loak-blue text-white' : 'rounded-bl-none border border-gray-200 bg-white text-gray-800'}`}>
                    {!isMe && <p className="mb-1 text-xs font-semibold text-loak-blue">{message.sender?.name || activeName}</p>}
                    <p className="break-words whitespace-pre-wrap text-sm">{message.text}</p>
                    <p className={`mt-1 text-right text-[10px] ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>{formatTime(message.createdAt)}</p>
                  </div>
                </div>;
              })}
              <div ref={bottomRef} />
            </div>
            <div className="border-t border-gray-200 bg-white p-3 sm:p-4">
              <form onSubmit={submitMessage} className="flex items-center gap-2">
                <input type="text" value={inputText} onChange={(event) => setInputText(event.target.value)} maxLength={2000} placeholder="Tulis pesan..." aria-label="Tulis pesan" className="min-w-0 flex-1 rounded-full border-transparent bg-gray-100 px-4 py-2 text-base transition-all focus:border-loak-blue focus:bg-white focus:ring-1 focus:ring-loak-blue sm:text-sm" />
                <button type="submit" disabled={!inputText.trim() || sending} aria-label="Kirim pesan" className={`shrink-0 rounded-full p-2 transition-colors ${inputText.trim() && !sending ? 'bg-loak-blue text-white hover:bg-loak-blue-dark' : 'cursor-not-allowed bg-gray-100 text-gray-400'}`}><Send className="h-5 w-5" /></button>
              </form>
            </div>
          </> : <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-gray-500">{loading ? 'Memuat pesan...' : 'Pilih percakapan untuk mulai mengobrol.'}</div>}
        </div>
      </div>
    </>
  );
}
