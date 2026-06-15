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
- Bilera sortu aurretik izena, egunak, hasiera, amaiera eta iraupena finkatzea.
- Parte-hartzaile izena sartzea.
- Aplikazioa parte-hartzailerik gabe hastea, erabiltzaileak banaka gehitzeko.
- Erabilgarritasuna klik-ziklo batekin markatzea:
  - lehen klika: Bai
  - bigarren klika: Behar izanez gero
  - hirugarren klika: Hutsik
- Taldearen laburpena ikustea.
- Tarte onenak identifikatzea.
- Tarte onenak `.ics` fitxategi gisa esportatzea.
- Datuak backend arinean gordetzea `data/store.json` fitxategian.
- Backend gabe irekitzen bada, `localStorage` fallbacka erabiltzea.

## Garapen-oharrak

Backend-a oraingoz Node-ren built-in `http` moduluarekin eginda dago, dependentziarik
gabe. Hurrengo pausoa partekatzeko URL iraunkorrak eta bilera bakoitzeko esteka
publikoa modelatzea izango litzateke.

## APIa

- `GET /api/state`: bilera guztiak eta erantzunak irakurri.
- `PUT /api/state`: aplikazioaren egoera osoa gorde.
