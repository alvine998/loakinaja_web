import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Paperclip,
  QrCode,
  Send,
  ShieldCheck,
} from 'lucide-react';

type EscrowState = 'NONE' | 'REQUESTED' | 'ACCEPTED' | 'VERIFYING' | 'VERIFIED';

type Message = {
  id: number;
  sender: string;
  text: string;
  time: string;
  isMe: boolean;
  isSystem?: boolean;
  type?: 'success';
};

type Contact = {
  id: string;
  name: string;
  listing: string;
  initial: string;
};

const CONTACTS: Contact[] = [
  {
    id: 'selleraja',
    name: 'SellerAja',
    listing: 'iPhone 13 Pro Max 256GB',
    initial: 'S',
  },
  {
    id: 'agus',
    name: 'Agus Motor',
    listing: 'Honda Vario 150 2021',
    initial: 'A',
  },
];

const INITIAL_MESSAGES: Record<string, Message[]> = {
  selleraja: [
    {
      id: 1,
      sender: 'SellerAja',
      text: 'Halo gan, barang masih ada nih. Minat?',
      time: '10:00',
      isMe: false,
    },
    {
      id: 2,
      sender: 'Me',
      text: 'Kondisinya beneran mulus sesuai deskripsi kan?',
      time: '10:02',
      isMe: true,
    },
    {
      id: 3,
      sender: 'SellerAja',
      text: 'Aman gan, mulus no minus. Bisa rekber kalau ragu.',
      time: '10:05',
      isMe: false,
    },
  ],
  agus: [
    {
      id: 1,
      sender: 'Me',
      text: 'Mas, Vario-nya masih ready?',
      time: 'Kemarin',
      isMe: true,
    },
    {
      id: 2,
      sender: 'Agus Motor',
      text: 'Terima kasih gan.',
      time: 'Kemarin',
      isMe: false,
    },
  ],
};

const DEFAULT_ESCROW: Record<string, EscrowState> = {
  selleraja: 'NONE',
  agus: 'NONE',
};

