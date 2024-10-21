export interface Example {
    sentence: string;
translation: string;
}

export interface VocabularyItem {
    word: string;
    phonetic: string;
    translation: string;
    definition: string;
    examples: Example[];
}

export interface VocabularyResponse {
    content: VocabularyItem[];
}
  