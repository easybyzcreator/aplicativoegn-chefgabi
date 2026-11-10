/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { db } from './firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { motion, useScroll, useTransform } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  Phone, 
  Mail, 
  User, 
  Instagram, 
  MapPin, 
  MessageCircle,
  Layers,
  Award,
  ExternalLink,
  ShieldCheck,
  SlidersHorizontal,
  ShoppingBag,
  TrendingUp,
  CreditCard,
  CalendarCheck,
  Quote,
  Star,
  Smartphone,
  ArrowDown,
  ArrowUp,
  Lock,
  AlertCircle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const EASYBYZ_WHATSAPP = '18038889018';
const ASAAS_CHECKOUT_URL = 'https://www.asaas.com/000/c/0lcs6xll0kayzkql';
const DEFAULT_SUPPORT_MSG = "Olá Pati, estou na página do App EASY MENU EGN e gostaria de tirar uma dúvida sobre o aplicativo personalizado. Você pode me ajudar?";

type FormData = {
  nome: string;
  whatsapp: string;
  email: string;
  instagram: string;
  cidade: string;
  estado: string;
};

export default function App() {
  const { scrollY } = useScroll();
  const chefY = useTransform(scrollY, [0, 600], [0, -25]);
  const phoneY = useTransform(scrollY, [0, 600], [0, -50]);

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    whatsapp: '',
    email: '',
    instagram: '',
    cidade: '',
    estado: 'SP',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState('');
  const [highlightFormNotice, setHighlightFormNotice] = useState(false);

  const handleScrollToForm = (e?: React.MouseEvent) => {
    if (!isSubmitted) {
      if (e) e.preventDefault();
      const formEl = document.getElementById('inscricao');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
        setHighlightFormNotice(true);
        setTimeout(() => {
          const inputNome = formEl.querySelector<HTMLInputElement>('input[name="nome"]');
          inputNome?.focus();
        }, 400);
      }
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .slice(0, 15);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'whatsapp') maskedValue = maskPhone(value);
    if (name === 'instagram') {
      maskedValue = value.startsWith('@') ? value : (value ? `@${value}` : '');
    }

    setFormData((prev) => ({ ...prev, [name]: maskedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert('Por favor, informe seu nome completo.');
      return;
    }

    if (!formData.whatsapp.trim() || formData.whatsapp.replace(/\D/g, '').length < 10) {
      alert('Por favor, insira um WhatsApp válido com DDD.');
      return;
    }

    if (!validateEmail(formData.email)) {
      alert('Por favor, insira um e-mail válido.');
      return;
    }

    if (!formData.instagram.trim()) {
      alert('Por favor, insira o seu Instagram.');
      return;
    }

    if (!formData.cidade.trim()) {
      alert('Por favor, informe sua cidade.');
      return;
    }

    if (!formData.estado) {
      alert('Por favor, selecione seu estado.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      nome: formData.nome.trim(),
      whatsapp: formData.whatsapp.trim(),
      email: formData.email.trim().toLowerCase(),
      instagram: formData.instagram.trim(),
      cidade: formData.cidade.trim(),
      estado: formData.estado.trim(),
      dataHora: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
    };

    // Mensagem de suporte opcional para o WhatsApp caso necessite
    const whatsAppMessage = "Olá Pati, vim através do insta da chef Gabi, acabei de preencher a inscrição do app para a minha marmitaria";
    const whatsAppUrl = `https://wa.me/${EASYBYZ_WHATSAPP}?text=${encodeURIComponent(whatsAppMessage)}`;
    setSubmittedWhatsAppUrl(whatsAppUrl);

    try {
      // 1. Envia os dados para a planilha através da API do servidor
      fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch((err) => {
        console.error('Erro ao sincronizar com servidor/planilha:', err);
      });

      // 2. Salva no Firestore para persistência segura
      try {
        const leadRef = doc(collection(db, 'inscricoes'));
        await setDoc(leadRef, {
          ...payload,
          createdAt: serverTimestamp()
        });
      } catch (dbError) {
        console.warn('Aviso ao registrar no Firestore:', dbError);
      }

      // 3. Atualiza estado para confirmação com botão de redirecionamento
      setIsSubmitted(true);
      document.getElementById('inscricao')?.scrollIntoView({ behavior: 'smooth' });

      // 4. Redireciona imediatamente para o link de checkout do Asaas em nova aba
      try {
        window.open(ASAAS_CHECKOUT_URL, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn('Aviso ao abrir Asaas:', e);
      }

    } catch (error) {
      console.error('Erro ao processar dados:', error);
      setIsSubmitted(true);
      try {
        window.open(ASAAS_CHECKOUT_URL, '_blank', 'noopener,noreferrer');
      } catch (e) {
        console.warn(e);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] font-sans text-[#424733] selection:bg-[#859159] selection:text-white">
      
      {/* Top Header Bar */}
      <div className="bg-[#424733] text-[#F0F0F0] text-xs sm:text-sm py-2 px-3 text-center font-medium border-b border-[#613C26]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center flex-wrap justify-center gap-1.5 text-center">
            <Award className="w-4 h-4 text-[#A38C66] shrink-0" />
            <span className="font-bold text-white">Escola de Gastronomia e Negócios (EGN)</span>
            <span className="bg-[#859159]/40 text-[#F0F0F0] text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full border border-[#859159]/50">
              Aplicativo Oficial
            </span>
          </div>
          <div className="text-[11px] sm:text-xs text-[#F0F0F0]/90 text-center">
            Desenvolvido & Comercializado por <strong className="text-white">EASY BYZ</strong>
          </div>
        </div>
      </div>

      {/* Editorial Hero Header (Inspirado na Imagem 2 com visual Chef + Mockup Celular + Efeito Scroll) */}
      <header className="max-w-6xl mx-auto pt-4 sm:pt-10 px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Coluna Visual: No topo no Mobile (order-1 lg:order-2) */}
          <div className="order-1 lg:order-2 lg:col-span-6 xl:col-span-6 relative flex justify-center lg:justify-end mt-2 lg:mt-0">
            
            {/* Efeito de Aura Luminosa Dinâmica de Fundo (Respiração/Pulso Suave) */}
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.25, 0.45, 0.25] 
              }}
              transition={{ 
                duration: 6, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute -inset-4 sm:-inset-8 bg-gradient-to-tr from-[#859159]/30 via-[#A38C66]/25 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
            />

            <div className="relative flex flex-row items-end justify-center gap-3 sm:gap-5 w-full max-w-[540px]">
              
              {/* Card da Chef Gabi (100% visível, sem obstrução) */}
              <motion.div
                style={{ y: chefY }}
                className="w-[52%] sm:w-60 md:w-64 shrink-0"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border-2 sm:border-4 border-white bg-gradient-to-b from-[#FAF8F5] via-[#F4EFE6] to-[#E9DFD3] aspect-[3/4] w-full group flex items-end justify-center"
                >
                  <img
                    src="/assets/branding/chefegn.png"
                    alt="Chef Gabi Paludo - Metodologia EGN"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.src = "https://raw.githubusercontent.com/easybyzcreator/imagens/9fc148274cd353c88914a2fe080ae53f1902e36b/chefegn.png";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 right-2 sm:right-3 text-white text-xs font-semibold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-black/60 backdrop-blur-xs flex items-center justify-between border border-white/20 z-10">
                    <div>
                      <span className="block font-bold text-white text-[10px] sm:text-xs leading-tight">Chef Gabi Paludo</span>
                      <span className="text-[#A38C66] text-[8px] sm:text-[10px] uppercase font-bold tracking-wider">Metodologia EGN</span>
                    </div>
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#859159] animate-ping" />
                  </div>
                </motion.div>
              </motion.div>

              {/* Mockup de Smartphone (Lado a lado, flutuando suavemente com movimento contínuo) */}
              <motion.div
                style={{ y: phoneY }}
                className="w-[44%] sm:w-48 md:w-52 shrink-0 -mb-1 sm:-mb-3"
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [-1, 1, -1]
                  }}
                  transition={{ 
                    duration: 4.2, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative group"
                >
                  {/* Tag Oficial no Topo do Celular: App Interativo (como na Imagem 1) */}
                  <div className="absolute -top-3 sm:-top-3.5 left-0 sm:left-1 z-30 inline-flex items-center gap-1.5 bg-[#613C26] text-[#FAF8F5] px-2.5 sm:px-3 py-1 rounded-full shadow-md border border-white/20 select-none">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#859159] shrink-0" />
                    <span className="text-[9px] sm:text-[10.5px] font-bold tracking-tight whitespace-nowrap">
                      App Interativo
                    </span>
                  </div>

                  {/* Link Clicável no Mockup que abre a simulação */}
                  <a
                    href="https://egn-chefgabipaludo.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Clique para testar a simulação do aplicativo"
                    className="block transition-transform hover:scale-[1.03] duration-300"
                  >
                    {/* Chassis do Smartphone */}
                    <div className="w-full bg-[#1c2017] rounded-[1.8rem] sm:rounded-[2.3rem] p-1.5 sm:p-2 shadow-2xl border-2 border-[#859159]/60 ring-3 sm:ring-4 ring-black/20 relative">
                      
                      {/* Speaker & Notch */}
                      <div className="w-10 sm:w-14 h-2 sm:h-2.5 bg-black rounded-full mx-auto mb-1 flex items-center justify-end px-1 sm:px-2">
                        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-[#2a2d21]"></div>
                      </div>

                      {/* Tela com demonstração real do App */}
                      <div className="rounded-[1.2rem] sm:rounded-[1.5rem] overflow-hidden bg-[#FAF8F5] shadow-inner aspect-[9/17] relative flex flex-col select-none text-left border border-white/10 group/screen">
                        <div className="relative w-full h-full bg-[#1c2017]">
                            <img
                              src="/assets/branding/app-screen.jpeg"
                              alt="Demonstração do App EASY MENU EGN"
                              className="w-full h-full object-cover object-top block transition-transform duration-500 group-hover:scale-105"
                              loading="eager"
                              onError={(e) => {
                                e.currentTarget.src = "https://raw.githubusercontent.com/easybyzcreator/imagens/235dd25ae5fe1a06b6a499e01c6ab6e6d28cfa23/WhatsApp%20Image%202026-10-01%20at%201.42.38%20PM.jpeg";
                              }}
                            />
                            {/* Overlay sutil de clique ao passar o mouse */}
                            <div className="absolute inset-0 bg-[#424733]/0 group-hover:bg-[#424733]/35 transition-colors flex items-center justify-center pointer-events-none">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[#613C26] text-[10px] sm:text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <span>Testar App</span>
                                <ExternalLink className="w-3 h-3 text-[#859159]" />
                              </span>
                            </div>
                            <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 z-10">
                              <span className="bg-[#859159] text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                                NOVO
                              </span>
                            </div>
                          </div>
                        {false && (
                          <>
                            {/* Status bar */}
                            <div className="bg-[#424733] text-white px-2.5 py-0.5 flex items-center justify-between text-[7px] sm:text-[8px] font-semibold border-b border-[#313526]">
                              <span>12:41</span>
                              <div className="flex items-center gap-1 opacity-80 text-[6px]">
                                <span>5G</span>
                                <span className="inline-block w-2.5 h-1.5 border border-white rounded-[1px] relative">
                                  <span className="block h-full bg-[#859159] w-3/4"></span>
                                </span>
                              </div>
                            </div>

                            {/* Top bar do app */}
                            <div className="bg-[#424733] px-2 py-1 text-white flex items-center justify-between border-b border-[#313526]">
                              <div className="flex items-center gap-1">
                                <img src="/assets/branding/egnn.png" alt="EGN" className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-white p-0.5 object-contain" />
                                <div>
                                  <div className="text-[8px] sm:text-[9px] font-black leading-tight text-white">EASY MENU EGN</div>
                                  <div className="text-[6px] text-[#A38C66] font-medium leading-none">Cardápio Marmitaria</div>
                                </div>
                              </div>
                              <span className="bg-[#859159] text-[6.5px] sm:text-[7.5px] font-bold px-1.5 py-0.5 rounded text-white shadow-xs">
                                Aberto
                              </span>
                            </div>

                            {/* Banner Cardápio */}
                            <div className="px-2 py-1 bg-gradient-to-r from-[#613C26] to-[#424733] text-white">
                              <div className="text-[6px] uppercase font-bold text-[#A38C66] tracking-wider">Chef Gabi Paludo</div>
                              <div className="text-[8px] sm:text-[9px] font-black leading-tight">Cardápio da Semana</div>
                            </div>

                            {/* Categorias */}
                            <div className="px-1.5 py-1 bg-[#FAF8F5] flex gap-1 border-b border-[#e5dfd5]">
                              <span className="bg-[#859159] text-white text-[6.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                Mais Pedidos
                              </span>
                              <span className="bg-[#e9e4dc] text-[#424733] text-[6.5px] font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                                Fitness
                              </span>
                              <span className="bg-[#e9e4dc] text-[#424733] text-[6.5px] font-semibold px-1.5 py-0.5 rounded-full shrink-0">
                                Low Carb
                              </span>
                            </div>

                            {/* Itens do Cardápio com fotos reais */}
                            <div className="p-1.5 space-y-1 sm:space-y-1.5 flex-1 overflow-hidden bg-[#FAF8F5]">
                              {/* Item 1: Strogonoff */}
                              <div className="bg-white rounded-lg p-1 sm:p-1.5 shadow-xs border border-[#e5dfd5] flex gap-1.5 items-center">
                                <img
                                  src="/assets/branding/strogonoff.jpg"
                                  alt="Strogonoff Fit"
                                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-md object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[5.5px] sm:text-[6.5px] font-bold bg-[#A38C66]/20 text-[#613C26] px-1 rounded">Chef Gabi</span>
                                    <span className="text-[7.5px] sm:text-[8.5px] font-extrabold text-[#424733] truncate">Strogonoff Light</span>
                                  </div>
                                  <p className="text-[6px] sm:text-[7px] text-[#424733]/70 truncate">Arroz integral & ervilhas</p>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-[7.5px] sm:text-[9px] font-black text-[#613C26]">R$ 26,90</span>
                                    <span className="bg-[#859159] text-white text-[6px] sm:text-[7px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                      + Adicionar
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Item 2: Lasanha Low Carb */}
                              <div className="bg-white rounded-lg p-1 sm:p-1.5 shadow-xs border border-[#e5dfd5] flex gap-1.5 items-center">
                                <img
                                  src="/assets/branding/lasanha.png"
                                  alt="Lasanha Berinjela"
                                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-md object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[5.5px] sm:text-[6.5px] font-bold bg-[#859159]/20 text-[#859159] px-1 rounded">Low Carb</span>
                                    <span className="text-[7.5px] sm:text-[8.5px] font-extrabold text-[#424733] truncate">Lasanha Berinjela</span>
                                  </div>
                                  <p className="text-[6px] sm:text-[7px] text-[#424733]/70 truncate">Massa fresca artesanal</p>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-[7.5px] sm:text-[9px] font-black text-[#613C26]">R$ 28,90</span>
                                    <span className="bg-[#859159] text-white text-[6px] sm:text-[7px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                      + Adicionar
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Item 3: Feijoada */}
                              <div className="bg-white rounded-lg p-1 sm:p-1.5 shadow-xs border border-[#e5dfd5] flex gap-1.5 items-center">
                                <img
                                  src="/assets/branding/feijoada.jpg"
                                  alt="Feijoada Light"
                                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-md object-cover shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[5.5px] sm:text-[6.5px] font-bold bg-[#613C26]/20 text-[#613C26] px-1 rounded">Top 1</span>
                                    <span className="text-[7.5px] sm:text-[8.5px] font-extrabold text-[#424733] truncate">Feijoada Light</span>
                                  </div>
                                  <p className="text-[6px] sm:text-[7px] text-[#424733]/70 truncate">Carnes nobres magras</p>
                                  <div className="flex items-center justify-between mt-0.5">
                                    <span className="text-[7.5px] sm:text-[9px] font-black text-[#613C26]">R$ 31,90</span>
                                    <span className="bg-[#859159] text-white text-[6px] sm:text-[7px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                      + Adicionar
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Barra Inferior WhatsApp */}
                            <div className="bg-white px-2 py-1.5 border-t border-[#e5dfd5] flex items-center justify-between shadow-xs">
                              <div>
                                <div className="text-[6px] text-[#424733]/70">2 marmitas</div>
                                <div className="text-[8px] sm:text-[9px] font-black text-[#613C26]">Total: R$ 55,80</div>
                              </div>
                              <div className="bg-[#25D366] text-white text-[7px] sm:text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                <span>Pedir WhatsApp</span>
                              </div>
                            </div>
                            
                            {/* Overlay sutil de clique ao passar o mouse */}
                            <div className="absolute inset-0 bg-[#424733]/0 group-hover:bg-[#424733]/35 transition-colors flex items-center justify-center pointer-events-none">
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 text-[#613C26] text-[10px] sm:text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                <span>Testar App</span>
                                <ExternalLink className="w-3 h-3 text-[#859159]" />
                              </span>
                            </div>

                            <div className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 z-10">
                              <span className="bg-[#859159] text-white text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded-full shadow-md">
                                NOVO
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </a>

                </motion.div>
              </motion.div>

            </div>
          </div>

          {/* Coluna de Textos Editoriais & CTAs: Abaixo das imagens no Mobile (order-2 lg:order-1) */}
          <div className="order-2 lg:order-1 lg:col-span-6 xl:col-span-6 text-left space-y-5 sm:space-y-6">
            
            {/* Tag Oficial */}
            <div className="inline-flex items-center gap-2 text-xs sm:text-sm text-[#613C26] bg-[#A38C66]/15 px-3.5 sm:px-4 py-1.5 rounded-full font-medium border border-[#A38C66]/30 shadow-xs">
              <Layers className="w-3.5 h-3.5 text-[#859159] shrink-0" />
              <span>
                Metodologia oficial EGN & tecnologia <strong>EASY BYZ</strong>
              </span>
            </div>

            {/* Título Principal Estilo Editorial */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#613C26] tracking-tight leading-[1.15] sm:leading-[1.1]">
              Transforme sua Marmitaria em uma Operação Profissional e Escalável
            </h1>

            {/* Subtítulo */}
            <p className="text-sm sm:text-xl font-medium text-[#424733] leading-relaxed">
              O aplicativo exclusivo desenvolvido sob a metodologia oficial da Escola de Gastronomia e Negócios (EGN) e tecnologia EASY BYZ.
            </p>

            {/* Texto da Imagem 1 no formato de notas editoriais (estilo CRAFT / NOTES da Imagem 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-[#A38C66]/25">
              <div className="space-y-1.5 p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-[#A38C66]/20 shadow-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#859159] flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#859159]"></span>
                  GESTÃO PRÁTICA
                </span>
                <p className="text-xs sm:text-sm text-[#424733] font-medium leading-relaxed italic">
                  Uma ferramenta prática para organizar, gerir e profissionalizar sua marmitaria.
                </p>
              </div>

              <div className="space-y-1.5 p-3 sm:p-3.5 rounded-2xl bg-white/70 border border-[#A38C66]/20 shadow-xs">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#859159] flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#859159]"></span>
                  MÉTODO EGN
                </span>
                <p className="text-xs sm:text-sm text-[#424733] font-medium leading-relaxed italic">
                  Desenvolvido com a nossa metodologia e as ferramentas práticas da EGN para simplificar sua rotina e otimizar suas vendas diárias.
                </p>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2">
              <a
                href="#inscricao"
                onClick={handleScrollToForm}
                className="bg-[#613C26] hover:bg-[#4a2e1d] text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer text-center"
              >
                <span>Garantir Meu App Agora</span>
                <ArrowDown className="w-4 h-4" />
              </a>

              <a
                href="https://egn-chefgabipaludo.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-[#F8F8F8] text-[#613C26] border-2 border-[#613C26] font-bold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 uppercase tracking-wide text-center"
              >
                <span>Veja Simulação do App</span>
                <ExternalLink className="w-4 h-4 text-[#859159]" />
              </a>
            </div>
          </div>

        </div>
      </header>

      {/* Formulário de Cadastro / Confirmação (Logo abaixo do Header e antes das Vantagens) */}
      <main id="inscricao" className="max-w-3xl mx-auto px-4 sm:px-6 mb-14 sm:mb-16">
        {isSubmitted ? (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border-2 border-[#859159] text-center space-y-5"
          >
            <div className="w-16 h-16 bg-[#859159]/15 text-[#859159] rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-[#859159]" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-[#613C26] tracking-tight">
              Dados salvos com sucesso!
            </h2>
            
            <p className="text-base sm:text-lg text-[#424733] font-medium leading-relaxed max-w-lg mx-auto">
              Seus dados foram registrados com segurança. Conclua agora o seu pagamento através da página oficial segura:
            </p>

            {/* Botão de Destaque para o Link Oficial */}
            <div className="pt-2">
              <a 
                href={ASAAS_CHECKOUT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#613C26] hover:bg-[#424733] text-white text-base sm:text-lg font-black rounded-xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-wide cursor-pointer w-full sm:w-auto"
              >
                <CreditCard className="w-5 h-5 text-[#A38C66]" />
                <span>Ir para Pagamento Seguro</span>
                <ExternalLink className="w-4 h-4 text-[#859159]" />
              </a>
            </div>

            {/* Link direto de suporte caso necessário */}
            {submittedWhatsAppUrl && (
              <div className="pt-3 border-t border-[#A38C66]/20">
                <a 
                  href={submittedWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#859159] hover:text-[#613C26] transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Dúvidas ou suporte? Fale com a equipe no WhatsApp</span>
                </a>
              </div>
            )}
          </motion.div>
        ) : (
          <div className={`bg-white rounded-3xl shadow-xl border-2 transition-all duration-300 overflow-hidden ${
            highlightFormNotice 
              ? 'border-[#859159] ring-4 ring-[#859159]/40 shadow-2xl' 
              : 'border-[#A38C66]/30'
          }`}>
            
            {/* Header do Card de Cadastro - Texto Chamada para o Formulário */}
            <div className="p-6 sm:p-8 border-b border-[#F0F0F0] bg-[#424733] text-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#859159] text-white shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Inscrição Oficial</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                Garanta o seu App EASY MENU EGN agora!
              </h2>
              <p className="text-[#F0F0F0]/90 text-sm sm:text-base mt-2 leading-relaxed">
                Preencha os dados abaixo para iniciar a configuração do seu aplicativo personalizado e levar sua marmitaria para o próximo nível.
              </p>
            </div>

            {/* Formulário (sem CPF) */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
              
              {/* Aviso dinâmico quando a pessoa clica no botão de pagamento antes de preencher */}
              {highlightFormNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-[#613C26]/10 border-2 border-[#613C26] text-[#613C26] flex items-center gap-3 shadow-xs"
                >
                  <Lock className="w-5 h-5 text-[#613C26] shrink-0" />
                  <div className="text-xs sm:text-sm font-bold leading-snug">
                    Por favor, preencha os dados abaixo para liberar o link oficial de pagamento seguro.
                  </div>
                </motion.div>
              )}
              
              {/* Nome Completo */}
              <div>
                <label className="block text-sm font-bold text-[#613C26] mb-1.5">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A38C66]" />
                  <input
                    required
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome completo"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F0F0F0] border border-[#A38C66]/30 rounded-xl text-[#424733] placeholder-[#424733]/50 focus:outline-none focus:ring-2 focus:ring-[#859159] focus:bg-white focus:border-[#859159] transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* WhatsApp e E-mail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-[#613C26] mb-1.5">
                    WhatsApp com DDD *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A38C66]" />
                    <input
                      required
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="(00) 00000-0000"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F0F0F0] border border-[#A38C66]/30 rounded-xl text-[#424733] placeholder-[#424733]/50 focus:outline-none focus:ring-2 focus:ring-[#859159] focus:bg-white focus:border-[#859159] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#613C26] mb-1.5">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A38C66]" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="seuemail@exemplo.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F0F0F0] border border-[#A38C66]/30 rounded-xl text-[#424733] placeholder-[#424733]/50 focus:outline-none focus:ring-2 focus:ring-[#859159] focus:bg-white focus:border-[#859159] transition-all text-sm font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-sm font-bold text-[#613C26] mb-1.5">
                  Instagram da sua marmitaria / pessoal *
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A38C66]" />
                  <input
                    required
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    placeholder="@seuperfil"
                    className="w-full pl-11 pr-4 py-3.5 bg-[#F0F0F0] border border-[#A38C66]/30 rounded-xl text-[#424733] placeholder-[#424733]/50 focus:outline-none focus:ring-2 focus:ring-[#859159] focus:bg-white focus:border-[#859159] transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Cidade e Estado */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-[#613C26] mb-1.5">
                    Cidade *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A38C66]" />
                    <input
                      required
                      type="text"
                      name="cidade"
                      value={formData.cidade}
                      onChange={handleChange}
                      placeholder="Sua cidade"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#F0F0F0] border border-[#A38C66]/30 rounded-xl text-[#424733] placeholder-[#424733]/50 focus:outline-none focus:ring-2 focus:ring-[#859159] focus:bg-white focus:border-[#859159] transition-all text-sm font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#613C26] mb-1.5">
                    Estado *
                  </label>
                  <select
                    required
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-3 py-3.5 bg-[#F0F0F0] border border-[#A38C66]/30 rounded-xl text-[#424733] focus:outline-none focus:ring-2 focus:ring-[#859159] focus:bg-white focus:border-[#859159] transition-all text-sm font-bold cursor-pointer"
                  >
                    {ESTADOS_BRASIL.map((uf) => (
                      <option key={uf} value={uf} className="bg-white text-[#424733]">
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Botão de Envio */}
              <div className="pt-4">
                <button
                  id="btn-submit-lead"
                  disabled={isSubmitting}
                  type="submit"
                  className={cn(
                    "w-full py-4 px-6 bg-[#613C26] hover:bg-[#424733] text-white font-black text-lg sm:text-xl rounded-xl transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 tracking-tight cursor-pointer",
                    isSubmitting && "opacity-75 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>Salvando dados e direcionando para o pagamento...</>
                  ) : (
                    <span>Garantir meu App EASY MENU EGN agora</span>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-center text-[#424733]/70 text-xs mt-3.5">
                  <span>🔒 Seus dados serão gravados com segurança e você será direcionado para o pagamento.</span>
                </div>
              </div>

            </form>
          </div>
        )}
      </main>

      {/* Conteúdo Informativo: Vantagens, Depoimentos e Valores (Último Bloco) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">

          {/* Seção Vantagens e Benefícios de ter o seu App Personalizado */}
          <div className="text-left mb-12 sm:mb-16">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#613C26] tracking-tight">
                Vantagens e Benefícios de ter o seu App Personalizado
              </h2>
              <div className="w-16 h-1 bg-[#859159] mx-auto mt-2.5 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Benefício 1 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#859159]/15 text-[#859159] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-6 h-6 text-[#859159]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-[#613C26] leading-snug">
                    Profissionalização imediata
                  </h3>
                  <p className="text-sm sm:text-base text-[#424733] leading-relaxed">
                    Transmita autoridade e credibilidade com um aplicativo com a identidade do método EGN.
                  </p>
                </div>
              </div>

              {/* Benefício 2 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#859159]/15 text-[#859159] flex items-center justify-center shrink-0 mt-0.5">
                  <SlidersHorizontal className="w-6 h-6 text-[#859159]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-[#613C26] leading-snug">
                    Gestão simplificada do negócio
                  </h3>
                  <p className="text-sm sm:text-base text-[#424733] leading-relaxed">
                    Organize pedidos, cardápio digital e rotina em um só lugar, reduzindo erros e economizando tempo.
                  </p>
                </div>
              </div>

              {/* Benefício 3 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#859159]/15 text-[#859159] flex items-center justify-center shrink-0 mt-0.5">
                  <ShoppingBag className="w-6 h-6 text-[#859159]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-[#613C26] leading-snug">
                    Experiência de compra superior
                  </h3>
                  <p className="text-sm sm:text-base text-[#424733] leading-relaxed">
                    Ofereça aos seus clientes uma navegação prática, rápida e intuitiva para fazerem pedidos.
                  </p>
                </div>
              </div>

              {/* Benefício 4 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#859159]/15 text-[#859159] flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingUp className="w-6 h-6 text-[#859159]" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-base sm:text-lg text-[#613C26] leading-snug">
                    Foco em crescimento
                  </h3>
                  <p className="text-sm sm:text-base text-[#424733] leading-relaxed">
                    Deixe a tecnologia cuidar da rotina enquanto você foca na produção e na expansão da sua marmitaria.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Depoimentos de alunas que já adquiriram o app */}
          <div className="text-left mb-12 sm:mb-16">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-[#859159]/15 text-[#859159] mb-2">
                <Quote className="w-3.5 h-3.5" />
                <span>Histórias Reais</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#613C26] tracking-tight">
                Depoimentos de alunas que já adquiriram o app
              </h2>
              <div className="w-16 h-1 bg-[#859159] mx-auto mt-2.5 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Depoimento 1 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex text-[#A38C66] gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#A38C66]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#859159]/10 text-[#859159] border border-[#859159]/20">
                      Aluna EGN
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-[#424733] italic leading-relaxed">
                    "Minha maior dificuldade quando comecei a vender era exatamente não ter um cardápio, eu não sabia nem como mandar as minhas marmitas pro cliente escolher. Eu acredito que isso é o melhor investimento, e sei que isso vai me ajudar e muito"
                  </p>
                </div>
              </div>

              {/* Depoimento 2 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex text-[#A38C66] gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#A38C66]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#859159]/10 text-[#859159] border border-[#859159]/20">
                      Aluna EGN
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-[#424733] italic leading-relaxed">
                    "Superou as minhas expectativas, já vendo marmitas há mais de 20 anos, e meu sonho sempre foi ter um aplicativo para realizar as minhas vendas, e agora eu consegui realizar esse sonho através de você, é como se fosse um filho que está nascendo, tá lindo demais, parece que você entrou na minha cabeça e conseguiu pegar todos os pensamentos dá maneira como deveria ser feito, muito obrigada e principalmente por ter feito do jeitinho que eu queria!"
                  </p>
                </div>
              </div>

              {/* Depoimento 3 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex text-[#A38C66] gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#A38C66]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#859159]/10 text-[#859159] border border-[#859159]/20">
                      Aluna EGN
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-[#424733] italic leading-relaxed">
                    "Eu tô encantanda com o serviço de vocês, vocês estão de parabéns, eu tô apaixonada pelo aplicativo. É um trabalho muito bem feito, é muito capricho e realmente é tudo que a gente precisa, a falta de tempo e por a gente ser sozinha e não ter uma assessoria, ele vai ajudar muito. Tô encantada mesmo, acho que se tem uma coisa que eu fiz direito, foi isso! Obrigada"
                  </p>
                </div>
              </div>

              {/* Depoimento 4 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex text-[#A38C66] gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#A38C66]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#859159]/10 text-[#859159] border border-[#859159]/20">
                      Aluna EGN
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-[#424733] italic leading-relaxed">
                    "Um agradecimento especial para Pati que foi super competente no desenvolvimento da solução (aplicatvo)."
                  </p>
                </div>
              </div>

              {/* Depoimento 5 */}
              <div className="p-5 sm:p-6 bg-white rounded-2xl border border-[#A38C66]/30 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between md:col-span-2">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex text-[#A38C66] gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#A38C66]" />
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#859159]/10 text-[#859159] border border-[#859159]/20">
                      Aluna EGN
                    </span>
                  </div>
                  <p className="text-sm sm:text-base text-[#424733] italic leading-relaxed">
                    "Quero dizer que estou gostando muito da proposta do aplicativo, eu estou encantadissima com o seu trabalho e não vejo a hora de ver o meu pronto hehehe e achei muito legal a parceria que vocês fizeram. Inclusive, sou muito grata pela condição diferenciada que conseguimos por meio dessa parceria com a escola da chef. 🥰 Uma grande oportunidade para quem está iniciando agora."
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Seção Investimento e Condições de Pagamento (Último bloco da página antes do rodapé) */}
          <div id="valores" className="text-left">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-3xl font-extrabold text-[#613C26] tracking-tight">
                Investimento e Condições de Pagamento
              </h2>
              <div className="w-16 h-1 bg-[#859159] mx-auto mt-2.5 rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Box 1 (Esquerda): 1º Ano / 12 Primeiros Meses */}
              <div className="p-6 sm:p-7 bg-white rounded-3xl border-2 border-[#859159] shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#859159] text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  1º Ano
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-[#859159]/15 text-[#859159] mb-3">
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>1º Ano • Configuração + Mensalidade</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#613C26]">
                    Primeiros 12 Meses
                  </h3>
                  <div className="my-3">
                    <span className="text-3xl sm:text-4xl font-black text-[#613C26] tracking-tight">
                      12x de R$ 138,90
                    </span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#424733]/90 bg-[#F0F0F0] p-3.5 rounded-xl border border-[#A38C66]/20 leading-relaxed mt-2">
                  Valor mensal durante o 1º ano (taxa de configuração do app somada à mensalidade dividida em 12 parcelas). 1ª cobrança na assinatura do contrato e as demais no mesmo dia nos meses subsequentes.
                </p>
              </div>

              {/* Box 2 (Direita): A partir da 13ª Parcela / Somente Mensalidade */}
              <div className="p-6 sm:p-7 bg-white rounded-3xl border-2 border-[#A38C66]/35 shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#613C26] text-white text-[10px] sm:text-xs font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
                  Recorrente
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-[#859159]/15 text-[#859159] mb-3">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>A Partir da 13ª Parcela</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#613C26]">
                    Mensalidade Recorrente
                  </h3>
                  <div className="my-3">
                    <span className="text-3xl sm:text-4xl font-black text-[#613C26] tracking-tight">
                      R$ 81,00
                    </span>
                    <span className="text-base font-bold text-[#859159]">/mês</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#424733]/90 bg-[#F0F0F0] p-3.5 rounded-xl border border-[#A38C66]/20 leading-relaxed mt-2">
                  A partir da 13ª parcela (2º ano em diante), a configuração já está 100% quitada: você paga apenas o valor da mensalidade fixa para manutenção, servidores e suporte contínuo.
                </p>
              </div>
            </div>

            {/* Botão de Ação ao final dos Valores */}
            <div className="mt-8 text-center">
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-[#859159]/20 text-[#424733] border border-[#859159]">
                    <CheckCircle2 className="w-4 h-4 text-[#859159]" />
                    <span>Dados cadastrados com sucesso!</span>
                  </div>
                  <a
                    href={ASAAS_CHECKOUT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#613C26] hover:bg-[#4a2e1d] text-white text-base sm:text-lg font-black rounded-xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-wide cursor-pointer text-center group"
                  >
                    <span>Ir para Pagamento Seguro</span>
                    <ExternalLink className="w-5 h-5 text-[#A38C66] group-hover:translate-x-0.5 transition-transform" />
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleScrollToForm}
                    className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#613C26] hover:bg-[#4a2e1d] text-white text-base sm:text-lg font-black rounded-xl shadow-xl hover:shadow-2xl transition-all uppercase tracking-wide cursor-pointer text-center group"
                  >
                    <span>Quero Garantir Meu App Agora</span>
                    <ArrowUp className="w-5 h-5 text-[#A38C66] group-hover:-translate-y-1 transition-transform" />
                  </button>
                  <p className="text-xs sm:text-sm text-[#424733]/85 font-semibold flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#613C26]" />
                    <span>Preencha seus dados no formulário acima para liberar o pagamento seguro</span>
                  </p>
                </div>
              )}
            </div>
          </div>

      </section>

      {/* Footer com Identidade EGN & EASY BYZ */}
      <footer className="border-t border-[#A38C66]/30 bg-[#424733] py-12 px-4 text-[#F0F0F0] text-center text-sm">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Logo EASY BYZ no Rodapé */}
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-xs text-[#A38C66] uppercase tracking-wider font-semibold">
              Desenvolvido & Comercializado por
            </span>
            <a 
              href="https://links-easybyzcreator.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block hover:opacity-90 transition-opacity"
              title="EASY BYZ CREATOR"
            >
              <img 
                src="/assets/branding/logo-easy-byz-transparente.png" 
                alt="EASY BYZ CREATOR" 
                className="h-28 sm:h-36 w-auto object-contain mx-auto transition-transform hover:scale-105 duration-300 drop-shadow-[0_4px_16px_rgba(255,255,255,0.15)]"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://raw.githubusercontent.com/easybyzcreator/imagens/9fc148274cd353c88914a2fe080ae53f1902e36b/logo%20easy%20byz%20-%20fundo%20transparente.png";
                }}
              />
            </a>
          </div>

          <div className="space-y-1">
            <p className="font-extrabold text-base sm:text-lg text-[#F0F0F0]">
              EGN - Escola de Gastronomia e Negócios
            </p>
            <p className="text-xs text-[#A38C66] max-w-md mx-auto">
              Aplicativo estruturado sob a metodologia oficial da EGN e desenvolvido com tecnologia EASY BYZ.
            </p>
          </div>
          
          {/* Botão de Dúvidas EASY BYZ (+1 803 888 9018) */}
          <div className="pt-2">
            <a 
              href={`https://wa.me/${EASYBYZ_WHATSAPP}?text=${encodeURIComponent(DEFAULT_SUPPORT_MSG)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-[#613C26] hover:bg-[#859159] text-white border border-[#A38C66]/40 rounded-2xl sm:rounded-full text-center transition-all shadow-md hover:shadow-lg max-w-md mx-auto group"
            >
              <MessageCircle className="w-5 h-5 text-[#A38C66] shrink-0 group-hover:text-white transition-colors" />
              <div className="flex flex-col text-center">
                <span className="text-xs sm:text-sm font-semibold text-[#F0F0F0]/90 leading-tight">
                  Dúvidas sobre o aplicativo?
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-white leading-tight mt-0.5">
                  Falar com a Pati (Easy Byz) no WhatsApp
                </span>
              </div>
            </a>
          </div>

          <p className="text-[11px] text-[#F0F0F0]/50 pt-4">
            © 2026 EASY BYZ & EGN. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