const nowTime = () =>
  new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export default function ChatPage() {
  const [activeId, setActiveId] = useState(CONTACTS[0].id);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [escrow, setEscrow] = useState<Record<string, EscrowState>>(DEFAULT_ESCROW);
  const [inputText, setInputText] = useState('');

  const nextId = useRef(100);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = CONTACTS.find((c) => c.id === activeId) ?? CONTACTS[0];
  const thread = messages[active.id] ?? [];
  const escrowState = escrow[active.id] ?? 'NONE';

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [active.id, thread.length]);

  const appendMessage = (contactId: string, message: Message) =>
    setMessages((prev) => ({
      ...prev,
      [contactId]: [...(prev[contactId] ?? []), message],
    }));

  const setEscrowState = (contactId: string, state: EscrowState) =>
    setEscrow((prev) => ({ ...prev, [contactId]: state }));

  const openContact = (contactId: string) => {
    setActiveId(contactId);
    setMobileView('chat');
  };

  const requestEscrow = () => {
    const contactId = active.id;
    setEscrowState(contactId, 'REQUESTED');
    appendMessage(contactId, {
      id: nextId.current++,
      sender: 'Me',
      text: 'Saya mengusulkan untuk menggunakan Rekening Bersama LoakinAja.',
      time: nowTime(),
      isMe: true,
      isSystem: true,
    });

    timers.current.push(
      setTimeout(() => {
        setEscrowState(contactId, 'ACCEPTED');
        appendMessage(contactId, {
          id: nextId.current++,
          sender: contactId === 'selleraja' ? 'SellerAja' : 'Penjual',
          text: 'Penjual menyetujui transaksi via Rekening Bersama.',
          time: nowTime(),
          isMe: false,
          isSystem: true,
        });
      }, 2000)
    );
  };

  const markPaid = () => {
    const contactId = active.id;
    setEscrowState(contactId, 'VERIFYING');

    timers.current.push(
      setTimeout(() => {
        setEscrowState(contactId, 'VERIFIED');
        appendMessage(contactId, {
          id: nextId.current++,
          sender: 'System',
          text: 'Pembayaran telah diverifikasi oleh Admin. Penjual akan segera mengirimkan barang.',
          time: nowTime(),
          isMe: false,
          isSystem: true,
          type: 'success',
        });
      }, 4000)
    );
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    appendMessage(active.id, {
      id: nextId.current++,
      sender: 'Me',
      text,
      time: nowTime(),
      isMe: true,
    });
    setInputText('');
  };

  return (
    <>
      <Head>
        <title>Pesan - LoakinAja</title>
      </Head>

      <div className="flex h-[72dvh] min-h-[26rem] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm md:h-[80vh]">
        {/* Contact List */}
        <aside
          className={`${
            mobileView === 'chat' ? 'hidden md:flex' : 'flex'
          } w-full flex-col border-gray-200 bg-gray-50 md:w-80 md:shrink-0 md:border-r`}
        >
          <div className="border-b border-gray-200 bg-white px-4 py-3 sm:py-4">
            <h2 className="text-base font-bold text-gray-800 sm:text-lg">Pesan</h2>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            {CONTACTS.map((contact) => {
              const last = messages[contact.id]?.at(-1);
              const isActive = contact.id === active.id;
              return (
                <button
                  key={contact.id}
                  type="button"
                  onClick={() => openContact(contact.id)}
                  className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors ${
                    isActive && mobileView === 'chat'
                      ? 'bg-loak-light'
                      : 'bg-white hover:bg-gray-50'
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold sm:h-12 sm:w-12 ${
                      isActive ? 'bg-loak-blue text-white' : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {contact.initial}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-baseline justify-between gap-2">
                      <h3 className="truncate text-sm font-semibold text-gray-900 sm:text-base">
                        {contact.name}
                      </h3>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {last?.time}
                      </span>
                    </div>
                    <p className="truncate text-xs text-gray-500 sm:text-sm">
                      {last?.text ?? 'Belum ada pesan'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Conversation */}
        <div
          className={`${
            mobileView === 'list' ? 'hidden md:flex' : 'flex'
          } w-full min-w-0 flex-1 flex-col bg-white`}
        >
          {/* Header */}
          <div className="z-10 flex items-center gap-2 border-b border-gray-200 bg-white px-3 py-3 sm:px-4">
            <button
              type="button"
              onClick={() => setMobileView('list')}
              aria-label="Kembali ke daftar pesan"
              className="-ml-1 shrink-0 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-loak-blue font-bold text-white sm:h-10 sm:w-10">
              {active.initial}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-gray-900 sm:text-base">
                {active.name}
              </h3>
              <p className="truncate text-xs text-gray-500">{active.listing}</p>
            </div>

            {escrowState === 'NONE' && (
              <button
                type="button"
                onClick={requestEscrow}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-2.5 py-2 text-xs font-bold text-green-700 transition-colors hover:bg-green-100 sm:gap-2 sm:px-4 sm:text-sm"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span className="md:hidden">Rekber</span>
                <span className="hidden md:inline">Rekening Bersama</span>
              </button>
            )}
          </div>

          {/* Messages */}
          <div className="min-h-0 flex flex-1 flex-col gap-3 overflow-y-auto bg-[#F0F2F5] p-3 sm:gap-4 sm:p-4">
            {thread.length === 0 && (
              <p className="my-auto text-center text-sm text-gray-400">
                Belum ada pesan. Mulai percakapan dengan {active.name}.
              </p>
            )}

            {thread.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
              >
                {msg.isSystem ? (
                  <div
                    className={`flex max-w-[85%] items-start gap-2 rounded-xl border p-3 text-xs sm:max-w-[80%] sm:text-sm ${
                      msg.type === 'success'
                        ? 'border-green-200 bg-green-100 text-green-800'
                        : 'border-blue-200 bg-blue-50 text-blue-800'
                    }`}
                  >
                    {msg.type === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                    ) : (
                      <ShieldCheck className="h-5 w-5 shrink-0" />
                    )}
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 sm:max-w-[70%] sm:px-4 ${
                      msg.isMe
                        ? 'rounded-br-none bg-loak-blue text-white'
                        : 'rounded-bl-none border border-gray-200 bg-white text-gray-800'
                    }`}
                  >
                    <p className="break-words text-sm">{msg.text}</p>
                    <p
                      className={`mt-1 text-right text-[10px] ${
                        msg.isMe ? 'text-blue-100' : 'text-gray-400'
                      }`}
                    >
                      {msg.time}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Escrow payment card */}
            {escrowState === 'ACCEPTED' && (
              <div className="my-2 flex justify-center sm:my-4">
                <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-3 flex items-center gap-2 font-bold text-loak-blue sm:mb-4">
                    <ShieldCheck className="h-5 w-5 shrink-0" />
                    <span className="text-sm sm:text-base">
                      Pembayaran Rekening Bersama
                    </span>
                  </div>
                  <p className="mb-3 text-xs text-gray-600 sm:mb-4 sm:text-sm">
                    Penjual telah menyetujui. Silakan lakukan pembayaran ke rekening
                    resmi LoakinAja:
                  </p>
                  <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-center sm:mb-4">
                    <QrCode className="mx-auto mb-2 h-20 w-20 text-gray-800 sm:h-24 sm:w-24" />
                    <p className="text-sm font-bold text-gray-900 sm:text-base">
                      BCA 1234567890
                    </p>
                    <p className="text-xs text-gray-500">a.n PT LoakinAja Aman</p>
                    <p className="mt-2 text-lg font-extrabold text-loak-blue">
                      Rp 14.550.000
                    </p>
                    <p className="text-[10px] text-gray-400">
                      (Termasuk biaya admin Rp 50.000)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={markPaid}
                    className="w-full rounded-lg bg-loak-blue py-2.5 text-sm font-bold text-white transition-colors hover:bg-loak-blue-dark"
                  >
                    Saya Sudah Bayar
                  </button>
                </div>
              </div>
            )}

            {escrowState === 'VERIFYING' && (
              <div className="my-2 flex justify-center">
                <div className="flex max-w-[85%] items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 sm:text-sm">
                  <Clock className="h-5 w-5 shrink-0 animate-pulse" />
                  Menunggu verifikasi admin (estimasi 2-5 menit)...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 bg-white p-3 sm:p-4">
            <form onSubmit={sendMessage} className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Lampirkan berkas"
                className="shrink-0 rounded-full p-2 text-gray-400 transition-colors hover:text-loak-blue"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis pesan..."
                className="min-w-0 flex-1 rounded-full border-transparent bg-gray-100 px-4 py-2 text-base transition-all focus:border-loak-blue focus:bg-white focus:ring-1 focus:ring-loak-blue sm:text-sm"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                aria-label="Kirim pesan"
                className={`shrink-0 rounded-full p-2 transition-colors ${
                  inputText.trim()
                    ? 'bg-loak-blue text-white hover:bg-loak-blue-dark'
                    : 'cursor-not-allowed bg-gray-100 text-gray-400'
                }`}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
