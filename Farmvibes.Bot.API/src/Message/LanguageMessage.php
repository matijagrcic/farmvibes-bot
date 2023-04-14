<?php

namespace App\Message;

class LanguageMessage
{
    private string $languageCode;
    private bool $isTranslatable;

    public function __construct(string $languageCode, bool $isTranslatable)
    {
        $this->languageCode = $languageCode;
        $this->isTranslatable = $isTranslatable;
    }

    public function getLanguageCode(): string
    {
        return $this->languageCode;
    }

    public function isIstranslatable(): bool
    {
        return $this->isTranslatable;
    }
}
