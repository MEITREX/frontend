"use client";

import { Box, Link, List, ListItem, Typography } from "@mui/material";

export default function Privacy() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Datenschutzerklärung
      </Typography>

      {/* Verantwortlicher */}
      <Typography variant="h6" gutterBottom>
        Verantwortlicher gemäß Art. 4 Nr. 7 DSGVO
      </Typography>
      <Typography paragraph>
        Universität Stuttgart<br />
        Institut für Software Engineering (ISTE)<br />
        Abteilung Softwarequalität und -architektur<br />
        Universitätsstraße 38<br />
        70569 Stuttgart<br />
        Deutschland
      </Typography>
      <Typography paragraph>
        Telefon: +49 711 685 60845 (Niklas Meißner)<br />
        Web:{" "}
        <Link href="https://www.iste.uni-stuttgart.de/sqa/" target="_blank" rel="noopener">
          https://www.iste.uni-stuttgart.de/sqa/
        </Link>
        <br />
        E-Mail:{" "}
        <Link href="mailto:niklas.meissner@iste.uni-stuttgart.de">
          niklas.meissner@iste.uni-stuttgart.de
        </Link>
      </Typography>
      <Typography paragraph>
        Gesetzlich vertreten durch:<br />
        Rektor Prof. Dr.-Ing. Peter Middendorf
      </Typography>

      {/* Datenschutzbeauftragter */}
      <Typography variant="h6" gutterBottom>
        Datenschutzbeauftragter
      </Typography>
      <Typography paragraph>
        Universität Stuttgart<br />
        Datenschutzbeauftragter<br />
        Geschwister-Scholl-Str. 24b<br />
        70174 Stuttgart<br />
        Tel: +49 711 685-83687<br />
        E-Mail:{" "}
        <Link href="mailto:datenschutzbeauftragter@uni-stuttgart.de">
          datenschutzbeauftragter@uni-stuttgart.de
        </Link>
      </Typography>

      {/* Zweck der Verarbeitung */}
      <Typography variant="h6" gutterBottom>
        Zweck der Verarbeitung
      </Typography>
      <Typography paragraph>
        Die Webanwendung <strong>MEITREX</strong> dient der Erforschung und Erprobung einer gamifizierten und adaptiven Lernplattform im Rahmen eines wissenschaftlichen Projekts der Universität Stuttgart.
      </Typography>
      <Typography paragraph>
        Zur Nutzung der Anwendung werden personenbezogene Daten verarbeitet, um:
      </Typography>
      <List sx={{ listStyleType: "disc", pl: 4 }}>
        <ListItem sx={{ display: "list-item" }}>individuelle Nutzerkonten bereitzustellen,</ListItem>
        <ListItem sx={{ display: "list-item" }}>Lernfortschritt, Motivation und Interaktionen zu analysieren,</ListItem>
        <ListItem sx={{ display: "list-item" }}>adaptive und personalisierte Lernempfehlungen bereitzustellen,</ListItem>
        <ListItem sx={{ display: "list-item" }}>die Kommunikation mit dem KI-Tutor und anderen Studierenden zu ermöglichen,</ListItem>
        <ListItem sx={{ display: "list-item" }}>die ordnungsgemäße Funktion, Sicherheit und wissenschaftliche Evaluation sicherzustellen.</ListItem>
      </List>

      {/* Verarbeitete Daten */}
      <Typography variant="h6" gutterBottom>
        Folgende Daten werden erhoben und verarbeitet:
      </Typography>
      <List sx={{ listStyleType: "disc", pl: 4 }}>
        <ListItem sx={{ display: "list-item" }}>Benutzername</ListItem>
        <ListItem sx={{ display: "list-item" }}>Passwort (verschlüsselt gespeichert)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Nutzungsstatistiken (bearbeitete Kapitel, Lernzeit, Aufgabenlösungen, XP-Daten)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Interaktionen mit Gamification-Elementen (z. B. Quests, Achievements, Leaderboards)</ListItem>
        <ListItem sx={{ display: "list-item" }}>HEXAD-Spielertyp-Ergebnisse (bei freiwilliger Teilnahme)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Interaktionen mit dem KI-Tutor (Chatverläufe anonymisiert zur Forschung)</ListItem>
      </List>

      {/* Empfänger */}
      <Typography variant="h6" gutterBottom>
        Empfänger der Daten
      </Typography>
      <Typography paragraph>
        Die Anwendung wird ausschließlich durch das Institut für Software Engineering (ISTE) der Universität Stuttgart betrieben.
        Der Zugriff auf personenbezogene Daten ist auf das verantwortliche Projektteam beschränkt.
        Eine Weitergabe personenbezogener Daten an Dritte erfolgt nicht, außer im Rahmen der technischen Bereitstellung der Plattform
        oder auf Grundlage gesetzlicher Verpflichtungen.
      </Typography>
      <Typography paragraph>
        Daten zu Drittanbieter-Integrationen (z. B. GitHub) werden ausschließlich zur Authentifizierung bei diesen Diensten genutzt.
      </Typography>

      {/* Rechtsgrundlage */}
      <Typography variant="h6" gutterBottom>
        Rechtsgrundlage der Verarbeitung
      </Typography>
      <List sx={{ listStyleType: "disc", pl: 4 }}>
        <ListItem sx={{ display: "list-item" }}>
          Art. 6 Abs. 1 lit. a DSGVO – Einwilligung (z. B. bei Teilnahme an der Forschung)
        </ListItem>
        <ListItem sx={{ display: "list-item" }}>
          Art. 6 Abs. 1 lit. f DSGVO – berechtigtes Interesse an der Durchführung und Verbesserung des Forschungsprojekts
        </ListItem>
      </List>

      {/* Speicherdauer */}
      <Typography variant="h6" gutterBottom>
        Speicherdauer
      </Typography>
      <Typography paragraph>
        Die personenbezogenen Daten werden nur solange gespeichert, wie das Nutzerkonto aktiv ist.
        Nach Löschung des Kontos werden die zugehörigen Daten vollständig entfernt, sofern keine gesetzlichen Aufbewahrungsfristen entgegenstehen.
        Forschungsdaten können in anonymisierter Form länger aufbewahrt werden.
        Eine Löschung kann per E-Mail an{" "}
        <Link href="mailto:niklas.meissner@iste.uni-stuttgart.de">
          niklas.meissner@iste.uni-stuttgart.de
        </Link>{" "}
        beantragt werden.
      </Typography>

      {/* Rechte */}
      <Typography variant="h6" gutterBottom>
        Rechte der betroffenen Personen
      </Typography>
      <List sx={{ listStyleType: "disc", pl: 4 }}>
        <ListItem sx={{ display: "list-item" }}>Auskunft über gespeicherte Daten (Art. 15 DSGVO)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Löschung („Recht auf Vergessenwerden“, Art. 17 DSGVO)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Einschränkung der Verarbeitung (Art. 18 DSGVO)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Datenübertragbarkeit (Art. 20 DSGVO)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Widerspruch (Art. 21 DSGVO)</ListItem>
        <ListItem sx={{ display: "list-item" }}>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</ListItem>
      </List>
      <Typography paragraph>
        Zur Wahrnehmung Ihrer Rechte wenden Sie sich bitte an{" "}
        <Link href="mailto:datenschutzbeauftragter@uni-stuttgart.de">
          datenschutzbeauftragter@uni-stuttgart.de
        </Link>.
      </Typography>

      {/* Beschwerderecht */}
      <Typography variant="h6" gutterBottom>
        Beschwerderecht
      </Typography>
      <Typography paragraph>
        Sie haben das Recht, sich bei der zuständigen Aufsichtsbehörde zu beschweren:
      </Typography>
      <Typography paragraph>
        Der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg<br />
        Web:{" "}
        <Link href="https://www.baden-wuerttemberg.datenschutz.de" target="_blank" rel="noopener">
          https://www.baden-wuerttemberg.datenschutz.de
        </Link>
      </Typography>

      {/* Änderung */}
      <Typography variant="h6" gutterBottom>
        Änderung dieser Datenschutzerklärung
      </Typography>
      <Typography paragraph>
        Diese Datenschutzerklärung kann bei Änderungen der Rechtslage oder der technischen Umsetzung aktualisiert werden.
        Bitte prüfen Sie regelmäßig die jeweils gültige Version auf dieser Website.
      </Typography>
    </Box>
  );
}
