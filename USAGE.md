# Návod k použití - DOD Rooms

## Pro týmy

### První přístup

1. Otevřete aplikaci na `http://localhost:3000`
2. Uvidíte formulář pro vytvoření týmu
3. Zadejte **název týmu** (musí být unikátní)
4. Vyberte **barvu týmu** (používá se pro identifikaci vašich místností)
5. Klikněte na **Vytvořit tým**

### Hlavní obrazovka

Po vytvoření týmu uvidíte:

**Nahoře:**
- Live počitadlo obsazených/rezervovaných/volných místností
- Váš tým (barevný badge)
- Tlačítko "Změnit tým" (pro přepnutí na jiný tým)

**Seznam místností:**
Místnosti jsou automaticky seřazeny:
1. 🟢 **Volné** (nahoře, abecedně)
2. 🟡 **Rezervované** (podle času do konce rezervace)
3. 🔴 **Obsazené** (podle délky obsazení)
4. ⚪ **Offline** (dole/skryté)

### Akce s místnostmi

#### Obsadit místnost
- Klikněte na **Obsadit** u volné místnosti
- Místnost se okamžitě obsadí vaším týmem
- **POZOR:** Nemůžete obsadit místnost, pokud máte aktivní rezervaci!

#### Rezervovat místnost
- Klikněte na **Rezervovat (5 min)** u volné místnosti
- Rezervace trvá přesně **5 minut**
- Každý tým může mít **max. 1 aktivní rezervaci**
- Vidíte odpočet zbývajícího času
- Po vypršení se místnost automaticky uvolní

#### Uvolnit místnost
- U místností, které váš tým obsazuje, vidíte tlačítko **Uvolnit**
- Kliknutím místnost uvolníte pro ostatní

#### Zrušit rezervaci
- U rezervovaných místností vašeho týmu vidíte **Zrušit rezervaci**
- Použijte, pokud jste si to rozmysleli

### Karty místností

Každá karta zobrazuje:
- **Emoji stavu** (🟢🔴🟡⚪)
- **Název místnosti** (např. Učebna 1)
- **Popis** (Grafika, Elektronika, ...)
- **Čas:**
  - Obsazená: ⏱️ Obsazeno XX:XX (elapsed time)
  - Rezervovaná: ⏳ Zbývá XX:XX (countdown)
- **Držitel:** Badge s názvem a barvou týmu
- **Akční tlačítka** (podle stavu a oprávnění)

### Barevné označení

Karty místností mají **barevný levý okraj** podle barvy týmu, který je obsazuje/rezervuje. Díky tomu rychle poznáte své místnosti.

---

## Pro administrátory

### Přístup

Otevřete `http://localhost:3000/admin`

### Dashboard

**Statistiky v reálném čase:**
- Počet obsazených místností
- Počet rezervovaných místností
- Počet aktivních týmů
- Celková zaplněnost (%)
- Progress bar zaplněnosti

### Historie změn

Klikněte na **Historie změn** pro rozbalení tabulky.

**Zobrazuje:**
- Čas změny
- Tým (barevný badge)
- Místnost
- Typ akce (Obsazeno, Rezervováno, Uvolněno, ...)
- Změna stavu

**Použití:**
- Monitoring aktivity
- Detekce problémů
- Přehled využití místností

### Admin akce s místnostmi

U každé místnosti vidíte tlačítka:
- **Volná** - nastaví místnost jako volnou (vyhodí aktuální tým)
- **Offline** - nastaví místnost jako offline (nedostupná)

Můžete měnit stav jakékoliv místnosti bez omezení.

### Funkce "Nový den"

**Použití:** Na konci akce (konce dne otevřených dveří)

**Co dělá:**
1. Archivuje celou historii změn
2. Vytvoří denní statistiku (DailyStats)
3. Resetuje všechny místnosti na **FREE**
4. Volitelně smaže všechny týmy

**Postup:**
1. Klikněte na **Nový den (archivovat a resetovat)**
2. Otevře se potvrzovací dialog
3. Zaškrtněte **"Smazat všechny týmy"** pokud chcete smazat týmy
   - Zaškrtnuté = Týmy budou smazány (restart od začátku)
   - Nezaškrtnuté = Týmy zůstanou (můžou pokračovat další den)
4. Klikněte **Potvrdit**

**VAROVÁNÍ:** Tato akce je **nevratná**! Historie bude archivována a nelze ji obnovit.

---

## Pravidla a omezení

### Rezervace
- ✅ Lze pouze u **volných** místností
- ✅ Trvá **přesně 5 minut**
- ✅ Tým může mít **max. 1 aktivní rezervaci**
- ❌ Po vypršení se automaticky ruší
- ❌ Nelze prodloužit

### Obsazení
- ✅ Lze pouze u **volných** místností
- ❌ Nelze obsadit, pokud tým má aktivní rezervaci
- ✅ Tým může obsazovat více místností najednou
- ⏱️ Čas obsazení se měří od okamžiku obsazení

### Uvolnění
- ✅ Pouze **vlastník** může uvolnit místnost
- ✅ Admin může uvolnit libovolnou místnost
- ✅ Funguje pro obsazené i rezervované místnosti

### Týmy
- ✅ Název musí být **unikátní**
- ✅ Barva musí být v hex formátu **#RRGGBB**
- 💾 Tým se ukládá do **localStorage** v prohlížeči
- 🔄 Při smazání cache/cookies musíte vytvořit tým znovu

---

## Tipy a triky

### Pro týmy
- **Rezervujte chytře:** Máte pouze 5 minut a max. 1 rezervaci
- **Sledujte čas:** Odpočet vám ukáže, kdy rezervace vyprší
- **Barva = identifikace:** Vyberte výraznou barvu pro snadné rozpoznání
- **Změna týmu:** Pokud chcete použít jiný tým, klikněte "Změnit tým"

### Pro adminy
- **Sledujte dashboard:** Real-time přehled celé akce
- **Historie je důležitá:** Můžete zpětně zkontrolovat, kdo co dělal
- **Offline místnosti:** Použijte pro místnosti, které jsou dočasně nedostupné
- **Nový den na konci:** Nezapomeňte archivovat data na konci akce

---

## Řešení problémů

### "Tým s tímto názvem již existuje"
Někdo už vytvořil tým s tímto názvem. Zvolte jiný název.

### "Místnost není volná"
Někdo ji právě obsadil. Počkejte, až se uvolní.

### "Tým má již aktivní rezervaci"
Můžete mít pouze 1 rezervaci najednou. Počkejte, až vyprší, nebo ji zrušte.

### "Pouze vlastník může uvolnit místnost"
Snažíte se uvolnit místnost jiného týmu. To může pouze admin.

### Místnosti se neaktualizují
- Obnovte stránku (F5)
- Aplikace automaticky načítá změny každé 3 sekundy

### Ztratil jsem svůj tým
Tým je uložen v localStorage prohlížeče. Pokud:
- Smažete cookies/cache
- Použijete jiný prohlížeč
- Použijete inkognito režim

Musíte vytvořit tým znovu (nebo použít stejný prohlížeč).

---

## Technická podpora

V případě problémů kontaktujte administrátora akce.

### Logování
Aplikace loguje všechny akce do databáze (tabulka `History`).
