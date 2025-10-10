"use client";

import { Box, Link, Typography } from "@mui/material";

export default function Imprint() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Impressum
      </Typography>

      <Typography paragraph>Angaben gemäß § 5 TMG:</Typography>

      <Typography paragraph>
        Universität Stuttgart
        <br />
        Institut für Softwaretechnik (ISTE)
        <br />
        Abteilung Softwarequalität und -architektur
        <br />
        Universitätsstraße 38
        <br />
        70569 Stuttgart
        <br />
        Deutschland
      </Typography>

      <Typography paragraph>
        Web:{" "}
        <Link
          href="https://www.iste.uni-stuttgart.de/sqa/"
          target="_blank"
          rel="noopener"
        >
          https://www.iste.uni-stuttgart.de/sqa/
        </Link>
      </Typography>

      <Typography paragraph>
        Gesetzlich vertreten durch:
        <br />
        den Rektor, Prof. Dr.-Ing. Peter Middendorf
      </Typography>

      <Typography paragraph>
        Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:
        <br />
        Niklas Meißner
        <br />
        Institut für Softwaretechnik (ISTE)
        <br />
        Universitätsstraße 38
        <br />
        70569 Stuttgart
        <br />
        E-Mail:{" "}
        <Link href="mailto:niklas.meissner@iste.uni-stuttgart.de">
          niklas.meissner@iste.uni-stuttgart.de
        </Link>
        <br />
        Telefon: +49 711 685 60845
      </Typography>
    </Box>
  );
}
