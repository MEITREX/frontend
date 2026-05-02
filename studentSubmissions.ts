export const GROUP_SUBMISSIONS = [
  {
    groupName: "Gruppe 1",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 200
    hdist = 400

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = apos(0,
        -350)
      }

    class("Song") {
        public {
            title : String
            duration : int
        }
      } layout {
        pos = rpos(Genre,
        0, vdist)
      }

    class("Rating") {
        public {
            rating : int [1..5
          ]
        }
      } layout {
        pos = rpos(Song,
        0, vdist)
      }

    interface("User") {
        public {
            createPlaylist(String) : void
            addToPlaylist(Playlist, Song) : void
            rateSong(Song, int) : void
        }
      } layout {
        pos = rpos(Rating,
        0, vdist)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, -(hdist),
        0)
      }

    class("Album") layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Artist") layout {
        pos = rpos(Album,
        0, vdist / 2 + 50)
      }

    class("PremiumUser") {
        public {
            subsriptionEndDate : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 2), vdist / 2 + 50)
      }

    class("FreeUser") {
        public {
            songsToSkip : int
        }
      } layout {
        pos = rpos(User, hdist / 2, vdist / 2 + 50)
      }

    Song --> Genre with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("belongs to",
        0.35,
        -35)
        label("0..*",
        0.1,
        -15)
        label("+genres",
        0.25,
        -22)
      }

    Playlist --<> Song with {
        over = start(Position.Right).line(end(Position.Left))
        label("contains >",
        0.3,
        -15)
        label("0..*",
        0.9,
        15)
        label("+songs",
        0.8,
        22)
      }

    Album --<> Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("< contains",
        0.3,
        -15)
        label("1",
        0.1,
        15)
        label("+album",
        0.2,
        22)
        label("1..*",
        0.9,
        15)
        label("+songs",
        0.8,
        22)
      }

    Artist --> Album with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("releases",
        0.5,
        -30)
        label("1",
        0.1,
        -15)
        label("+artist",
        0.25,
        -20)
        label("0..*",
        0.9,
        -15)
        label("+albums",
        0.8,
        -20)
      }

    Rating --> Song with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("refers to",
        0.5,
        -30)
        label("1",
        0.85,
        -15)
        label("+song",
        0.75,
        -20)
      }

    User --> Rating with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("creates",
        0.5,
        -30)
        label("1",
        0.7,
        -15)
        label("+user",
        0.6,
        -20)
      }

    User --> Playlist with {
        over = start(Position.TopLeft - 0.15).axisAligned(0.65, end(Position.Bottom))
        label("creates",
        0.5,
        30)
      }

    PremiumUser extends User with {
        over = start(Position.Top).axisAligned(-0.35, end(Position.Bottom - 0.2))
      }

    FreeUser extends User with {
        over = start(Position.Top).axisAligned(-0.35, end(Position.Bottom + 0.2))
      }
    }`,
  },
  {
    groupName: "Gruppe 2",
    humanGrade: 25,
    code: `classDiagram {
    vdist = 738
    hdist = 300

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = apos(-450,
        0)
      }

    class("User", abstract = true) {
        public {
            name : String
        }
      } layout {
        pos = apos(596,
        -133)
      }

    class("PremiumUser") {
        public {
            subscriptionEndDate : Date
        }
      } layout {
        pos = rpos(User, -(hdist) - 296, vdist)
      }

    class("FreeUser") {
        public {
            maxSkipsPerDay : Integer
        }
      } layout {
        pos = rpos(User,
        150, vdist)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(User, hdist / 2 - 379, vdist)
      }

    class("Rating") {
        public {
            stars : Integer
        }
      } layout {
        pos = rpos(User, hdist * 1.5 + 97, vdist)
      }

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = apos(-300,
        150)
      }

    class("Album") {
        public {
            title : String
        }
      } layout {
        pos = rpos(Artist,
        0, vdist)
      }

    class("Song") {
        public {
            title : String
            duration : Integer
            genre : Genre
        }
      } layout {
        pos = rpos(Playlist,
        -4, vdist * 1.5 - 393)
      }

    PremiumUser extends User with {
        over = start(Position.Top).axisAligned(0, end(Position.Left))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    User -- Playlist with {
        over = start(Position.Bottom + 0.1).line(end(Position.Top))
        label("1",
        0.1,
        -15)
        label("*",
        0.9,
        -15)
        label("Erstellt",
        0.5,
        -30)
      }

    User -- Rating with {
        over = start(Position.BottomRight).axisAligned(-0.747, end(Position.Top))
        label("1",
        0.1,
        -15)
        label("*",
        0.9,
        -15)
        label("Erstellt",
        0.5,
        -30)
      }

    Playlist -- Song with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("*",
        0.1,
        -15)
        label("Enthält",
        0.5,
        -30)
      }

    Rating -- Song with {
        over = start(Position.Bottom).axisAligned(0, end(Position.Right))
        label("*",
        0.1,
        -15)
        label("1",
        0.9,
        15)
        label("Bewertet",
        0.4,
        35)
      }

    Artist --> Album with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("1",
        0.1,
        -15)
        label("*",
        0.9,
        -15)
        label("Veröffentlicht",
        0.5,
        -45)
      }

    Album *-- Song with {
        over = start(Position.Bottom).axisAligned(0, end(Position.Left))
        label("1",
        0.05,
        -15)
        label("1..*",
        0.95,
        -20)
        label("Enthält",
        0.5,
        -15)
      }
    }`,
  },
  {
    groupName: "Gruppe 3",
    humanGrade: 40,
    code: `classDiagram {
    vdist = 220
    hdist = 397

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = apos(-141,
        -204)
      }

    class("Album") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Artist, hdist,
        -338)
      }

    class("Song") {
        public {
            title : String
            duration : Integer
        }
      } layout {
        pos = rpos(Album, hdist,
        247)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, hdist / 1.5 + 112,
        128)
      }

    class("Rating") {
        public {
            stars : Integer [1..5
          ]
        }
      } layout {
        pos = apos(-400,
        100)
      }

    class("User", abstract = true) {
        public {
            name : String
        }
      } layout {
        pos = rpos(Rating, hdist,
        0)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(User, hdist,
        0)
      }

    class("PremiumUser") {
        public {
            subscriptionEnd : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 2), vdist)
      }

    class("FreeUser") {
        public {
            maxSkipsPerDay : Integer
        }
      } layout {
        pos = rpos(User, hdist / 2, vdist)
      }

    Artist <--> Album with {
        over = start(Position.Right).line(end(Position.Left))
        label("publishes",
        0.5,
        -15)
        label("1",
        0.1,
        15)
        label("artist",
        0.2,
        25)
        label("0..*",
        0.9,
        15)
        label("albums",
        0.8,
        25)
      }

    Album *--> Song with {
        over = start(Position.Right).line(end(Position.Left))
        label("belongs to",
        0.5,
        -15)
        label("1",
        0.1,
        15)
        label("album",
        0.2,
        25)
        label("1..*",
        0.9,
        15)
        label("songs",
        0.8,
        25)
      }

    Song <--> Playlist with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("consists of",
        0.5,
        50)
        label("0..*",
        0.1,
        20)
        label("songs",
        0.2,
        30)
        label("0..*",
        0.9,
        20)
        label("playlists",
        0.8,
        30)
      }

    Rating <--* Song with {
        over = start(Position.Top).axisAligned(0, end(Position.BottomLeft + 0.1))
        label("refers to",
        0.3,
        -15)
        label("0..*",
        0.05,
        -15)
        label("song 1",
        0.95,
        -15)
      }

    User *--> Rating with {
        over = start(Position.Left).line(end(Position.Right))
        label("rates",
        0.5,
        -15)
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    User *--> Playlist with {
        over = start(Position.Right).line(end(Position.Left))
        label("creates",
        0.5,
        -15)
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
        label("playlists",
        0.8,
        25)
      }

    PremiumUser extends User with {
        over = start(Position.Top).axisAligned(-0.4, end(0.199))
      }

    FreeUser extends User with {
        over = start(Position.Top).axisAligned(-0.4, end(0.345))
      }
    }`,
  },
  {
    groupName: "Gruppe 4",
    humanGrade: 25,
    code: `classDiagram {
    vdist = 294
    hdist = 451

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = apos(-400,
        -200)
      }

    class("Song") {
        public {
            title : String
            duration : Integer
        }
      } layout {
        pos = apos(0,
        -200)
      }

    class("Album") {
        public {
            album : String
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Album, hdist,
        0)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song,
        0, vdist)
      }

    class("User") layout {
        pos = apos(349,
        206)
      }

    class("PremiumUser") {
        public {
            endDate : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 3) + 363, -(vdist) + 71)
      }

    class("FreeUser") {
        public {
            maxSkipsPerDay : Integer
        }
      } layout {
        pos = rpos(User, hdist / 3 - 183, -(vdist) + 58)
      }

    class("Ranking") {
        public {
            stars : Integer
        }
      } layout {
        pos = rpos(Playlist,
        -150, vdist)
      }

    Genre --> Song with {
        over = start(Position.Right).line(end(Position.Left))
      }

    Song --> Album with {
        over = start(Position.Right).line(end(Position.Left))
        label("belongs to",
        0.5,
        -15)
        label("1..*",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    Artist --> Album with {
        over = start(Position.Left).line(end(Position.Right))
        label("publishes",
        0.5,
        -15)
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    Playlist --> Song with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("contains",
        0.5,
        -35)
        label("1..*",
        0.9,
        -15)
      }

    User -- Ranking with {
        over = start(Position.Left).axisAligned(0, end(Position.Right))
        label("created",
        0.5,
        -15)
        label("0..*",
        0.9,
        -15)
      }

    Ranking -- Song with {
        over = start(Position.Left).axisAligned(0, end(Position.BottomLeft + 0.1))
      }

    PremiumUser extends User with {
        over = start(Position.Bottom).line(end(Position.TopLeft + 0.2))
      }

    FreeUser extends User with {
        over = start(Position.Bottom).line(end(Position.TopRight - 0.2))
      }
    }`,
  },
  {
    groupName: "Gruppe 6",
    humanGrade: 40,
    code: `classDiagram {
    vdist = 400
    hdist = 600

    class("Song") {
        public {
            title : String
            duration : int
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Album") layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Artist") {
        public {
            publish(Album) : void
        }
      } layout {
        pos = rpos(Album, hdist,
        0)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = apos(1024,
        265)
      }

    class("Rating") {
        public {
            stars : int
        }
      } layout {
        pos = apos(-500,
        450)
      }

    class("User", abstract = true) {
        public {
            createPlaylist() : void
            rateSong() : void
        }
      } layout {
        pos = apos(300,
        800)
      }

    class("PremiumUser") {
        public {
            endDate : Date
        }
      } layout {
        pos = rpos(User,
        -212,
        -438)
      }

    class("FreeUser") {
        public {
            skip : int
        }
      } layout {
        pos = rpos(User,
        112,
        -347)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = apos(1000,
        800)
      }

    Album *-- Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("includes",
        0.5,
        -25)
        label("1..*",
        0.9,
        15)
        label("-songs",
        0.1,
        35)
      }

    Artist -- Album with {
        over = start(Position.Left).line(end(Position.Right))
        label("publishes",
        0.5,
        -25)
        label("1",
        0.1,
        15)
        label("1..*",
        0.9,
        15)
        label("-albums",
        0.2,
        35)
      }

    Song -- Genre with {
        over = start(Position.BottomRight).line(end(Position.Top))
        label("1",
        0.9,
        -20)
        label("*",
        0.1,
        -20)
        label("+genre",
        0.2,
        -40)
      }

    Playlist -- Song with {
        over = start(Position.Top).line(end(Position.BottomRight))
        label("includes",
        0.5,
        35)
        label("0..*",
        0.1,
        -20)
        label("0..*",
        0.9,
        -20)
        label("-songs",
        0.8,
        -40)
      }

    Rating -- Song with {
        over = start(Position.Top).line(end(Position.BottomLeft))
        label("rated",
        0.5,
        -35)
        label("0..*",
        0.1,
        -20)
        label("1",
        0.9,
        -20)
        label("-song",
        0.196,
        -42.4)
      }

    User -- Rating with {
        over = start(Position.Left).axisAligned(0, end(Position.Right))
        label("gives",
        0.5,
        -25)
        label("1",
        0.1,
        15)
        label("-ratings",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("-user",
        0.954,
        31.8)
      }

    User -- Playlist with {
        over = start(Position.Right).line(end(Position.Left))
        label("creates",
        0.5,
        -25)
        label("1",
        0.1,
        15)
        label("-playlists",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
      }

    PremiumUser extends User with {
        over = start(Position.Bottom).line(end(Position.TopLeft))
      }

    FreeUser extends User with {
        over = start(Position.Bottom).line(end(Position.TopRight))
      }
    }`,
  },
  {
    groupName: "Gruppe 7.1",
    humanGrade: 50,
    code: `classDiagram {
    vdist = 324
    hdist = 500

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Album") {
        public {
            title : String
        }
      } layout {
        pos = rpos(Artist, hdist,
        0)
      }

    class("Song") {
        public {
            title : String
            duration : Integer
        }
      } layout {
        pos = rpos(Album,
        54, vdist)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, hdist / 2 + 161,
        10)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = apos(0, vdist)
      }

    class("User", abstract = true) {
        public {
            username : String
        }
      } layout {
        pos = rpos(Playlist,
        0, vdist)
      }

    class("PremiumUser") {
        public {
            subscriptionEndDate : Date
        }
      } layout {
        pos = rpos(User, hdist, -(vdist / 2))
      }

    class("FreeUser") {
        public {
            maxSkipsPerDay : Integer
        }
      } layout {
        pos = rpos(User, hdist, vdist / 2)
      }

    class("Rating") {
        public {
            stars : Integer [1..5
          ]
        }
      } layout {
        pos = rpos(User,
        0, vdist)
      }

    Artist *-- Album with {
        over = start(Position.Right).line(end(Position.Left))
        label("releases >",
        0.5,
        -20)
        label("1",
        0.1,
        15)
        label("+artist",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+albums",
        0.8,
        35)
      }

    Album *-- Song with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("contains >",
        0.5,
        -30,
        90)
        label("1",
        0.1,
        -15)
        label("+album",
        0.2,
        -35)
        label("1..*",
        0.9,
        -15)
        label("+songs",
        0.8,
        -35)
      }

    Playlist -- Song with {
        over = start(Position.Right).line(end(Position.Left))
        label("contains >",
        0.5,
        -20)
        label("0..*",
        0.1,
        15)
        label("+playlists",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+songs",
        0.8,
        35)
      }

    User -- Playlist with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("< creates",
        0.5,
        -30,
        90)
        label("1",
        0.9,
        -15)
        label("+user",
        0.8,
        -35)
        label("0..*",
        0.1,
        -15)
        label("+playlists",
        0.2,
        -35)
      }

    User -- Rating with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("creates >",
        0.5,
        -30,
        90)
        label("1",
        0.1,
        -15)
        label("+user",
        0.2,
        -35)
        label("0..*",
        0.9,
        -15)
        label("+ratings",
        0.8,
        -35)
      }

    Rating -- Song with {
        over = start(Position.Right).axisAligned(0, end(Position.Bottom))
        label("refers to >",
        0.5,
        -20)
        label("0..*",
        0.1,
        15)
        label("+ratings",
        0.2,
        35)
        label("1",
        0.9,
        -15)
        label("+song",
        0.8,
        -35)
      }

    PremiumUser extends User with {
        over = start(Position.Left).axisAligned(0, end(Position.Right + 0.1))
      }

    FreeUser extends User with {
        over = start(Position.Left).axisAligned(0, end(Position.Right - 0.1))
      }
    }`,
  },
  {
    groupName: "Gruppe 7.2",
    humanGrade: 40,
    code: `classDiagram {
    vdist = 400
    hdist = 600

    class("Album") {
        public {
            artist : Artist
            title : String
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Album,
        0, vdist)
      }

    class("Song") {
        public {
            title : String
            duration : int
            album : Album
            genre : Genre
        }
      } layout {
        pos = rpos(Album, hdist,
        0)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, hdist / 1.5, -(vdist / 2))
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song,
        0, vdist)
      }

    class("Rating") {
        public {
            rating : Star
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    enum("Star") {
        entries {
          "1"
          "2"
          "3"
          "4"
          "5"
        }
      } layout {
        pos = rpos(Rating, hdist / 1.5 + 238,
        12)
      }

    class("User") {
        private {
            createPlaylist() : void
            rateSong() : void
        }
      } layout {
        pos = rpos(Rating,
        0, vdist)
      }

    class("FreeUser") {
        public {
            maxSkipSong : int
        }
      } layout {
        pos = rpos(User, -(hdist / 3), vdist)
      }

    class("PremiumUser") {
        public {
            subscriptionEndDate : Date
        }
      } layout {
        pos = rpos(User, hdist / 3, vdist)
      }

    Album *-- Artist with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("0..*",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    Album *-- Song with {
        over = start(Position.Right).line(end(Position.Left))
        label("1",
        0.1,
        -15)
        label("1..*",
        0.9,
        -15)
      }

    Song -- Playlist with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("0..*",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    Song *-- Rating with {
        over = start(Position.Right).line(end(Position.Left))
        label("1",
        0.1,
        -15)
        label("0..*",
        0.9,
        -15)
      }

    User *-- Rating with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    User -- Playlist with {
        over = start(Position.Left).line(end(Position.BottomRight))
      }

    Song --> Genre with {
        over = start(Position.TopRight).line(end(Position.Left))
      }

    Rating --> Star with {
        over = start(Position.Right).line(end(Position.Left))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("Extends",
        0.5,
        -30)
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("Extends",
        0.5,
        30)
      }
    }`,
  },
  {
    groupName: "Gruppe 8",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 450
    hdist = 650

    class("Song") {
        private {
            title : string
            duration : float
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Album") {
        private {
            title : string
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Artist") {
        private {
            name : string
        }
        public {
            publish(album : Album) : void
        }
      } layout {
        pos = rpos(Album, hdist,
        0)
      }

    class("Rating") {
        private {
            title : string
        }
      } layout {
        pos = rpos(Song, hdist / 1.5, vdist / 1.5)
      }

    enum("Stars") {
        entries {
          "1"
          "2"
          "3"
          "4"
          "5"
        }
      } layout {
        pos = rpos(Rating, hdist,
        0)
      }

    class("User") {
        private {
            username : string
        }
        public {
            rate(s : Song, r : Rating) : void
            create(p : Playlist) : void
        }
      } layout {
        pos = rpos(Rating, hdist / 2, vdist / 1.5)
      }

    class("Playlist") {
        private {
            name : string
        }
      } layout {
        pos = rpos(Song,
        0, vdist)
      }

    class("FreeUser") {
        private {
            maxSkips : int
        }
      } layout {
        pos = rpos(User, -(hdist / 3), vdist / 1.2)
      }

    class("PremiumUser") {
        private {
            subscriptionEndDate : date
        }
      } layout {
        pos = rpos(User, hdist / 3, vdist / 1.2)
      }

    enum("Genre") {
        entries {
            Rock
            Pop
            Jazz
            Classical
        }
      } layout {
        pos = apos(-125,
        1013)
      }

    Song -- Album with {
        over = start(Position.Right).line(end(Position.Left))
        label("1..*",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    Album -- Artist with {
        over = start(Position.Right).line(end(Position.Left))
        label("0..*",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    Song -- Rating with {
        over = start(Position.BottomRight).line(end(Position.TopLeft))
        label("1",
        0.1,
        -15)
        label("0..*",
        0.9,
        -15)
      }

    Rating --> Stars with {
        over = start(Position.Right).line(end(Position.Left))
        label("0..*",
        0.1,
        15)
        label("1",
        0.9,
        15)
        label("+stars",
        0.9,
        35)
      }

    Rating -- User with {
        over = start(Position.BottomRight).line(end(Position.Left))
        label("0..*",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    Song -- Playlist with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("0..*",
        0.1,
        -15)
        label("0..*",
        0.9,
        -15)
      }

    Playlist -- User with {
        over = start(Position.Right).line(end(Position.BottomLeft))
        label("0..*",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    Song -- Genre with {
        over = start(Position.Left).axisAligned(0, end(Position.Top))
        label("1..5",
        0.9,
        -15)
        label("+genres",
        0.9,
        9.4)
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
  {
    groupName: "Gruppe 9",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 513
    hdist = 650

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = apos(0, -(400))
      }

    class("Song") {
        public {
            titel : String
            dauerInSekunden : int
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Album") {
        public {
            titel : String
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Künstler") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Album,
        0, vdist)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, -(hdist) + 12, vdist)
      }

    class("Nutzer", abstract = true) {
        public {
            name : String
            bewerten(Song : song, sterne : int) : void
        }
      } layout {
        pos = rpos(Song,
        0, vdist * 1.5)
      }

    class("Bewertung") {
        public {
            sterne : int
        }
      } layout {
        pos = rpos(Nutzer, -(hdist / 1.5) + 140, -(vdist / 2) - 259)
      }

    comment("{self.sterne >= 1 and self.sterne <= 5}") layout {
        pos = rpos(Bewertung,
        0,
        100)
      } .. Bewertung with {
        over = start(0.841).axisAligned(0.5, end(0.5))
      }

    class("PremiumNutzer") {
        public {
            aboEnddatum : Date
        }
      } layout {
        pos = rpos(Nutzer, -(hdist / 3), vdist / 1.5)
      }

    class("FreeNutzer") {
        public {
            überspringbareSongs : int
        }
      } layout {
        pos = rpos(Nutzer, hdist / 3, vdist / 1.5)
      }

    Song --> Genre with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("0..*",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
        label("-genres",
        0.8,
        35)
      }

    Song -- Album with {
        over = start(Position.Right).line(end(Position.Left))
        label("1..*",
        0.1, -(15))
        label("-songs",
        0.2, -(35))
        label("1",
        0.9, -(15))
        label("-album",
        0.8, -(35))
      }

    Album -- Künstler with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("0..*",
        0.1,
        15)
        label("-alben",
        0.2,
        35)
        label("1",
        0.9,
        15)
        label("-künstler",
        0.8,
        35)
      }

    Playlist -- Song with {
        over = start(Position.Top).axisAligned(0, end(Position.Left))
        label("0..*",
        0.1, -(15))
        label("-playlists",
        0.2, -(35))
        label("0..*",
        0.9,
        15)
        label("-songs",
        0.925,
        41.1)
      }

    Nutzer -- Playlist with {
        over = start(Position.Left).line(end(Position.Right))
        label("1",
        0.1,
        15)
        label("-nutzer",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("-playlists",
        0.8,
        35)
      }

    Nutzer -- Song with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("0..*",
        0.1,
        15)
        label("-bewertet",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("-bewertetVon",
        0.8,
        35)
      }

    Bewertung .. Nutzer with {
        // Hier war der Fehler: 0.5 entfernt, da line() einen Punkt erwartet
        over = start(Position.Right).line(end(Position.Top))
      }

    PremiumNutzer extends Nutzer with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    FreeNutzer extends Nutzer with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
  {
    groupName: "Gruppe 10",
    humanGrade: 50,
    code: `classDiagram {
    vdist = 400
    hdist = 690

    class("Song") {
        public {
            title: String
            duration: Integer
            genre: Genre
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Rating") {
        public {
            value: Integer
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("User", abstract = true) {
        public {
            name: String
        }
      } layout {
        pos = rpos(Rating, hdist,
        150)
      }

    class("Playlist") {
        public {
            title: String
        }
      } layout {
        pos = rpos(Song, hdist, vdist / 1.5)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, hdist / 1.5, vdist * 1.5)
      }

    class("Album") {
        public {
            title: String
        }
      } layout {
        pos = rpos(Song,
        0, vdist * 1.5)
      }

    class("Artist") {
        public {
            name: String
        }
      } layout {
        pos = rpos(Album,
        0, vdist)
      }

    class("FreeUser") {
        public {
            maxSkips: Integer
        }
      } layout {
        pos = rpos(User, -(hdist / 4), vdist)
      }

    class("PremiumUser") {
        public {
            subscriptionEnd: Long
        }
      } layout {
        pos = rpos(User, hdist / 4, vdist)
      }

    Song --<> Rating with {
        over = start(Position.Top).axisAligned(0, end(Position.Top))
        label("1",
        0.1,
        15)
        label("is for",
        0.2,
        35)
        label("*",
        0.9,
        15)
        label("contains",
        0.8,
        35)
      }

    Playlist <>-- Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("*",
        0.1,
        15)
        label("included in",
        0.2,
        35)
        label("*",
        0.9,
        15)
        label("contains",
        0.8,
        35)
      }

    User *-- Playlist with {
        over = start(Position.Left).line(end(Position.Right))
        label("1",
        0.1,
        15)
        label("owned by",
        0.2,
        35)
        label("*",
        0.9,
        15)
        label("creates",
        0.8,
        35)
      }

    User *-- Rating with {
        over = start(Position.Top).axisAligned(0, end(Position.Right))
        label("1",
        0.1,
        15)
        label("created by",
        0.2,
        35)
        label("*",
        0.963,
        13)
        label("creates",
        0.949,
        43.9)
      }

    Album *-- Song with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("1",
        0.1,
        15)
        label("is part of",
        0.2,
        35)
        label("1..*",
        0.9,
        15)
        label("contains",
        0.8,
        35)
      }

    Album --* Artist with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("*",
        0.1,
        15)
        label("publishes",
        0.2,
        35)
        label("1",
        0.9,
        15)
        label("owned by",
        0.8,
        35)
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
  {
    groupName: "Gruppe 11",
    humanGrade: 50,
    code: `classDiagram {
    vdist = 400
    hdist = 600

    class("Song") {
        public {
            name : String
            duration : int
            genre : Genre
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Album") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Album,
        0, vdist)
      }

    class("Rating") {
        public {
            stars : int
        }
      } layout {
        pos = rpos(Song,
        0, vdist)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, hdist / 1.5 - 100, vdist / 1.2 - 36)
      }

    class("User", abstract = true) {
        public {
            createPlaylist(in_name : String, in_songs : Song) : Playlist
            rateSong(in_song : Song, in_stars : int) : void
        }
      } layout {
        pos = rpos(Rating, hdist / 2, vdist)
      }

    class("PremiumUser") {
        public {
            subscriptionEnd : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 3), vdist)
      }

    class("FreeUser") {
        public {
            skippableSongs : int
        }
      } layout {
        pos = rpos(User, hdist / 3, vdist)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = apos(1000,
        200)
      }

    Album *-- Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("consistsOf",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("+ album",
        0.2,
        35)
        label("1..*",
        0.9,
        15)
        label("+ songs",
        0.8,
        35)
      }

    Artist *-- Album with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("published",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("+ artist",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+ albums",
        0.8,
        35)
      }

    Song -- Rating with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("hasRating",
        0.5,
        25,
        90)
        label("1",
        0.1, -(15))
        label("+ ratedSong",
        0.2, -(35))
        label("0..*",
        0.9, -(15))
        label("+ songRating",
        0.8, -(35))
      }

    Song -- Playlist with {
        over = start(Position.BottomRight).line(end(Position.Top))
        label("hasSong",
        0.5, -(25))
        label("0..*",
        0.1,
        15)
        label("+ songs",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+ playlists",
        0.8,
        35)
      }

    User *-- Rating with {
        over = start(Position.TopLeft).line(end(Position.Bottom))
        label("made",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
        label("+ ratings",
        0.8,
        35)
      }

    User *-- Playlist with {
        over = start(Position.TopRight).axisAligned(0, end(Position.Bottom))
        label("created",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
        label("+ playlists",
        0.8,
        35)
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
  {
    groupName: "Gruppe 12",
    humanGrade: 50,
    code: `classDiagram {
    vdist = 337
    hdist = 600

    class("Artist") {
        public {
            publish(album : Album) : void
        }
      } layout {
        pos = apos(65,
        -45)
      }

    class("Album") layout {
        pos = rpos(Artist, hdist,
        100)
      }

    class("Song") {
        public {
            title : String
            durationInSec : int
            genre : Genre
        }
      } layout {
        pos = rpos(Album, -(hdist / 1.2) + 102, vdist / 1.5 + 22)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, -(hdist / 1.2),
        150)
      }

    class("User", abstract = true) {
        public {
            createPlaylist(name : String, songs : Songs) : Playlist
            rateSong(song : Song, stars : int) : Rating
        }
      } layout {
        pos = rpos(Song,
        -209, vdist)
      }

    class("Rating") {
        public {
            stars : int
        }
      } layout {
        pos = rpos(User, -(hdist) + 9,
        73)
      }

    comment("1 <= stars <= 5") layout {
        pos = rpos(Rating, -(150),
        100)
      } .. Rating

    class("PremiumUser") {
        public {
            subscriptionEnd : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 3), vdist / 1.5)
      }

    class("FreeUser") {
        public {
            maxSkipSongs : int
        }
      } layout {
        pos = rpos(User, hdist / 3, vdist / 1.5)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, hdist,
        100)
      }

    Artist -- Album with {
        over = start(Position.Right).line(end(Position.Top))
        label("publishes >",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("+ artist",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+ albums {unique}",
        0.8,
        35)
      }

    Album *-- Song with {
        over = start(Position.Bottom).axisAligned(0, end(Position.Right))
        label("is in >",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("+ album",
        0.2,
        35)
        label("1..*",
        0.9,
        15)
        label("+ songs {unique, ordered}",
        0.8,
        35)
      }

    Playlist -- Song with {
        over = start(Position.Top).line(end(Position.Left))
        label("contains >",
        0.5, -(25))
        label("0..*",
        0.1,
        15)
        label("+ playlists {unique}",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+ songs {ordered}",
        0.8,
        35)
      }

    User -- Playlist with {
        over = start(Position.TopLeft).axisAligned(0, end(Position.Bottom))
        label("creates",
        0.5,
        25)
        label("1",
        0.1,
        15)
        label("+ owner",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+ playlists {unique}",
        0.8,
        35)
      }

    User -- Rating with {
        over = start(Position.Left).line(end(Position.Bottom))
        label("creates",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("+ user",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+ allRatings {unique}",
        0.8,
        35)
      }

    Rating -- Song with {
        over = start(Position.Top).axisAligned(0, end(Position.Left))
        label("rates >",
        0.717,
        -33.7)
        label("0..*",
        0.1,
        15)
        label("+ allRatings {unique}",
        0.371,
        30.6)
        label("1",
        0.9,
        15)
        label("+ ratedSong",
        0.951,
        59.9)
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
  {
    groupName: "Gruppe 13",
    humanGrade: 40,
    code: `classDiagram {
    vdist = 450
    hdist = 650

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Album") {
        public {
            titel : String
        }
      } layout {
        pos = rpos(Artist, hdist,
        0)
      }

    class("Song") {
        public {
            titel : String
            dauer : Integer
            genre : Genre
        }
      } layout {
        pos = rpos(Album,
        0, vdist)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, -(hdist),
        0)
      }

    class("Rating") {
        public {
            sterne : Integer
        }
      } layout {
        pos = rpos(Song, hdist / 1.5, -(vdist / 2))
      }

    class("User") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Rating, hdist / 1.5, -(vdist / 2))
      }

    class("PremiumUser") {
        public {
            aboEnde : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 3), vdist / 1.2)
      }

    class("FreeUser") {
        public {
            maxSkips : Integer
        }
      } layout {
        pos = rpos(User, hdist / 3, vdist / 1.2)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, hdist, vdist)
      }

    Artist -- Album with {
        over = start(Position.Right).line(end(Position.Left))
        label("veröffentlicht",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("*",
        0.9,
        15)
      }

    Album *-- Song with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("enthält",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("1..*",
        0.9,
        15)
      }

    Song -- Rating with {
        over = start(Position.Right).line(end(Position.Bottom))
        label("hat",
        0.5, -(25),
        45)
        label("1",
        0.1,
        15)
        label("*",
        0.9,
        15)
      }

    Rating -- User with {
        over = start(Position.TopRight).line(end(Position.Left))
        label("erstellt",
        0.5, -(25))
        label("*",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    User -- Playlist with {
        over = start(Position.Bottom).axisAligned(0, end(Position.Top))
        label("erstellt",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("*",
        0.9,
        15)
      }

    Playlist -- Song with {
        over = start(Position.Left).line(end(Position.BottomRight))
        label("beinhaltet",
        0.5, -(25), -(45))
        label("*",
        0.1,
        15)
        label("*",
        0.9,
        15)
      }

    Song .. Genre

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
  {
    groupName: "Gruppe 14",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 400
    hdist = 600

    class("Song") {
        public {
            title: string
            duration_in_seconds: int
            genre: Genre
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Playlist") {
        public {
            title: string
        }
      } layout {
        pos = rpos(Song,
        0, -(vdist))
      }

    class("Album") {
        public {
            title: string
        }
      } layout {
        pos = rpos(Song,
        0, vdist)
      }

    class("Artist") {
        public {
            name: string
            publishAlbum(title): Album
        }
      } layout {
        pos = rpos(Album, hdist,
        0)
      }

    class("Rating") {
        public {
            stars: int
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("User", abstract = true) {
        public {
            username: string
            createPlaylist(title): Playlist
            rateSong(stars): Rating
        }
      } layout {
        pos = rpos(Rating,
        0, -(vdist))
      }

    class("PremiumUser") {
        private {
            subscriptionEndDate: date
        }
      } layout {
        pos = rpos(User, -(hdist / 3), -(vdist))
      }

    class("FreeUser") {
        private {
            maxSkipCount: int
        }
      } layout {
        pos = rpos(User, hdist / 3, -(vdist))
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, -(hdist),
        0)
      }

    User *-- Playlist with {
        over = start(Position.Left).axisAligned(0, end(Position.Right))
        label("◁ creates",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("+ owner",
        0.2,
        35)
        label("*",
        0.9,
        15)
        label("+ ownedPlaylist",
        0.8,
        35)
      }

    User *-- Rating with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("creates ▽",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("+ reviewer",
        0.2,
        35)
        label("*",
        0.9,
        15)
        label("+ submittedRatings",
        0.8,
        35)
      }

    Rating *-- Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("◁ belongs to",
        0.5, -(25))
        label("*",
        0.1,
        15)
        label("+ songRating",
        0.2,
        35)
        label("1",
        0.9,
        15)
        label("+ ratedSong",
        0.8,
        35)
      }

    Playlist <>-- Song with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("contains ▽",
        0.5, -(25),
        90)
        label("*",
        0.1,
        15)
        label("+ container",
        0.2,
        35)
        label("*",
        0.9,
        15)
        label("+ includedSongs",
        0.8,
        35)
      }

    Album *-- Song with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("△ consists of",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("+ source",
        0.2,
        35)
        label("1..*",
        0.9,
        15)
        label("+ tracks",
        0.8,
        35)
      }

    Artist *-- Album with {
        over = start(Position.Left).line(end(Position.Right))
        label("◁ publishes",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("+ performer",
        0.2,
        35)
        label("*",
        0.9,
        15)
        label("+ releasedAlbums",
        0.8,
        35)
      }

    Song -- Genre with {
        over = start(Position.Left).line(end(Position.Right))
      }

    PremiumUser extends User with {
        over = start(Position.Bottom).axisAligned(0, end(Position.Top - 0.2))
      }

    FreeUser extends User with {
        over = start(Position.Bottom).axisAligned(0, end(Position.Top + 0.2))
      }
    }`,
  },
  {
    groupName: "Gruppe 15",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 400
    hdist = 600

    class("Rating") {
        public {
            value : Integer
        }
      } layout {
        pos = apos(0,
        0)
      }

    comment("context Rating\\ninv: value >= 1 and value <= 5") layout {
        pos = rpos(Rating,
        0, -(150))
      } .. Rating

    class("User", abstract = true) layout {
        pos = rpos(Rating,
        0, vdist)
      }

    class("PremiumUser") {
        public {
            subscriptionEnd : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 2), vdist)
      }

    class("FreeUser") {
        public {
            maxSkipsPerDay : Integer
        }
      } layout {
        pos = rpos(User, hdist / 2, vdist)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(User, hdist,
        0)
      }

    class("Song") {
        public {
            title : String
            duration : Integer
            genres : Genres
        }
      } layout {
        pos = rpos(Playlist,
        0, -(vdist))
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song,
        0, vdist * 1.5)
      }

    class("Album") {
        public {
            title : String
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Album,
        0, vdist)
      }

    User *-- Rating with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("author",
        0.9, -(35))
        label("1",
        0.9, -(15))
        label("ratings",
        0.1, -(35))
        label("0..*",
        0.1, -(15))
      }

    Rating -- Song with {
        over = start(Position.Right).axisAligned(0, end(Position.Top))
        label("ratings",
        0.1, -(35))
        label("0..*",
        0.1, -(15))
        label("song",
        0.9, -(35))
        label("1",
        0.9, -(15))
      }

    User *-- Playlist with {
        over = start(Position.Right).line(end(Position.Left))
        label("owner",
        0.1, -(35))
        label("1",
        0.1, -(15))
        label("playlists",
        0.9, -(35))
        label("0..*",
        0.9, -(15))
      }

    Playlist -- Song with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("playlists",
        0.1,
        35)
        label("0..*",
        0.1,
        15)
        label("songs",
        0.9,
        35)
        label("0..*",
        0.9,
        15)
      }

    Album *-- Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("album",
        0.1, -(35))
        label("1",
        0.1, -(15))
        label("songs",
        0.9, -(35))
        label("1..*",
        0.9, -(15))
      }

    Artist *-- Album with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("artist",
        0.1,
        35)
        label("1",
        0.1,
        15)
        label("albums",
        0.9,
        35)
        label("0..*",
        0.9,
        15)
      }

    PremiumUser extends User with {
        over = start(Position.Top).axisAligned(0, end(Position.Bottom - 0.2))
      }

    FreeUser extends User with {
        over = start(Position.Top).axisAligned(0, end(Position.Bottom + 0.2))
      }
    }`,
  },
  {
    groupName: "Gruppe 16",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 513
    hdist = 600

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Song") {
        public {
            album : Album
            title : String
            duration : int
            genre : Genre
        }
      } layout {
        pos = rpos(Genre, hdist,
        0)
      }

    class("Album") {
        public {
            songs : Songs
            artist : Artist
        }
      } layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Artist") {
        public {
            albums : Albums
            releaseAlbum() : void
        }
      } layout {
        pos = rpos(Album, hdist,
        0)
      }

    class("Rating") {
        public {
            rating : int
        }
      } layout {
        pos = rpos(Song,
        39, vdist)
      }

    class("Playlist") {
        public {
            name : String
            songs : Songs
        }
      } layout {
        pos = rpos(Rating,
        306, vdist)
      }

    class("User", abstract = true) {
        public {
            createPlaylist(name : String, songs : Songs) : void
            rateSong(song : Song, rating : int) : Rating
        }
      } layout {
        pos = rpos(Genre,
        0, vdist)
      }

    class("PremiumUser") {
        public {
            subEndDate : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 3), vdist)
      }

    class("FreeUser") {
        public {
            maxSongSkips : int
        }
      } layout {
        pos = rpos(User, hdist / 3, vdist)
      }

    Genre -- Song with {
        over = start(Position.Right).line(end(Position.Left))
        label("< classified as",
        0.5, -(25))
        label("1..*",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    Album *-- Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("< contains",
        0.5, -(25))
        label("1..1",
        0.1,
        15)
        label("album",
        0.2,
        35)
        label("1..*",
        0.9,
        15)
        label("song",
        0.8,
        35)
      }

    Artist -- Album with {
        over = start(Position.Left).line(end(Position.Right))
        label("< publishes",
        0.5, -(25))
        label("1..1",
        0.1,
        15)
        label("artist",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("album",
        0.8,
        35)
      }

    Song -- Rating with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("< receives",
        0.5,
        -59.2,
        267)
        label("1..1",
        0.1,
        15)
        label("song",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("rating",
        0.8,
        35)
      }

    User -- Rating with {
        over = start(Position.Right).line(end(Position.Left))
        label("creates >",
        0.5, -(25))
        label("1..1",
        0.1,
        15)
        label("creator",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("rating",
        0.8,
        35)
      }

    User -- Playlist with {
        over = start(Position.BottomRight).axisAligned(0, end(Position.Left))
        label("creates >",
        0.5, -(25))
        label("1..*",
        0.1,
        15)
        label("creator",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("playlist",
        0.8,
        35)
      }

    Playlist -- Song with {
        over = start(Position.Right).axisAligned(0, end(Position.Right))
        label("includes >",
        0.5,
        25,
        90)
        label("0..*",
        0.1,
        15)
        label("playlist",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("song",
        0.8,
        35)
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
  {
    groupName: "Gruppe 17",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 400
    hdist = 600

    class("Song") {
        public {
            title : String
            duration : Integer
        }
      } layout {
        pos = apos(0,
        0)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, hdist,
        100)
      }

    class("Album") layout {
        pos = rpos(Song, -(hdist),
        100)
      }

    class("Artist") layout {
        pos = rpos(Album,
        0, vdist)
      }

    class("Rating") {
        public {
            rating : Integer
        }
      } layout {
        pos = rpos(Song, -(hdist / 2), vdist)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, hdist / 2, vdist)
      }

    class("User", abstract = true) {
        public {
            createPlaylist() : Playlist
            rateSong(Type, Type) : void
        }
      } layout {
        pos = rpos(Rating, hdist / 2, vdist)
      }

    class("PremiumUser") {
        public {
            subscriptionEndDate : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 3), vdist)
      }

    class("FreeUser") {
        public {
            maxDailySkippableSongs : Integer
        }
      } layout {
        pos = rpos(User, hdist / 3, vdist)
      }

    Album *--> Song with {
        over = start(Position.Top).axisAligned(0, end(Position.Left))
        label("contains >",
        0.751,
        41.1)
        label("1",
        0.1,
        15)
        label("1..*",
        0.9,
        15)
        label("+ songs",
        0.9,
        50.5)
      }

    Song --> Genre with {
        over = start(Position.Right).axisAligned(0, end(Position.Top))
        label("belongsTo >",
        0.52,
        0)
        label("0..*",
        0.9,
        15)
        label("+ genres",
        0.914,
        43.7)
      }

    Artist <>--> Album with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("publishes ^",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
        label("+ albums",
        0.8,
        35)
      }

    User *--> Rating with {
        over = start(Position.Left).axisAligned(0, end(Position.Bottom))
        label("creates ^",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
        label("+ ratings",
        0.8,
        35)
      }

    Rating -- Song with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("1",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    User *--> Playlist with {
        over = start(Position.Right).axisAligned(0, end(Position.Bottom))
        label("creates ^",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
        label("+ playlists",
        0.8,
        35)
      }

    Playlist --> Song with {
        over = start(Position.Top).line(end(Position.BottomRight))
        label("contains ^",
        0.5, -(25),
        45)
        label("0..*",
        0.9,
        15)
        label("+ songs",
        0.8,
        35)
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("Extends",
        0.5, -(30))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("Extends",
        0.5,
        30)
      }
    }`,
  },
  {
    groupName: "Gruppe 18",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 400
    hdist = 600

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = apos(800, -(400))
      }

    class("Song") {
        public {
            title : String
            duration : Integer
            genres : Genres
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, -(hdist),
        0)
      }

    class("Album") layout {
        pos = rpos(Song, hdist,
        0)
      }

    class("Artist") layout {
        pos = rpos(Album,
        0, vdist)
      }

    class("Rating") {
        public {
            stars : Integer [1..5
          ]
        }
      } layout {
        pos = rpos(Song,
        100, vdist / 1.2)
      }

    class("User", abstract = true) layout {
        pos = rpos(Playlist,
        200, vdist * 1.2)
      }

    class("PremiumUser") {
        public {
            subscriptionEndDate : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 2), vdist)
      }

    class("FreeUser") {
        public {
            maxSkipsPerDay : Integer
        }
      } layout {
        pos = rpos(User, hdist / 2, vdist)
      }

    Playlist -- Song with {
        over = start(Position.Right).line(end(Position.Left))
        label("contains >",
        0.5, -(25))
        label("0..*",
        0.1,
        15)
        label("+ playlists",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+ songs",
        0.8,
        35)
      }

    Album *-- Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("1",
        0.1,
        15)
        label("+ album",
        0.2,
        35)
        label("1..*",
        0.9,
        15)
        label("+ songs",
        0.8,
        35)
      }

    Artist *-- Album with {
        over = start(Position.Top).line(end(Position.Bottom))
        label("< publish",
        0.5, -(25),
        90)
        label("1",
        0.9,
        15)
        label("+ artist",
        0.8,
        35)
        label("0..*",
        0.1,
        15)
        label("+ albums",
        0.2,
        35)
      }

    User -- Playlist with {
        over = start(Position.TopLeft).axisAligned(0, end(Position.Bottom))
        label("< creates",
        0.5,
        25)
        label("1",
        0.9,
        15)
        label("+ user",
        0.8,
        35)
        label("0..*",
        0.1,
        15)
        label("+ playlists",
        0.2,
        35)
      }

    User -- Rating with {
        over = start(Position.TopRight).line(end(Position.Bottom))
        label("creates >",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("+ user",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("+ ratings",
        0.8,
        35)
      }

    Rating --> Song with {
        over = start(Position.Top).line(end(Position.BottomRight))
        label("< refers to",
        0.5,
        25, -(45))
        label("0..*",
        0.1, -(15))
        label("+ ratings",
        0.2, -(35))
        label("1",
        0.9, -(15))
        label("+ song",
        0.8, -(35))
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
  {
    groupName: "Gruppe 19",
    humanGrade: 50,
    code: `classDiagram {
    vdist = 400
    hdist = 600

    class("Rating") layout {
        pos = apos(0,
        0)
      }

    enum("Stars") {
        entries {
          "1"
          "2"
          "3"
          "4"
          "5"
        }
      } layout {
        pos = rpos(Rating, hdist / 2,
        100)
      }

    class("User", abstract = true) {
        public {
            name : String
        }
        private {
            createPlaylist(name : String) : void
            rateSong(stars : Stars, song : Song) : void
        }
      } layout {
        pos = rpos(Rating,
        0, vdist / 1.5)
      }

    class("PremiumUser") {
        public {
            premiumEnd : Date
        }
      } layout {
        pos = rpos(User, -(hdist / 2), vdist / 1.2)
      }

    class("FreeUser") {
        private {
            maxSkip : Integer
        }
      } layout {
        pos = rpos(User, hdist / 4 + 349, vdist / 1.2 + 32)
      }

    class("Playlist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(FreeUser, hdist / 2,
        0)
      }

    class("Song") {
        public {
            title : String
            lengthInSeconds : Integer
        }
      } layout {
        pos = rpos(Playlist,
        0, vdist / 1.2)
      }

    enum("Genres") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song,
        0, vdist / 1.2)
      }

    class("Album") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Song, hdist / 1.2,
        0)
      }

    class("Artist") {
        public {
            name : String
        }
      } layout {
        pos = rpos(Album,
        0, -(vdist / 1.2))
      }

    Rating --> User with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("isGivenBy v",
        0.5, -(25))
        label("0..*",
        0.1,
        15)
        label("ratings",
        0.2,
        35)
        label("1",
        0.9,
        15)
        label("user",
        0.8,
        35)
      }

    Rating --> Stars with {
        over = start(Position.Right).line(end(Position.Left))
        label("rating ^",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("rating",
        0.2,
        35)
      }

    Rating --> Song with {
        over = start(Position.Left).axisAligned(0, end(Position.Left))
        label("< rates",
        0.5, -(25))
        label("1",
        0.9,
        15)
        label("song",
        0.8,
        35)
      }

    User --> Playlist with {
        over = start(Position.Right).axisAligned(0.821, end(Position.Top))
        label("creates v",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("owner",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("playlists",
        0.8,
        35)
      }

    Playlist --> Song with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("contains v",
        0.5,
        25,
        90)
        label("0..*",
        0.9,
        15)
        label("songList",
        0.8,
        35)
      }

    Song --> Genres with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("0..*",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    Album *-- Song with {
        over = start(Position.Left).line(end(Position.Right))
        label("< contains",
        0.5, -(25))
        label("1",
        0.9,
        15)
        label("+album",
        0.8,
        35)
        label("1..*",
        0.1,
        15)
        label("+songList",
        0.2,
        35)
      }

    Artist <--> Album with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("has v",
        0.5,
        25,
        90)
        label("1",
        0.1,
        15)
        label("artist",
        0.2,
        35)
        label("0..*",
        0.9,
        15)
        label("albums",
        0.8,
        35)
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.BottomLeft))
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.BottomRight))
        label("1",
        0.9, -(15))
        label("owner",
        0.9, -(35))
      }
    }`,
  },
  {
    groupName: "Gruppe 20",
    humanGrade: 45,
    code: `classDiagram {
    vdist = 400
    hdist = 589

    class("Artist") {
        public {
            name : string
        }
      } layout {
        pos = apos(0,
        0)
      }

    class("Album") {
        public {
            name : string
        }
      } layout {
        pos = rpos(Artist, hdist,
        98)
      }

    class("Song") {
        public {
            title : String
            duration : int
            genre : Genre
        }
      } layout {
        pos = rpos(Album, hdist,
        0)
      }

    enum("Genre") {
        entries {
            POP
            ROCK
            JAZZ
            CLASSICAL
            ELECTRONIC
        }
      } layout {
        pos = rpos(Song, hdist,
        -91)
      }

    class("Rating") {
        public {
            stars : int
        }
      } layout {
        pos = rpos(Song,
        0, vdist)
      }

    class("User") {
        public {
            username : string
        }
      } layout {
        pos = rpos(Rating,
        0, vdist)
      }

    class("Playlist") {
        public {
            name : string
        }
      } layout {
        pos = rpos(User, hdist,
        0)
      }

    class("FreeUser") {
        public {
            maxSkippableSongsPerDay : int
        }
      } layout {
        pos = rpos(User, -(hdist / 3), vdist)
      }

    class("PremiumUser") {
        public {
            subEndDate : Date
        }
      } layout {
        pos = rpos(User, hdist / 3, vdist)
      }

    Artist *--> Album with {
        over = start(Position.Right).line(end(Position.Left))
        label("veröffentlicht >",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("0..* {unique}",
        0.9,
        15)
      }

    Album *--> Song with {
        over = start(Position.Right).line(end(Position.Left))
        label("enthält >",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("1..* {unique}",
        0.9,
        15)
      }

    Song -- Genre with {
        over = start(Position.Right).line(end(Position.Left))
        label("ist >",
        0.5, -(25))
        label("1..*",
        0.9,
        15)
      }

    Song <--> Rating with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("besitzt v",
        0.5, -(25),
        90)
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    Rating <--> User with {
        over = start(Position.Bottom).line(end(Position.Top))
        label("gibt aus ^",
        0.5, -(25),
        90)
        label("0..*",
        0.1,
        15)
        label("1",
        0.9,
        15)
      }

    User <--> Playlist with {
        over = start(Position.Right).line(end(Position.Left))
        label("erstellt >",
        0.5, -(25))
        label("1",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    Playlist --> Song with {
        over = start(Position.Top).axisAligned(0, end(Position.BottomRight))
        label("< hat",
        0.5,
        25, -(45))
        label("0..*",
        0.1,
        15)
        label("0..*",
        0.9,
        15)
      }

    FreeUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }

    PremiumUser extends User with {
        over = start(Position.Top).line(end(Position.Bottom))
      }
    }`,
  },
];
