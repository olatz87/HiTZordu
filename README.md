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

- Parte-hartzaile izena sartzea.
- Erabilgarritasuna hiru egoeratan markatzea:
  - Ezinezkoa
  - Behar izanez gero
  - Bai
- Saguarekin edo ukipenarekin sarean arrastatuz tarteak markatzea.
- Taldearen laburpena ikustea.
- Tarte onenak identifikatzea.
- Tarte onenak `.ics` fitxategi gisa esportatzea.
- Datuak backend arinean gordetzea `data/event.json` fitxategian.
- Backend gabe irekitzen bada, `localStorage` fallbacka erabiltzea.

## Garapen-oharrak

Backend-a oraingoz Node-ren built-in `http` moduluarekin eginda dago, dependentziarik
gabe. Hurrengo pausoa ekitaldi bat baino gehiago eta partekatzeko URL iraunkorrak
modelatzea izango litzateke.

## APIa

- `GET /api/event`: uneko ekitaldia eta erantzunak irakurri.
- `PUT /api/event`: ekitaldiaren egoera osoa gorde.
