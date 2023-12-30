import { myName } from "./constantValues"

const styles = {
  paperTitle: {
    marginBottom: "0.0em",
    color: "black",
  },
  venueType: {
    marginBottom: "0.2em",
    color: "#777777",
  },
  acceptanceRateInfo: {
    marginBottom: "0.2em",
    color: "#777777",
  },
}

const getPaperItem = (paper: PaperInfo) => {
  const displayNameEl = paper.authorNames.map((name, i) => {
    const nameString = i === paper.authorNames.length - 1 ? `${name}.` : `${name}, `
    const isAuthorMe = name.includes(myName)
    const nameEl = isAuthorMe ? <b>{nameString}</b> : <>{nameString}</>
    if (paper.firstAuthors.length === 1 || !paper.firstAuthors.includes(name)) {
      return nameEl
    }
    return (
      <>
        <span style={{ color: "red" }}>&clubs;</span> {nameEl}
      </>
    )
  })
  const urls = paper.urls
  const titleContent = urls.paper ? (
    <a href={urls.paper} target="_blank" style={styles.paperTitle}>
      {paper.title}
    </a>
  ) : (
    <div style={styles.paperTitle}>{paper.title}</div>
  )

  const getSourceInfo = (urls: MaterialURLs) => {
    const sourceInfo = []
    const getSourceContent = (urls: string[], srcNames: string[]) => {
      const elements = urls.map((url, i) => (
        <a href={url} target="_blank">
          {srcNames[i]}
        </a>
      ))
      return <>({elements.map((e, i) => (i !== elements.length - 1 ? <>{e}/</> : e))})</>
    }
    if (urls.arxiv) {
      sourceInfo.push(getSourceContent([urls.arxiv], ["arXiv"]))
    }
    if (urls.pdf) {
      sourceInfo.push(getSourceContent([urls.pdf], [!urls.arxiv ? "PDF" : "Outdated PDF"]))
    }
    if (urls.code) {
      sourceInfo.push(getSourceContent([urls.code], ["code"]))
    }
    if (urls.poster) {
      sourceInfo.push(getSourceContent([urls.poster], ["poster"]))
    }
    if (urls.slide) {
      if (urls.video && urls.videoTranscript) {
        sourceInfo.push(
          getSourceContent(
            [urls.slide, urls.video, urls.videoTranscript],
            ["slides", "video", "transcript"]
          )
        )
      } else if (urls.video) {
        sourceInfo.push(getSourceContent([urls.slide, urls.video], ["slides", "video"]))
      } else if (urls.videoTranscript) {
        sourceInfo.push(
          getSourceContent([urls.slide, urls.videoTranscript], ["slides", "transcript"])
        )
      } else {
        sourceInfo.push(getSourceContent([urls.slide], ["slides"]))
      }
    } else if (urls.video && urls.videoTranscript) {
      sourceInfo.push(
        getSourceContent([urls.video, urls.videoTranscript], ["video", "transcript"])
      )
    } else if (urls.video) {
      sourceInfo.push(getSourceContent([urls.video], ["video"]))
    }
    if (urls.shortVideo && urls.shortVideoTranscript) {
      sourceInfo.push(
        getSourceContent(
          [urls.shortVideo, urls.shortVideoTranscript],
          ["short video", "transcript"]
        )
      )
    }
    return sourceInfo
  }

  const sourceInfo = getSourceInfo(urls)
  const getAcceptanceRateEl = (acceptanceCount?: number, submissionCount?: number) => {
    if (!acceptanceCount || !submissionCount) {
      return <></>
    }
    const acceptanceRate = Math.round((acceptanceCount / submissionCount) * 100)
    return (
      <div style={styles.acceptanceRateInfo}>
        The acceptance rate was about{" "}
        <b>
          {acceptanceRate}% (={acceptanceCount}/{submissionCount})
        </b>
        .
      </div>
    )
  }
  // award more info
  // oral acceptance rate
  return (
    <>
      <li>
        <p style={{ marginBottom: "0.4em" }}>{titleContent}</p>
        <div style={{ marginBottom: "0.2em" }}>{displayNameEl}</div>
        <div style={styles.venueType}>
          {paper.venueName}. {paper.isOralPresentation ? "Oral Presentation." : null}
        </div>
        {paper.awardInfo ? (
          <>
            <span style={{ color: "red" }}>{paper.awardInfo}</span>
          </>
        ) : null}
        <div style={{ marginBottom: "0.2em" }}>
          {getAcceptanceRateEl(paper.acceptanceCount, paper.submissionCount)}
        </div>
        <></>
        <div style={{ marginBottom: "1.0em" }}>
          {sourceInfo.map((src, i) => (i === sourceInfo.length - 1 ? src : <>{src}, </>))}
        </div>
      </li>
      <hr />
    </>
  )
}

const getPaperElementByVenueType = (venueType: string, paperInfo: PaperInfo[]) => {
  if (paperInfo.every((paper) => paper.venueType !== venueType)) {
    return null
  }

  return paperInfo
    .filter((paper) => paper.venueType === venueType)
    .map((paper) => getPaperItem(paper))
}

const getPaperElementByYear = (year: number, paperInfo: PaperInfo[]) => {
  if (paperInfo.every((paper) => paper.publishedYear !== year)) {
    return null
  }

  return paperInfo
    .filter((paper) => paper.publishedYear === year)
    .map((paper) => getPaperItem(paper))
}

export default function PaperElementBy(props: {
  paperInfo: PaperInfo[]
  year?: number
  venueType?: string
}) {
  const [paperInfo, year, venueType] = [props.paperInfo, props.year, props.venueType]
  const isYearUndefined = Number(year === undefined)
  const isVenueTypeUndefined = Number(venueType === undefined)
  if (!(isYearUndefined ^ isVenueTypeUndefined)) {
    return null
  }
  if (year !== undefined) {
    return <>{getPaperElementByYear(year, paperInfo)}</>
  } else if (venueType !== undefined) {
    return <>{getPaperElementByVenueType(venueType, paperInfo)}</>
  } else {
    console.log("Got unexpected error in PaperElementBy.")
    return null
  }
}
