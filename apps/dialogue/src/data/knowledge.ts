export interface KnowledgeItem {
  id: string;
  keywords: string[];
  question: string;
  answer: string;
  category: string;
  locale: "ko" | "en" | "all";
}

export const knowledge: KnowledgeItem[] = [
  // Korean
  {
    id: "dialogue-intro-ko",
    keywords: ["dialogue", "대화", "다이얼로그", "뭐야", "무엇", "소개", "앱"],
    question: "Dialogue가 무엇인가요?",
    answer:
      "Dialogue는 100% 오프라인에서 동작하는 대화형 학습 도구입니다. 인터넷 연결 없이도 문서화된 데이터를 기반으로 즉각적인 질의응답을 제공하며, 스스로 학습하고 지식을 탐구할 수 있는 환경을 제공합니다.",
    category: "general",
    locale: "ko",
  },
  {
    id: "offline-ko",
    keywords: ["오프라인", "인터넷", "연결", "네트워크", "offline"],
    question: "오프라인에서도 작동하나요?",
    answer:
      "네! Dialogue는 PWA(Progressive Web App) 기술을 사용하여 완전한 오프라인 지원을 제공합니다. 한 번 로드하면 인터넷 연결 없이도 모든 기능을 사용할 수 있습니다.",
    category: "features",
    locale: "ko",
  },
  {
    id: "how-works-ko",
    keywords: ["어떻게", "작동", "원리", "방식", "AI", "신경망"],
    question: "어떻게 작동하나요?",
    answer:
      "Dialogue는 신경망이나 AI 모델을 사용하지 않습니다. 대신 미리 문서화된 지식 베이스에서 키워드 매칭을 통해 가장 관련성 높은 답변을 찾아 제공합니다. 이 방식은 빠르고 정확하며, 오프라인에서도 완벽하게 작동합니다.",
    category: "technical",
    locale: "ko",
  },
  {
    id: "pwa-ko",
    keywords: ["PWA", "설치", "앱", "홈화면", "다운로드"],
    question: "앱으로 설치할 수 있나요?",
    answer:
      "네, Dialogue는 PWA로 제작되어 앱처럼 설치하고 사용할 수 있습니다. 브라우저의 주소창이나 메뉴에서 '홈 화면에 추가' 또는 '앱 설치' 옵션을 선택하세요.",
    category: "features",
    locale: "ko",
  },
  {
    id: "language-ko",
    keywords: ["언어", "한국어", "영어", "다국어", "번역"],
    question: "어떤 언어를 지원하나요?",
    answer:
      "현재 한국어와 영어를 지원합니다. 설정에서 원하는 언어로 변경할 수 있으며, 앞으로 더 많은 언어가 추가될 예정입니다.",
    category: "features",
    locale: "ko",
  },

  // English
  {
    id: "dialogue-intro-en",
    keywords: ["dialogue", "what", "about", "intro", "app"],
    question: "What is Dialogue?",
    answer:
      "Dialogue is a conversational learning tool that works 100% offline. It provides instant Q&A based on documented data without requiring an internet connection, creating an environment where you can learn and explore knowledge on your own.",
    category: "general",
    locale: "en",
  },
  {
    id: "offline-en",
    keywords: ["offline", "internet", "connection", "network"],
    question: "Does it work offline?",
    answer:
      "Yes! Dialogue uses PWA (Progressive Web App) technology to provide complete offline support. Once loaded, you can use all features without an internet connection.",
    category: "features",
    locale: "en",
  },
  {
    id: "how-works-en",
    keywords: ["how", "works", "principle", "AI", "neural"],
    question: "How does it work?",
    answer:
      "Dialogue doesn't use neural networks or AI models. Instead, it finds the most relevant answers through keyword matching in a pre-documented knowledge base. This approach is fast, accurate, and works perfectly offline.",
    category: "technical",
    locale: "en",
  },

];
