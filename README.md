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

- `GET /api/state`: bilera guztiak eta erantzunak irakurri.
- `PUT /api/state`: aplikazioaren egoera osoa gorde.
