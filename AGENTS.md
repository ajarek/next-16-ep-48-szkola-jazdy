<!-- BEGIN:nextjs-agent-rules -->

# Zasady projektu

## Next.js: ZAWSZE czytaj dokumentację przed kodowaniem

- Zanim zaczniesz pracę z Next.js, znajdź i przeczytaj odpowiednią dokumentację w `node_modules/next/dist/docs/`.
- Twoje dane treningowe są nieaktualne — dokumentacja jest źródłem prawdy.

## Stos

- Next.js 16.3.6 App Router
- React 19.2.8
- TypeScript strict mode
- Tailwind CSS v4
- Baza danych i autoryzacja: Firebase

## Next.js

- Preferuj `next/image` zamiast zwykłego `<img>` dla lokalnych i zoptymalizowanych obrazów.
- Preferuj `next/font` zamiast ręcznego ładowania fontów z zewnętrznych źródeł.
- Nie używaj `use client` bez konkretnej potrzeby.
- Nie przenoś komponentu do Client Component tylko dlatego, że korzysta z biblioteki UI.

## Firebase

- Firebase Client SDK może być używany w Client Components.
- Firebase Admin SDK może być używany wyłącznie po stronie serwera.
- Nigdy nie umieszczaj sekretów Firebase Admin SDK w kodzie klienta.
- Nigdy nie zapisuj kluczy API, service account credentials ani sekretów w repozytorium.
- Konfigurację Firebase pobieraj ze zmiennych środowiskowych.
- Zawsze sprawdzaj i uwzględniaj reguły bezpieczeństwa Firestore/Storage.
- Operacje wymagające uprawnień administracyjnych wykonuj po stronie serwera.

## Zmienne środowiskowe

- Nigdy nie zapisuj sekretów bezpośrednio w kodzie.
- Korzystaj z `.env.local`.
- Nie commituj `.env.local`.
- Sprawdź `.env.example` przed dodaniem nowych zmiennych.
- Zmienne przeznaczone dla klienta muszą mieć prefiks `NEXT_PUBLIC_`.
- Nie używaj `NEXT_PUBLIC_` dla sekretów.
## Styl kodu

- Domyślnie preferuj komponenty serwerowe.
- Używaj komponentów klienckich tylko wtedy, gdy wymagane są API przeglądarki lub interaktywność.
- Używaj akcji serwera zamiast tras API, gdy to możliwe.
- Unikaj `any`.
- Preferuj Zod do walidacji.
- Preferuj shadcn/ui do stylizowania komponentów.
- Preferuj lucide-react do ikon.
- Do animacji i przejść używaj Framer Motion, ale rób to umiejętnie, nie przesadzaj.

**Ograniczenie języka**:

- Kod, komentarze, komunikaty UI i dokumentacja projektu powinny być w języku polskim.
- Nazwy zmiennych, funkcji, klas, komponentów, plików, folderów, endpointów i pól API mogą być w języku angielskim.
- Nie tłumacz nazw API, bibliotek ani terminów technicznych.

**Styl interface**:

- Zastosuj zmianę trybu ciemnego na jasny w komponencie Navbar.
- Komponent Navbar dodaj do app/layout.tsx, który będzie widoczny na wszystkich stronach. Powinien zawierać logotyp w lewym górnym rogu, który będzie przekierowywał na stronę główną. W prawym dolnym rogu dodaj przycisk, który będzie przełączał tryb jasny/ciemny.
- Dla widoku mobile zastosuj płynne wysuwane menu z lewej strony ekranu.

- Jeśli charakter projektu na to pozwala, zastosuj subtelny efekt wizualny oparty na WebGL/shaderze: gradienty, grid i interaktywny spotlight.
- Efekt nie może negatywnie wpływać na wydajność, dostępność ani urządzenia mobilne.
- Zapewnij możliwość ograniczenia lub wyłączenia efektów dla użytkowników preferujących reduced motion.

-Style CSS Tailwind zapisuj w pliku  app/global.css.
- Jeżeli istnieje DESIGN.md to przenieś style odpowiednio do global.css dostosowując je do struktury tailwind css. Zastosuj się do wytycznych podanych w DESIGN.md. Uwzględniaj zmianę trybu jasny/ciemny,  
-Długie bloki kodu dziel na komponenty w /components. 
-Usuń nieużywane imports w plikach.

## Dostępność

- Stosuj semantyczny HTML.
- Wszystkie elementy interaktywne muszą być dostępne z klawiatury.
- Obrazy wymagają odpowiednich atrybutów alt.
- Formularze powinny posiadać prawidłowe label.
- Nie polegaj wyłącznie na kolorze do przekazywania informacji.
- Uwzględniaj prefers-reduced-motion.
- Dbaj o odpowiedni kontrast w trybie jasnym i ciemnym.

## Architektura

- Utrzymuj logikę biznesową poza komponentami React.
- Używaj ponownie istniejących komponentów interfejsu użytkownika przed tworzeniem nowych.
- Przed utworzeniem nowego komponentu sprawdź, czy podobny komponent już istnieje.
- Przed dodaniem biblioteki sprawdź package.json.
- Przed utworzeniem nowego hooka sprawdź istniejące hooki.
- Nie zmieniaj istniejącej architektury bez uzasadnienia.
- Wprowadzaj najmniejszą zmianę potrzebną do rozwiązania problemu.
- Zachowaj istniejącą strukturę folderów.
- Nie wprowadzaj nowych zależności bez uzasadnienia.
- Twórz przykładowe dane dla każdego typu obiektów w folderze `public/data/`.
- Wygenerowane obrazy umieszczaj w folderze `public/images/`.
- Jeśli usuwasz plik, usuń go fizycznie z dysku. Nie zostawiaj pustych folderów.Usuwaj nieużywane imports w plikach.

## SEO

- Każda publiczna strona powinna posiadać odpowiednie metadata.
- Wykorzystuj mechanizmy Metadata API Next.js.
- Stosuj prawidłową strukturę nagłówków.
- Dla obrazów używaj next/image, jeśli jest to uzasadnione.
- Dla stron wymagających indeksowania uwzględniaj odpowiednie metadata, sitemap i robots.

## Kontrole jakości

Po każdej istotnej zmianie kodu:

1. Uruchom sprawdzanie typów.
2. Uruchom linting.
3. Sprawdź potencjalne problemy z hydratacją.
4. Zweryfikuj zgodność z App Router.
5. Jeśli projekt posiada testy, uruchom odpowiednie testy.

Nie uruchamiaj pełnego zestawu kontroli dla zmian dotyczących wyłącznie dokumentacji, tekstów lub konfiguracji, jeśli nie jest to potrzebne.

## Dokumentacja

Podczas modyfikacji architektury:

- Zaktualizuj plik README.md.
- Zaktualizuj plik AGENTS.md, jeśli konwencje projektu ulegną zmianie.

<!-- END:nextjs-agent-rules -->
