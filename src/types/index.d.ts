type MaterialURLs = {
  paper?: string
  arxiv?: string
  pdf?: string
  code?: string
  slide?: string
  poster?: string
  video?: string
  shortVideo?: string
  videoTranscript?: string
  shortVideoTranscript?: string
}

type PaperInfo = {
  title: string
  authorNames: string[]
  firstAuthors: string[]
  venueName: string
  venueNameAbbreviation?: string
  venueType: "Conference" | "Workshop" | "Journal" | "Preprint" | "Thesis" | "Talk"
  isOralPresentation?: boolean
  awardInfo?: string
  isJapaneseOnly?: boolean
  submissionCount?: number
  acceptanceCount?: number
  publishedYear: number
  publishedMonth: number
  isForthcoming?: boolean,
  urls: MaterialURLs
}
