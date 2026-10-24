export interface ShengTerm {
  slang: string;
  phoneticIpa: string;
  englishMeaning: string;
  category: "greetings" | "trouble" | "money" | "humor" | "agreement";
}

export const NAIROBI_SHENG_DICTIONARY: Record<string, ShengTerm> = {
  buda: {
    slang: "Buda",
    phoneticIpa: "ˈbuː.dɑː",
    englishMeaning: "Bro / Friend / Man",
    category: "greetings",
  },
  ngori: {
    slang: "Ngori",
    phoneticIpa: "ˈŋɔː.ri",
    englishMeaning: "Trouble / Dangerous situation / Chaos",
    category: "trouble",
  },
  chapaa: {
    slang: "Chapaa",
    phoneticIpa: "tʃɑːˈpɑː",
    englishMeaning: "Money / Cash",
    category: "money",
  },
  radar: {
    slang: "Radar",
    phoneticIpa: "ˈreɪ.dɑːr",
    englishMeaning: "Awareness / Alertness",
    category: "agreement",
  },
  manze: {
    slang: "Manze",
    phoneticIpa: "ˈmɑːn.zeɪ",
    englishMeaning: "Honestly / For real",
    category: "humor",
  },
  wasee: {
    slang: "Wasee",
    phoneticIpa: "wɑːˈseɪ",
    englishMeaning: "Guys / People",
    category: "greetings",
  },
  chapalap: {
    slang: "Chapa lap",
    phoneticIpa: "ˈtʃɑː.pɑː lɑːp",
    englishMeaning: "Hurry up / Make a quick run",
    category: "trouble",
  },
};

export class ShengPhoneticProcessor {
  /**
   * Pre-processes dialogue text to enhance TTS phonetic pronunciation for East African accents.
   */
  public prepareTextForTTS(text: string, language: "en" | "sw" | "sheng"): string {
    if (language !== "sheng") return text;

    let processed = text;
    // Replace slang with pronunciation hints where applicable
    processed = processed.replace(/\bBuda\b/gi, "Buda");
    processed = processed.replace(/\bngori\b/gi, "ngo-ri");
    processed = processed.replace(/\bmanze\b/gi, "mahn-zeh");
    processed = processed.replace(/\bchapaa\b/gi, "cha-paa");
    return processed;
  }
}

export const shengPhoneticProcessor = new ShengPhoneticProcessor();
