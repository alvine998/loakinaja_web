import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Send, Paperclip, ShieldCheck, CheckCircle2, Clock, QrCode } from 'lucide-react';

type EscrowState = 'NONE' | 'REQUESTED' | 'ACCEPTED' | 'VERIFYING' | 'VERIFIED';

export default function ChatPage() {
  const [escrowState, setEscrowState] = useState<EscrowState>('NONE');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'SellerAja', text: 'Halo gan, barang masih ada nih. Minat?', time: '10:00', isMe: false },
    { id: 2, sender: 'Me', text: 'Kondisinya beneran mulus sesuai deskripsi kan?', time: '10:02', isMe: true },
    { id: 3, sender: 'SellerAja', text: 'Aman gan, mulus no minus. Bisa rekber kalau ragu.', time: '10:05', isMe: false },
  ]);
  const [inputText, setInputText] = useState('');

  const requestEscrow = () => {
    setEscrowState('REQUESTED');
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'Me', text: 'Saya mengusulkan untuk menggunakan Rekening Bersama LoakinAja.', time: '10:06', isMe: true, isSystem: true
    }]);

    // Simulate Seller Accepting after 2 seconds
    setTimeout(() => {
      setEscrowState('ACCEPTED');
      setMessages(prev => [...prev, {
        id: Date.now()+1, sender: 'SellerAja', text: 'Penjual menyetujui transaksi via Rekening Bersama.', time: '10:06', isMe: false, isSystem: true
      }]);
    }, 2000);
  };

  const markPaid = () => {
    setEscrowState('VERIFYING');
    
    // Simulate Admin Verifying after 4 seconds (instead of 2-5 mins for demo purposes)
    setTimeout(() => {
      setEscrowState('VERIFIED');
      setMessages(prev => [...prev, {
        id: Date.now()+2, sender: 'System', text: 'Pembayaran telah diverifikasi oleh Admin. Penjual akan segera mengirimkan barang.', time: '10:10', isMe: false, isSystem: true, type: 'success'
      }]);
    }, 4000);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(), sender: 'Me', text: inputText, time: '10:11', isMe: true
    }]);
    setInputText('');
  };

  return (
    <>
      <Head>
        <title>Pesan - LoakinAja</title>
      </Head>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[80vh] flex">
        {/* Contact List (Left) */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
          <div className="p-4 border-b border-gray-200 bg-white">
            <h2 className="font-bold text-gray-800 text-lg">Pesan</h2>
          </div>
          <div className="overflow-y-auto flex-grow">
            {/* Active Contact */}
            <div className="p-4 border-b border-gray-100 bg-loak-light cursor-pointer flex gap-3 items-center">
              <div className="w-12 h-12 bg-loak-blue text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                S
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-gray-900 truncate">SellerAja</h3>
                  <span className="text-xs text-loak-blue font-semibold">10:05</span>
                </div>
                <p className="text-sm text-gray-600 truncate">Aman gan, mulus no minus. Bisa rekb...</p>
              </div>
            </div>
            {/* Inactive Contact */}
            <div className="p-4 border-b border-gray-100 bg-white hover:bg-gray-50 cursor-pointer flex gap-3 items-center">
              <div className="w-12 h-12 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                A
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-gray-700 truncate">Agus Motor</h3>
                  <span className="text-xs text-gray-400">Kemarin</span>
                </div>
                <p className="text-sm text-gray-500 truncate">Terima kasih gan.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area (Right) */}
        <div className="w-2/3 flex flex-col bg-white">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-loak-blue text-white rounded-full flex items-center justify-center font-bold">
                S
              </div>
              <div>
                <h3 className="font-bold text-gray-900">SellerAja</h3>
                <p className="text-xs text-gray-500">iPhone 13 Pro Max 256GB...</p>
              </div>
            </div>
            {escrowState === 'NONE' && (
              <button 
                onClick={requestEscrow}
                className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4" />
                Gunakan Rekening Bersama
              </button>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-grow p-4 overflow-y-auto bg-[#F0F2F5] flex flex-col gap-4">
            {messages.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                {msg.isSystem ? (
                  <div className={`max-w-[80%] rounded-xl p-3 text-sm flex items-start gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-blue-50 text-blue-800 border border-blue-200 mx-auto text-center'}`}>
                    {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <ShieldCheck className="w-5 h-5 flex-shrink-0" />}
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.isMe ? 'bg-loak-blue text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] text-right mt-1 ${msg.isMe ? 'text-blue-100' : 'text-gray-400'}`}>{msg.time}</p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Rekber Payment Bubble */}
            {escrowState === 'ACCEPTED' && (
              <div className="flex justify-center my-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm max-w-sm w-full">
                  <div className="flex items-center gap-2 mb-4 text-loak-blue font-bold">
                    <ShieldCheck className="w-5 h-5" />
                    Pembayaran Rekening Bersama
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Penjual telah menyetujui. Silakan lakukan pembayaran ke rekening resmi LoakinAja:
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 text-center border border-gray-200">
                    <QrCode className="w-24 h-24 mx-auto text-gray-800 mb-2" />
                    <p className="font-bold text-gray-900">BCA 1234567890</p>
                    <p className="text-xs text-gray-500">a.n PT LoakinAja Aman</p>
                    <p className="font-extrabold text-loak-blue mt-2 text-lg">Rp 14.550.000</p>
                    <p className="text-[10px] text-gray-400">(Termasuk biaya admin Rp 50.000)</p>
                  </div>
                  <button 
                    onClick={markPaid}
                    className="w-full bg-loak-blue text-white font-bold py-2 rounded-lg text-sm hover:bg-loak-blue-dark transition-colors"
                  >
                    Saya Sudah Bayar
                  </button>
                </div>
              </div>
            )}

            {escrowState === 'VERIFYING' && (
              <div className="flex justify-center my-2">
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-3 text-sm flex items-center gap-2">
                  <Clock className="w-5 h-5 animate-pulse" />
                  Menunggu verifikasi admin (estimasi 2-5 menit)...
                </div>
              </div>
            )}
            
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <form onSubmit={sendMessage} className="flex gap-2 items-center">
              <button type="button" className="p-2 text-gray-400 hover:text-loak-blue rounded-full transition-colors">
                <Paperclip className="w-5 h-5" />
              </button>
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Tulis pesan..." 
                className="flex-grow bg-gray-100 border-transparent focus:bg-white focus:border-loak-blue focus:ring-1 focus:ring-loak-blue rounded-full px-4 py-2 text-sm transition-all"
              />
              <button 
                type="submit" 
                disabled={!inputText.trim()}
                className={`p-2 rounded-full transition-colors ${inputText.trim() ? 'bg-loak-blue text-white hover:bg-loak-blue-dark' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
