import React from 'react';
import Head from 'next/head';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function HubungiKami() {
  return (
    <>
      <Head>
        <title>Hubungi Kami - LoakinAja</title>
      </Head>
      <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-xl border border-gray-100 shadow-sm my-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Hubungi Kami</h1>
        <p className="text-gray-600 mb-8">Punya pertanyaan, kendala, atau saran? Tim Customer Service kami siap membantu Anda setiap hari (08:00 - 22:00 WIB).</p>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-loak-blue">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Email</h4>
                <p className="text-gray-600">support@loakinaja.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-loak-blue">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Telepon & WhatsApp</h4>
                <p className="text-gray-600">0812-3456-7890</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-full text-loak-blue">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Kantor Pusat</h4>
                <p className="text-gray-600">Gedung Inovasi Lt. 5, Jl. Jend. Sudirman No. 123,<br/>Jakarta Selatan 12190, Indonesia</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-4">Kirim Pesan</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Nama Lengkap</label>
                <input type="text" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Nama Anda" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="email@contoh.com" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Pesan</label>
                <textarea rows={4} className="w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Tulis pesan Anda di sini..."></textarea>
              </div>
              <button type="button" className="w-full bg-loak-blue text-white font-medium py-2 px-4 rounded-md hover:bg-loak-blue-dark transition-colors">
                Kirim
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
