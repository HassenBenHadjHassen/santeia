import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Globe } from "lucide-react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg hover:bg-accent/50"
        aria-label="Change language"
      >
        <Globe className="h-5 w-5" />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-popover/95 border border-border/50 rounded-xl shadow-xl z-50 backdrop-blur-sm">
          <div className="p-2">
            {languages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                size="sm"
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full justify-start rounded-lg text-sm h-9 ${
                  i18n.language === language.code
                    ? "bg-accent text-accent-foreground"
                    : ""
                }`}
              >
                <span className="mr-3 text-lg">{language.flag}</span>
                {language.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
