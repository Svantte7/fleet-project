// src/data/checklist.js
export const DEPARTURE_CHECKLIST = [
  {
    category: 'Ulkoiset tarkastukset',
    icon: '🔍',
    items: [
      {
        key: 'tires',
        label: 'Renkaat ja vanteet',
        desc: 'Tarkista rengaspaineet, kulutuspinta ja renkaiden kunto (ei vaurioita tai epätasaista kulumista). Varmista myös, että pyöränpultit ovat kireällä.',
      },
      {
        key: 'leaks',
        label: 'Nestevuodot ja alusta',
        desc: 'Vilkaise auton alle — näkyykö maassa lätäköitä (öljyä, polttoainetta tai jäähdytinnestettä).',
      },
      {
        key: 'lights',
        label: 'Valot ja heijastimet',
        desc: 'Tarkista kaikkien ajovalojen, kaukovalojen, suuntavilkkujen, takavalojen, jarruvalojen ja äärivalojen toiminta ja puhtaus.',
      },
    ],
  },
  {
    category: 'Ohjaamo ja tekniset tarkistukset',
    icon: '🔧',
    items: [
      {
        key: 'fluids',
        label: 'Nesteet',
        desc: 'Tarkista moottoriöljyn, jäähdytysnesteen, ohjaustehostimen ja lasinpesunesteen määrä.',
      },
      {
        key: 'brakes',
        label: 'Jarrut',
        desc: 'Tee paineilmajärjestelmän toimintakoe (paineen nousu, vuotojen tarkistus ja kuivaimen toiminta).',
      },
      {
        key: 'steering',
        label: 'Ohjauslaitteet ja mittaristo',
        desc: 'Tarkista ohjauspyörän välys ja käynnistä auto. Seuraa mittariston merkkivaloja (varoitusvalot ja ilmanpaineet).',
      },
      {
        key: 'windshield',
        label: 'Tuulilasi ja peilit',
        desc: 'Varmista, että tuulilasi on ehjä ja peilit puhtaat sekä säädetty oikein.',
      },
      {
        key: 'safety',
        label: 'Turvavarusteet',
        desc: 'Tarkista, että sammutin on paikallaan ja katsastettu. Tarkista ADR-varusteet.',
      },
    ],
  },
  {
    category: 'Asiakirjat ja kuljettajan velvollisuudet',
    icon: '📄',
    items: [
      {
        key: 'documents',
        label: 'Asiakirjat',
        desc: 'Varmista, että vaaditut asiakirjat (kuljettajakortti, liikennelupa yms.) ovat mukana.',
      },
    ],
  },
];

export const ALL_CHECKLIST_KEYS = DEPARTURE_CHECKLIST.flatMap(c => c.items.map(i => i.key));
