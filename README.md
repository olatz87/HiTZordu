# HiTZordu

HiTZ ikerketa taldearentzat bilera-orduak adosteko aplikazioa.

Hasierako helburua When2meet estiloko esperientzia sinplea eskaintzea da,
baina bi hobekuntza nagusirekin:

- `if-need-be` egoera, parte-hartzaileek aukera bat posible baina ez ideala dela
  adierazteko.
- Egutegira esportazioa, aukeratutako tarteak `.ics` fitxategi gisa gordetzeko.

## Martxan jartzea

Node.js 24 LTS behar da. `nvm` erabiliz:

```bash
nvm use
npm start
```

Kontuz: bigarren komandoa `npm start` da, ez `nvm start`.

Bilera berriak sortzea token batekin babesteko, jarri sekretua ingurune-aldagai
moduan zerbitzaria abiatu aurretik:

```bash
export HITZORDU_CREATE_TOKEN="zure-token-luzea-hemen"
npm start
```

Ez jarri token hori `app.js`, `server.js` edo GitHub-era igoko den beste
fitxategi batean. Garapenerako `.env` fitxategi bat erabili nahi baduzu,
lokalean bakarrik sortu; `.gitignore`-n baztertuta dago. Kasu horretan:

```bash
cp .env.example .env
# editatu .env eta bete HITZORDU_CREATE_TOKEN
npm run start:env
```

Antolatzaileari email bidez abisatzeko aukera erabili nahi bada, zerbitzarian
`sendmail` bateragarri bat konfiguratu behar da, adibidez Postfix edo `msmtp`.
Ondoren ingurune-aldagai hauek erabili daitezke:

```bash
export HITZORDU_SENDMAIL="/usr/sbin/sendmail"
export HITZORDU_NOTIFY_FROM="HiTZordu <hitzordu@example.org>"
export HITZORDU_PUBLIC_BASE_URL="https://zure-zerbitzaria.example.org"
```

Abisua hautazkoa da: bilera sortzean espero diren erantzunen kopurua eta
antolatzailearen emaila hutsik uzten badira, ez da mezurik bidaliko.

Aplikazioa hemen irekiko da:

```text
http://127.0.0.1:3000
```

Garapenean fitxategi-aldaketekin serverra automatikoki berrabiarazteko:

```bash
npm run dev
```

Frontend estatikoa oraindik zuzenean ireki daiteke, baina backend-a martxan badago
aplikazioak datuak zerbitzarian gordeko ditu.

## Lehen funtzioak

- Bilera bat baino gehiago kudeatzea.
- Bilera bakoitzerako partekatzeko esteka sortzea (`?meeting=...`), taldeko kideek
  euren erantzunak bete ditzaten.
- Bilera berriak sortzeko token pribatua eskatzea; esteka dutenek, ordea,
  tokenik gabe eman dezakete izena eta erabilgarritasuna.
- Hautazko abisua: espero den erantzun kopurura iristean antolatzaileari emaila
  bidaltzea.
- Google Calendar esteka publiko batetik libre dauden tarteak aurremarkatzea,
  parte-hartzaileak gero eskuz zuzendu ahal izateko.
- Bilera sortu aurretik izena, mota, hasiera, amaiera eta iraupena finkatzea.
- Bi bilera mota:
  - data zehatzak, hilabeteko egutegian klik eginez hautatzeko.
  - bilera orokorra, data zehatzik gabe asteko egunak aukeratzeko.
- Parte-hartzaile izena sartzea.
- Aplikazioa parte-hartzailerik gabe hastea, erabiltzaileak banaka gehitzeko.
- Erabilgarritasuna klik-ziklo batekin markatzea:
  - lehen klika: Bai
  - bigarren klika: Behar izanez gero
  - hirugarren klika: Hutsik
- Klik egin eta gora edo behera arrastatuz egoera bera tarte jarraietan margotzea.
- Egunak jarraian ez daudenean egutegiko zutabeak bereizle bikoitzarekin markatzea.
- Taldearen laburpena ikustea.
- Tarte onenak identifikatzea, bileraren iraupen osoa kontuan hartuta:
  - emaitza optimoak: denek `Bai` esandako blokeak.
  - aukera onenak: denek `Bai` edo `Behar izanez gero` esandako blokeak.
  - hurbilenak: aurrekoak ez daudenean, erantzun positibo gehien dituztenak.
- Tarte onenak `.ics` fitxategi gisa esportatzea.
  - Oraingoz esportazioa data zehatzetako bileretan bakarrik dago gaituta.
- Datuak backend arinean gordetzea `data/store.json` fitxategian.
- Backend gabe irekitzen bada, `localStorage` fallbacka erabiltzea.

## Garapen-oharrak

Backend-a oraingoz Node-ren built-in `http` moduluarekin eginda dago, dependentziarik
gabe. Hurrengo pausoa partekatzeko URL iraunkorrak eta bilera bakoitzeko esteka
publikoa modelatzea izango litzateke.

## APIa

- `POST /api/meetings`: bilera berria sortu, `HITZORDU_CREATE_TOKEN` tokenarekin.
- `GET /api/meetings/:id`: bilera zehatz bat eta haren erantzunak irakurri.
- `PUT /api/meetings/:id`: bilera horretako parte-hartzaileak eta erantzunak gorde.
- `POST /api/calendar/availability`: Google Calendar embed edo public `.ics`
  esteka batetik bilera zehatz baterako libre dauden slotak kalkulatu.

## Google Calendar inportazioa

Parte-hartzaile bakoitzak Google Calendar-eko embed edo public `.ics` esteka
bat itsatsi dezake. Zerbitzariak egutegia unean bertan irakurri, okupatutako
tarteak kalkulatu, eta libre dauden slotak `Bai` gisa aurremarkatzen ditu.
Okupatutako slotak hutsik uzten dira, eta erabiltzaileak gero eskuz aldatu
ditzake.

Funtzio honek data zehatzetako bileretan bakarrik funtzionatzen du. Egutegiak
publikoa izan behar du; HiTZordu-k ez du Google OAuth tokenik edo egutegiaren
edukirik gordetzen, kalkulatutako erabilgarritasuna bakarrik aplikatzen da.
