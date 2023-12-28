import fetchPaperInfo from "./fetchPublications"

const PaperListPage = () => {
  const paperInfo = fetchPaperInfo().sort((paper1, paper2) =>
    paper2.publishedYear !== paper1.publishedYear
      ? paper2.publishedYear - paper1.publishedYear
      : paper2.publishedMonth - paper1.publishedMonth
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
  return (
    <>
      {paperInfo.map((paper) => {
        const displayNameEl = paper.authorNames.map((name, i) => {
          const nameString = i === paper.authorNames.length - 1 ? name : `${name}, `
          const isAuthorMe = name.includes("Shuhei Watanabe")
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
          <a href={urls.paper} target="_blank">
            {paper.title}
          </a>
        ) : (
          <>{paper.title}</>
        )
        const sourceInfo = getSourceInfo(urls)
        const getAcceptanceRateEl = (acceptanceCount?: number, submissionCount?: number) => {
          if (!acceptanceCount || !submissionCount) {
            return <></>
          }
          const acceptanceRate = Math.round((acceptanceCount / submissionCount) * 100)
          return (
            <>
              The acceptance rate was about{" "}
              <b>
                {acceptanceRate}% (={acceptanceCount}/{submissionCount})
              </b>
              .
            </>
          )
        }
        // award more info
        // oral acceptance rate
        return (
          <>
            <p>{titleContent}</p>
            <div>{displayNameEl}</div>
            <div>
              {paper.venueName}. {paper.isOralPresentation ? "Oral Presentation." : null}
            </div>
            {paper.awardInfo ? (
              <>
                <span style={{ color: "red" }}>{paper.awardInfo}</span>
              </>
            ) : null}
            <div>{getAcceptanceRateEl(paper.acceptanceCount, paper.submissionCount)}</div>
            <></>
            <p>{sourceInfo.map((src, i) => (i === sourceInfo.length - 1 ? src : <>{src}, </>))}</p>
          </>
        )
      })}
    </>
  )
}

export default PaperListPage
